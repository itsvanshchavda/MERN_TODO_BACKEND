import { Router } from "express";

import {
  forgotPassword,
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../controller/user.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logoutUser);

router.post("/forgotpassword" , forgotPassword);
router.post("/resetpassword/:token", resetPassword);


export default router;
