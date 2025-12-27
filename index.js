import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Book from "./models/Book.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/Booksdbs")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

app.listen(5001, () => {
    console.log("Server running on http://localhost:5001");
});
