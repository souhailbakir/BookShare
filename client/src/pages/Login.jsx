import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5001/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            // Store token
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // For Phase 2, we just verify login works. Redirect to a dashboard or home if we had one.
            // But we don't have dashboard yet. Let's redirect to Onboarding or stay here with alert.
            alert("Login Successful! Token stored.");
            // navigate("/dashboard"); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div className="container fade-in" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Welcome Back</h2>

                {error && <div style={{ background: "rgba(220,38,38,0.2)", color: "#fca5a5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Username</label>
                        <input name="username" value={formData.username} onChange={handleChange} required />
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Password</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Sign In</button>
                    <p style={{ marginTop: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
                        No account? <a href="/register" style={{ color: "var(--primary)" }}>Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
