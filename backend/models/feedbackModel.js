import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["report", "opinion", "update", "feature"],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, "Feedback message cannot exceed 5000 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Feedback = mongoose.model("Feedback", feedbackSchema);