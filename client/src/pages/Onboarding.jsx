import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Predefined Options
const AGE_GROUPS = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Occasionally"];

const HOBBIES_LIST = [
    "Gaming", "Cooking", "Traveling", "Photography", "Music",
    "Art/Design", "Technology", "Sports", "Nature/Hiking", "Writing",
    "Movies", "Fitness"
];

const INTERESTS_LIST = [
    "Science Fiction", "History", "Romance", "Thriller", "Fantasy",
    "Mystery", "Biography", "Business", "Self-Help", "Horror"
];

const Chip = ({ label, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            border: selected ? "1px solid var(--primary)" : "1px solid var(--border)",
            background: selected ? "rgba(244, 63, 94, 0.2)" : "var(--bg-card)",
            color: selected ? "var(--primary)" : "var(--text-muted)",
            margin: "0.25rem",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s"
        }}
    >
        {label}
    </button>
);

const Onboarding = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        ageGroup: AGE_GROUPS[1], // Default 18-24
        gender: GENDERS[3],     // Default Prefer not to say
        readingFrequency: FREQUENCIES[1],
        hobbies: [],
        interests: []
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSelection = (field, value) => {
        const current = formData[field];
        if (current.includes(value)) {
            setFormData({ ...formData, [field]: current.filter(item => item !== value) });
        } else {
            setFormData({ ...formData, [field]: [...current, value] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5001/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            alert("Profile completed! Please log in.");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)", padding: "2rem 0" }}>
            <div className="container fade-in" style={{ width: "100%", maxWidth: "600px", background: "#0f172a" }}>
                <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Build Your Profile</h2>
                <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
                    Tell us about yourself so we can curate the best books for you.
                </p>

                {error && <div style={{ background: "rgba(220,38,38,0.2)", color: "#fca5a5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Account Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Username</label>
                            <input name="username" value={formData.username} onChange={handleChange} required placeholder="username" />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Password</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                        </div>
                    </div>

                    {/* Demographics */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Age Group</label>
                            <select name="ageGroup" value={formData.ageGroup} onChange={handleChange}>
                                {AGE_GROUPS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                {GENDERS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Reading Freq</label>
                            <select name="readingFrequency" value={formData.readingFrequency} onChange={handleChange}>
                                {FREQUENCIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Hobbies */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Hobbies (Select all that apply)</label>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {HOBBIES_LIST.map(hobby => (
                                <Chip
                                    key={hobby}
                                    label={hobby}
                                    selected={formData.hobbies.includes(hobby)}
                                    onClick={() => toggleSelection("hobbies", hobby)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Book Categories (Select favorites)</label>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {INTERESTS_LIST.map(genre => (
                                <Chip
                                    key={genre}
                                    label={genre}
                                    selected={formData.interests.includes(genre)}
                                    onClick={() => toggleSelection("interests", genre)}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Complete Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
