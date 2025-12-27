import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Reuse categories for consistency
const CATEGORIES = [
    "Science Fiction", "History", "Romance", "Thriller", "Fantasy",
    "Mystery", "Biography", "Business", "Self-Help", "Horror",
    "Science", "Art", "Cooking", "Classic"
];

const AddBook = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        category: CATEGORIES[0],
        description: "",
        coverUrl: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5001/api/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    addedBy: user.username
                })
            });

            if (!res.ok) throw new Error("Failed to add book");

            alert("Book added successfully!");
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)", padding: "2rem" }}>
            <div className="container fade-in" style={{ width: "100%", maxWidth: "500px", background: "#1e293b", padding: "2rem", borderRadius: "12px" }}>
                <h2 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Share a Book</h2>

                {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} required placeholder="Book Title" />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Author</label>
                        <input name="author" value={formData.author} onChange={handleChange} required placeholder="Author Name" />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Cover Image URL (Optional)</label>
                        <input name="coverUrl" value={formData.coverUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            style={{
                                width: "100%",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                                color: "var(--text-main)",
                                padding: "0.75rem",
                                borderRadius: "6px",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Book</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBook;
