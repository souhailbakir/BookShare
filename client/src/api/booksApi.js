
// Simple wrapper around Open Library Search API to return normalized book objects
export async function fetchBooksFromOpenLibrary() {
  try {
    // Use a generic query to return a broad set of books
    const res = await fetch("https://openlibrary.org/search.json?q=the&limit=50");
    if (!res.ok) throw new Error("OpenLibrary fetch failed");
    const data = await res.json();

    const books = (data.docs || []).map((doc) => {
      const coverId = doc.cover_i;
      const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
      return {
        _id: doc.key || `${doc.title}_${doc.first_publish_year}`,
        title: doc.title,
        author: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : doc.author_name || "Unknown",
        category: Array.isArray(doc.subject) ? doc.subject[0] : (doc.subject ? doc.subject : ""),
        publishedYear: doc.first_publish_year || doc.publish_year?.[0] || "",
        coverUrl,
        source: "openlibrary",
      };
    });

    return books;
  } catch (err) {
    console.error("booksApi.fetchBooksFromOpenLibrary:", err);
    return [];
  }
}

export async function fetchBooks() {
  try {
    const res = await fetch("http://localhost:5001/api/books");
    if (!res.ok) throw new Error("Failed to fetch from DB");
    return await res.json();
  } catch (err) {
    console.error("booksApi.fetchBooks:", err);
    return [];
  }
}
