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

// 1. Register User
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

// Middleware: Verify Token
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

// 3. Get User Favorites (Protected)
app.get("/api/user/favorites", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // In a real app, you'd populate() or fetch books by ID here.
        // For now we just return the IDs or empty list.
        res.json(user.favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get favorites" });
    }
});

app.listen(5001, () => {
    console.log("Server running on http://localhost:5001");
});
