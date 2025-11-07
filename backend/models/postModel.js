import mongoose from "mongoose";
import { departments, years } from "../utils/departments.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      enum: departments,
      required: true,
    },
    year: {
      type: String,
      enum: years,
      required: true,
    },
    media: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        type: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
postSchema.index({ isDeleted: 1 });

export const Post = mongoose.model("Post", postSchema);