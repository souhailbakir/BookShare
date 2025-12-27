import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)"
        }}>
            <div className="container fade-in">
                <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", lineHeight: "1.1" }}>
                    Discover Books <br />
                    <span style={{ color: "var(--primary)" }}>Tailored to You.</span>
                </h1>
                <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 2rem auto" }}>
                    Join our community to get personalized book recommendations based on your unique interests and hobbies.
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button className="btn btn-primary" onClick={() => navigate("/register")}>
                        Get Started
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate("/login")}>
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Landing;
