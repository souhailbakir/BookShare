import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Book from "./models/Book.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/Booksdbs")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const SECRET_KEY = "my_super_secret_key"; // In prod, use .env

// --- Routes ---

// 1. Register User (with preferences)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, ageGroup, gender, readingFrequency, hobbies, interests } = req.body;

    // Check if user exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      ageGroup,
      gender,
      readingFrequency,
      hobbies: hobbies || [],
      interests: interests || []
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    // Return user info too so frontend can use preferences immediately if needed
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        interests: user.interests
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Get Recommendations (Protected-ish, or just pass ID/Interests)
// For simplicity, we'll accept a list of interests in the query or body for now,
// OR usually, we verify the token and get interests from DB. Let's verify token.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

app.get("/api/recommendations", verifyToken, async (req, res) => {
  try {
    // Fetch full user to get latest interests
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const interests = user.interests.map(i => i.toLowerCase());

    // Logic: Find books where 'category' or 'subject' contains any of the user's interests.
    // Also, if no interests, maybe return random books?

    let query = {};
    if (interests.length > 0) {
      // Create a regex for each interest to match strictly or loosely? 
      // Let's do a simple $in with Regex if possible, or just exact match if data is clean.
      // Assuming 'category' field in book schema stores genre string.
      // We will try to match partial strings (e.g. interest "Space" matches category "Space Opera")
      const regexInterests = interests.map(i => new RegExp(i, "i"));

      query = {
        $or: [
          { category: { $in: regexInterests } },
          { title: { $in: regexInterests } } // Maybe title contains interest?
        ]
      };
    }

    const books = await mongoose.connection.db
      .collection("books")
      .find(query)
      .limit(20)
      .toArray();

    // If no specific matches found (or no interests), fall back to returning some books
    if (books.length === 0) {
      const fallbackBooks = await mongoose.connection.db.collection("books").find().limit(20).toArray();
      return res.json({ recommended: [], others: fallbackBooks, message: "No specific matches found, showing popular books." });
    }

    res.json({ recommended: books, others: [], message: "Found books based on your interests!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Get All Books (for browsing)
app.get("/api/books", async (req, res) => {
  const books = await mongoose.connection.db.collection("books").find().limit(50).toArray();
  res.json(books);
});

// 5. Seed Database (Populate with real books)
app.post("/api/seed", async (req, res) => {
  try {
    const subjects = [
      "science_fiction", "history", "romance", "thriller", "fantasy",
      "mystery", "horror", "biography", "science", "art",
      "cooking", "business", "classic", "music", "health"
    ];
    let allBooks = [];

    // Clear existing for a fresh start logic? Or just append. Let's clear for demo purity if requested, but append is safer.
    await mongoose.connection.db.collection("books").deleteMany({});

    console.log("Starting massive seed...");

    for (const sub of subjects) {
      // Increase limit to 100 per subject
      try {
        const resp = await fetch(`https://openlibrary.org/subjects/${sub}.json?limit=100`);
        const data = await resp.json();

        const works = data.works || [];
        const mapped = works.map(w => ({
          title: w.title,
          author: w.authors?.[0]?.name || "Unknown",
          category: data.name || sub, // Generic category
          coverUrl: w.cover_id ? `https://covers.openlibrary.org/b/id/${w.cover_id}-M.jpg` : null,
          description: "",
          source: "openlibrary"
        }));

        allBooks = [...allBooks, ...mapped];
        console.log(`Fetched ${mapped.length} books for ${sub}`);
      } catch (e) {
        console.error(`Failed to fetch ${sub}:`, e.message);
      }
    }

    if (allBooks.length > 0) {
      await mongoose.connection.db.collection("books").insertMany(allBooks);
    }

    res.json({ message: `Imported ${allBooks.length} real books into the database!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to seed data" });
  }
});

// 6. External Search (Proxy)
app.get("/api/external/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`);
    const data = await resp.json();

    const books = (data.docs || []).map((doc) => ({
      title: doc.title,
      author: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : doc.author_name,
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      publishedYear: doc.first_publish_year,
      category: doc.subject?.[0]
    }));

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "External fetch failed" });
  }
});

// 7. Add Book (User submitted)
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, category, description, coverUrl, addedBy } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "Title and Author are required" });
    }

    const newBook = {
      title,
      author,
      category: category || "General",
      description: description || "",
      coverUrl: coverUrl || null,
      addedBy: addedBy || "Anonymous", // Could use user ID if we verified token
      createdAt: new Date(),
      source: "user"
    };

    const result = await mongoose.connection.db.collection("books").insertOne(newBook);
    res.status(201).json({ message: "Book added successfully", bookId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// 8. Search Books (Local)
app.get("/api/books/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");
    const books = await mongoose.connection.db.collection("books").find({
      $or: [{ title: regex }, { author: regex }, { category: regex }]
    }).limit(20).toArray();

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 9. Add to Favorites
app.post("/api/user/favorites", verifyToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: bookId } });
    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to favorite" });
  }
});

// 10. Remove from Favorites
app.delete("/api/user/favorites/:bookId", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: req.params.bookId } });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfavorite" });
  }
});

// 11. Get User Favorites
app.get("/api/user/favorites", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch the actual book objects
    // Need to convert string IDs to ObjectIds if they are stored as ObjectIds in books collection
    // However, our seed script might store them as ObjectIds.
    // Let's assume user.favorites contains strings.
    const importMongodb = await import("mongodb");
    const objectIds = user.favorites.map(id => {
      try { return new importMongodb.ObjectId(id); } catch (e) { return null; }
    }).filter(id => id);

    const books = await mongoose.connection.db.collection("books").find({
      _id: { $in: objectIds }
    }).toArray();

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// 12. Get Single Book Details
app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let book;

    // Valid Mongoose ID?
    if (mongoose.Types.ObjectId.isValid(id)) {
      book = await Book.findById(id);
    } else {
      // Maybe it's a string ID from seed (unlikely with new schema but possible)
      // or user just passed invalid ID.
      return res.status(404).json({ error: "Invalid Book ID" });
    }

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 13. Rate a Book
app.post("/api/books/:id/rate", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    // Check if user already rated
    const existingRating = book.ratings.find(r => r.user.toString() === req.user.id);
    if (existingRating) {
      // Update existing
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.date = new Date();
    } else {
      // Add new
      book.ratings.push({
        user: req.user.id,
        username: req.user.username,
        rating,
        comment
      });
    }

    // Recalculate average
    const total = book.ratings.reduce((acc, curr) => acc + Number(curr.rating), 0);
    book.averageRating = total / book.ratings.length;

    await book.save();
    res.json({ message: "Rating submitted", averageRating: book.averageRating, ratings: book.ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rate book" });
  }
});

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});
