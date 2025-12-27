import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Profile Fields
    ageGroup: { type: String, default: "" },
    gender: { type: String, default: "" },
    readingFrequency: { type: String, default: "" },

    hobbies: { type: [String], default: [] },
    interests: { type: [String], default: [] },

    // New: Favorites
    favorites: { type: [String], default: [] }, // Stores Book _ids

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
