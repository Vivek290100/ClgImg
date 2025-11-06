import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Please log out and log back in to continue", success: false });
    }

    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res.status(403).json({ message: "Token expired", success: false });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if user is blocked
    if (!user.isActive) {
      return res.status(403).json({ 
        message: "Your account is blocked. Please log out.", 
        success: false, 
        blocked: true 
      });
    }

    req.id = decoded.userId;

    // Check role if requiredRole is provided by ProtectedRoute
    if (req.requiredRole && user.role !== req.requiredRole) {
      return res.status(403).json({ message: "Unauthorized: Admin access required", success: false });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

export default isAuthenticated;