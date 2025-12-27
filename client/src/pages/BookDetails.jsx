import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

    const fetchBook = () => {
        setLoading(true);
        fetch(`http://localhost:5001/api/books/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setBook(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBook();
    }, [id]);

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to rate.");
            navigate("/login");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5001/api/books/${id}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                alert("Rating submitted!");
                setComment("");
                fetchBook(); // Refresh to see new rating
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit rating");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting rating");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: "2rem", color: "white" }}>Loading...</div>;
    if (!book) return <div style={{ padding: "2rem", color: "white" }}>Book not found.</div>;

    return (
        <div style={{ paddingBottom: "4rem" }}>
            <header style={{ borderBottom: "1px solid var(--border)", padding: "1rem 0", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary)", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>BookShare</div>
                    <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                </div>
            </header>

            <main className="container fade-in" style={{ marginTop: "2rem", maxWidth: "900px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                    {/* Left Column: Image */}
                    <div>
                        <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                            {book.coverUrl ? (
                                <img src={book.coverUrl} alt={book.title} style={{ width: "100%", display: "block" }} />
                            ) : (
                                <div style={{ height: "300px", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>No Cover</div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div>
                        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{book.title}</h1>
                        <h2 style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "1rem" }}>by {book.author}</h2>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                            <span style={{ background: "rgba(244, 63, 94, 0.1)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.9rem" }}>
                                {book.category}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", color: "#fbbf24", fontWeight: "bold" }}>
                                <span style={{ fontSize: "1.2rem", marginRight: "4px" }}>★</span>
                                {book.averageRating ? book.averageRating.toFixed(1) : "No ratings"}
                                <span style={{ color: "var(--text-muted)", fontWeight: "normal", marginLeft: "4px", fontSize: "0.9rem" }}>
                                    ({book.ratings?.length || 0} reviews)
                                </span>
                            </div>
                        </div>

                        <p style={{ lineHeight: "1.6", color: "#e2e8f0", marginBottom: "2rem" }}>
                            {book.description || "No description available."}
                        </p>

                        {/* Rating Form */}
                        <div style={{ background: "var(--bg-card)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
                            <h3 style={{ marginTop: 0 }}>Add Your Rating</h3>
                            <form onSubmit={handleSubmitRating}>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Rating</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "var(--bg-dark)", color: "white", border: "1px solid var(--border)" }}
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Comment</label>
                                    <textarea
                                        rows="3"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Write a brief review..."
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "var(--bg-dark)", color: "white", border: "1px solid var(--border)", resize: "vertical" }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <section style={{ marginTop: "3rem" }}>
                    <h2 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>Reviews</h2>
                    {book.ratings && book.ratings.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {book.ratings.slice().reverse().map((r, idx) => (
                                <div key={idx} style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <span style={{ fontWeight: "bold" }}>{r.username || "Anonymous"}</span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(r.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ color: "#fbbf24", marginBottom: "0.5rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                                    <p style={{ margin: 0, color: "#cbd5e1" }}>{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "var(--text-muted)" }}>No reviews yet. Be the first to add one!</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default BookDetails;
