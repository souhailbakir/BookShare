import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, default: "General" },
    description: { type: String },
    coverUrl: { type: String },
    publisher: { type: String },
    publishedDate: { type: String },
    pageCount: { type: Number },
    addedBy: { type: String, default: "System" },
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            username: String,
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: String,
            date: { type: Date, default: Date.now }
        }
    ],
    averageRating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model("Book", BookSchema);
export default Book;
