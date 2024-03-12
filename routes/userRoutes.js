import { Router } from "express";


import {
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.js";
import { isAuthenticated } from "../middleware/auth.js";


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logoutUser);

export default router;
