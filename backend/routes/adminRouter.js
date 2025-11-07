import express from "express";
import { blockUser, getAllFeedbacks, getAllUsers, unblockUser } from "../controllers/adminController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/users", isAuthenticated, getAllUsers);
router.post("/block/:id", isAuthenticated, blockUser);
router.post("/unblock/:id", isAuthenticated, unblockUser);
router.get("/feedbacks", isAuthenticated, getAllFeedbacks);

export default router;