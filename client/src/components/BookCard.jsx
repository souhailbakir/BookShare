import { useNavigate } from "react-router-dom";

const BookCard = ({ book, isFavorite, onToggleFavorite }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/book/${book._id}`)}
            style={{
                background: "var(--bg-card)",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                position: "relative",
                cursor: "pointer"
            }}>
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    onToggleFavorite(book._id);
                }}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: isFavorite ? "var(--primary)" : "white",
                    fontSize: "1.2rem",
                    transition: "all 0.2s",
                    zIndex: 2
                }}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
                ♥
            </button>

            <div style={{ height: "200px", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <span style={{ color: "var(--text-muted)" }}>No Cover</span>
                )}
            </div>

            <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{book.title}</h3>
                <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "0.9rem" }}>{book.author}</p>

                {book.description && (
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {book.description}
                    </p>
                )}

                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                    <span style={{
                        fontSize: "0.75rem",
                        background: "rgba(244, 63, 94, 0.1)",
                        color: "var(--primary)",
                        padding: "4px 8px",
                        borderRadius: "4px"
                    }}>
                        {book.category || "General"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
