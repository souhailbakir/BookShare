import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ recommended: [], others: [] });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    // Store full book objects for favorites list, but use IDs for quick lookup
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [showFavorites, setShowFavorites] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const fetchFavorites = (token) => {
        fetch("http://localhost:5001/api/user/favorites", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setFavoriteBooks(data);
            })
            .catch(console.error);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Load main data
        fetch("http://localhost:5001/api/recommendations", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    handleLogout();
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Load favorites
        fetchFavorites(token);

    }, [navigate]);

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`http://localhost:5001/api/books/search?q=${encodeURIComponent(searchQuery)}`)
                .then(r => r.json())
                .then(res => setSearchResults(res))
                .catch(console.error);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleFavorite = async (bookId) => {
        const token = localStorage.getItem("token");
        const isFav = favoriteBooks.some(b => b._id === bookId);

        // For optimistic update, we need the book object if adding. 
        // If removing, easy. If adding, we might need to find it in data.recommended/others/search

        let updatedFavs = [...favoriteBooks];
        if (isFav) {
            updatedFavs = updatedFavs.filter(b => b._id !== bookId);
        } else {
            // Find book object to add
            const allSource = [...data.recommended, ...data.others, ...searchResults];
            const bookToAdd = allSource.find(b => b._id === bookId);
            if (bookToAdd) updatedFavs.push(bookToAdd);
        }

        setFavoriteBooks(updatedFavs);

        try {
            const method = isFav ? "DELETE" : "POST";
            const url = isFav
                ? `http://localhost:5001/api/user/favorites/${bookId}`
                : `http://localhost:5001/api/user/favorites`;

            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: isFav ? undefined : JSON.stringify({ bookId })
            });
        } catch (err) {
            console.error("Failed to toggle favorite", err);
            // Revert is complex without reloading, but acceptable for MVP
            fetchFavorites(token);
        }
    };

    const favoriteIds = favoriteBooks.map(b => b._id);

    if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading your recommendations...</div>;

    return (
        <div style={{ paddingBottom: "4rem" }}>
            <header style={{ borderBottom: "1px solid var(--border)", padding: "1rem 0", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary)" }}>BookShare</div>

                    <input
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowFavorites(false); }}
                        style={{ margin: 0, width: "300px", background: "var(--bg-dark)" }}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button
                            className={`btn ${showFavorites ? "btn-primary" : "btn-ghost"}`}
                            style={{ borderRadius: "20px", fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                            onClick={() => setShowFavorites(!showFavorites)}
                        >
                            {showFavorites ? "Showing Favorites" : "♥ Favorites"}
                        </button>

                        <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }} onClick={() => navigate("/add-book")}>
                            + Add Book
                        </button>
                        <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>Logout</button>
                    </div>
                </div>
            </header>

            <main className="container fade-in" style={{ marginTop: "2rem" }}>

                {/* VIEW: Search Results */}
                {searchQuery && (
                    <section style={{ marginBottom: "3rem" }}>
                        <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Search Results</h2>
                        {searchResults.length === 0 ? <p>No books found.</p> : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                                {searchResults.map(book => (
                                    <BookCard
                                        key={book._id}
                                        book={book}
                                        isFavorite={favoriteIds.includes(book._id)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* VIEW: Favorites Only */}
                {!searchQuery && showFavorites && (
                    <section style={{ marginBottom: "3rem" }}>
                        <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Your Favorites</h2>
                        {favoriteBooks.length === 0 ? <p style={{ color: "var(--text-muted)" }}>You haven't added any favorites yet.</p> : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                                {favoriteBooks.map(book => (
                                    <BookCard
                                        key={book._id}
                                        book={book}
                                        isFavorite={true}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* VIEW: Default (Recommendations) */}
                {!searchQuery && !showFavorites && (
                    <>
                        {data.recommended && data.recommended.length > 0 && (
                            <section style={{ marginBottom: "3rem" }}>
                                <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Recommended for You</h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                                    {data.recommended.map(book => (
                                        <BookCard
                                            key={book._id}
                                            book={book}
                                            isFavorite={favoriteIds.includes(book._id)}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
                                {data.recommended && data.recommended.length > 0 ? "Other Books You Might Like" : "Popular Books"}
                            </h2>
                            {data.message && <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{data.message}</p>}

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                                {(data.others && data.others.length > 0 ? data.others : []).map(book => (
                                    <BookCard
                                        key={book._id}
                                        book={book}
                                        isFavorite={favoriteIds.includes(book._id)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
