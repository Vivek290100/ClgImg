// src/controllers/adminController.js
import { User } from "../models/userModel.js";
import { Follow } from "../models/follow.js";
import { Post } from "../models/postModel.js";
import { Feedback } from "../models/feedbackModel.js";

// GET ALL NON-ADMIN USERS
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.id;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    const users = await User.find({ role: "user" }).lean();
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const followersCount = await Follow.countDocuments({ following: user._id });
        const postsCount = await Post.countDocuments({ user: user._id, isDeleted: false });
        return {
          _id: user._id,
          fullName: user.fullName || "Unknown User",
          email: user.email,
          username: user.username || user.email.split("@")[0],
          department: user.department || "",
          bio: user.bio || "",
          profilePhoto: user.profilePhoto || "",
          isActive: user.isActive,
          followersCount,
          postsCount,
        };
      })
    );

    res.status(200).json({ success: true, users: usersWithDetails });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// BLOCK USER
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.id;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot block an admin", success: false });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "User blocked", success: true });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// UNBLOCK USER
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.id;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "User unblocked", success: true });
  } catch (err) {
    console.error("Unblock user error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllFeedbacks = async (req, res) => {
    console.log("feeeed");
    
  try {
    // Fetch all feedbacks and populate the user field with relevant details
    const feedbacks = await Feedback.find()
      .populate("user", "fullName email profilePhoto")
      .sort({ createdAt: -1 }); // Sort by newest first

    return res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching feedbacks",
    });
  }
};