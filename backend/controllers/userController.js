import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { departments, years } from "../utils/departments.js";
import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentsModel.js";
import { Follow } from "../models/follow.js";
import { Feedback } from "../models/feedbackModel.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Required fields missing", success: false });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already used", success: false });
    }

    let profilePhoto = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const result = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = result.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      department: "",
      role: "user",
      profilePhoto,
    });

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is blocked",
        success: false,
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "90d",
    });

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      role: user.role,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
    };

    const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: isProd, 
        sameSite: isProd ? "none" : "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .json({
        message: `Welcome back, ${user.fullName}`,
        user: userResponse,
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const logout = (req, res) => {
  return res
    .status(200)
    .cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: "strict" })
    .json({ message: "Logged out", success: true });
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, bio, department } = req.body;
    const file = req.file;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    if (file) {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri.content);
      user.profilePhoto = result.secure_url;
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (department) user.department = department;

    await user.save();

    return res.status(200).json({
      message: "Profile updated",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        role: user.role,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
      },
      success: true,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const createPost = async (req, res) => {
  try {
    const { caption, department, year } = req.body;

    const userId = req.id;

    if (!department || !year) {
      return res.status(400).json({
        message: "Department and year are required",
        success: false,
      });
    }

    if (!departments.includes(department)) {
      return res.status(400).json({
        message: "Invalid department",
        success: false,
      });
    }

    if (!years.includes(year)) {
      return res.status(400).json({
        message: "Invalid year",
        success: false,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one photo is required",
        success: false,
      });
    }

    const mediaPromises = req.files.map(async (file) => {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: file.mimetype.startsWith("video") ? "video" : "image",
        folder: "campus-posts",
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      };
    });

    const media = await Promise.all(mediaPromises);

    const post = await Post.create({
      user: userId,
      caption: caption || "",
      department,
      year,
      media,
    });

    await post.populate("user", "fullName profilePhoto");

    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.id;

    const followersCount = await Follow.countDocuments({ following: id });
    const followingCount = await Follow.countDocuments({ follower: id });
    const isFollowing = await Follow.findOne({ follower: currentUserId, following: id });

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const posts = await Post.find({ user: id, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      primaryImage: post.media?.[0]?.url || null,
      imageCount: post.media?.length || 0,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      isLiked: currentUserId ? post.likes?.includes(currentUserId) : false,
    }));

    return res.status(200).json({
      success: true,
      user,
      posts: formattedPosts,
      isFollowing: !!isFollowing,
      followers: followersCount,
      following: followingCount,
    });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getExplorePosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      department = "",
      year = "",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };
    if (department) filter.department = department;
    if (year) filter.year = year;

    let total = 0;

    if (search) {
      const countPipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { caption: { $regex: search, $options: "i" } },
              { "user.fullName": { $regex: search, $options: "i" } },
            ],
          },
        },
        { $count: "total" },
      ];
      const countResult = await Post.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } else {
      total = await Post.countDocuments(filter);
    }

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          caption: 1,
          media: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          department: 1,
          year: 1,
          "user.fullName": 1,
          "user.profilePhoto": 1,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { caption: { $regex: search, $options: "i" } },
            { "user.fullName": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const posts = await Post.aggregate(pipeline);
    const hasMore = skip + posts.length < total;

    console.log("BACKEND QUERY:", { page, limit, search, department, year });
    console.log("FILTER:", filter);
    console.log("TOTAL POSTS:", total);
    console.log("POSTS RETURNED:", posts.length);
    console.log("HAS MORE:", skip + posts.length < total);

    return res.status(200).json({
      success: true,
      posts,
      hasMore,
    });
  } catch (error) {
    console.error("Explore error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.id;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found or deleted", success: false });
    }

    const alreadyLiked = post.likes.includes(userId);

    const updateOp = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $push: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateOp,
      { new: true }
    ).select("likes");

    return res.status(200).json({
      success: true,
      likes: updatedPost.likes,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Like post error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.id;

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
    })
      .populate("user", "fullName username profilePhoto")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 }, limit: 5 },
        populate: { path: "user", select: "fullName profilePhoto" },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const formattedPost = {
      _id: post._id,
      caption: post.caption,
      media: post.media,
      likes: post.likes || [],
      comments: post.comments || [],
      createdAt: post.createdAt,
      department: post.department,
      year: post.year,
      location: post.location,
      author: {
        _id: post.user._id,
        username: post.user.username,
        name: post.user.fullName,
        profilePicture: post.user.profilePhoto,
      },
    };

    return res.status(200).json({
      success: true,
      post: formattedPost,
    });
  } catch (error) {
    console.error("Get post error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "fullName profilePhoto");

    const total = await Comment.countDocuments({ post: postId });
    const hasMore = skip + comments.length < total;

    return res.status(200).json({
      success: true,
      comments,
      hasMore,
      total,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.id;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty", success: false });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const comment = await Comment.create({
      text,
      user: userId,
      post: postId,
    });

    await comment.populate("user", "fullName profilePhoto");

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    return res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    if (post.media && post.media.length) {
      await Promise.all(
        post.media.map(m =>
          cloudinary.uploader.destroy(m.public_id, { resource_type: m.type })
        )
      );
    }

    post.isDeleted = true;
    post.media = [];
    await post.save();

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.id;

    if (targetId === userId) {
      return res.status(400).json({ message: "Cannot follow yourself", success: false });
    }

    const existing = await Follow.findOne({ follower: userId, following: targetId });
    if (existing) {
      return res.status(400).json({ message: "Already following", success: false });
    }

    await Follow.create({ follower: userId, following: targetId });

    res.json({ success: true, message: "Followed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.id;

    const result = await Follow.deleteOne({ follower: userId, following: targetId });
    if (result.deletedCount === 0) {
      return res.status(400).json({ message: "Not following", success: false });
    }

    res.json({ success: true, message: "Unfollowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.id;

    const followers = await Follow.find({ following: id })
      .populate("follower", "fullName username profilePhoto")
      .lean();

    const users = followers.map((follow) => ({
      _id: follow.follower._id,
      fullName: follow.follower.fullName,
      username: follow.follower.username,
      profilePhoto: follow.follower.profilePhoto,
      isFollowing: !!Follow.findOne({ follower: currentUserId, following: follow.follower._id }),
    }));

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Get followers error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.id;

    const following = await Follow.find({ follower: id })
      .populate("following", "fullName username profilePhoto")
      .lean();

    const users = following.map((follow) => ({
      _id: follow.following._id,
      fullName: follow.following.fullName,
      username: follow.following.username,
      profilePhoto: follow.following.profilePhoto,
      isFollowing: true,
    }));

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Get following error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    const userId = req.id;

    if (!type || !message?.trim()) {
      return res.status(400).json({ message: "Feedback type and message are required", success: false });
    }

    if (!["report", "opinion", "update", "feature"].includes(type)) {
      return res.status(400).json({ message: "Invalid feedback type", success: false });
    }

    await Feedback.create({
      user: userId,
      type,
      message,
    });

    return res.status(201).json({ message: "Feedback submitted successfully", success: true });
  } catch (err) {
    console.error("Submit feedback error:", err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    return res.status(200).json({
      success: true,
      totalUsers,
    });
  } catch (error) {
    console.error("Get user count error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const totalPosts = await Post.countDocuments({
      isDeleted: false,
      createdAt: { $gte: threeDaysAgo },
    });

    const posts = await Post.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: threeDaysAgo },
        },
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          caption: 1,
          media: 1,
          likes: 1,
          likesCount: 1,
          comments: 1,
          createdAt: 1,
          department: 1,
          year: 1,
          "user.fullName": 1,
          "user.profilePhoto": 1,
        },
      },
      {
        $sort: { likesCount: -1, createdAt: -1 },
      },
      { $limit: 3 },
    ]);


    posts.map((p) => ({
      id: p._id,
      caption: p.caption,
      likesCount: p.likesCount,
      createdAt: p.createdAt,
      user: p.user?.fullName || "Unknown",
    }))

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get trending posts error:", error.message, error.stack);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

