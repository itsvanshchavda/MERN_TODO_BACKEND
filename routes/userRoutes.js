import { Router } from "express";
import passport from "passport";
import session from "express-session";

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

// Google Auth

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const { displayName, photos } = req.user;
    const userName = displayName;
    const userProfilePicture =
      photos && photos.length > 0 ? photos[0].value : null;

    res.json({ userName, userProfilePicture });
    res.redirect("/profile");
  }
);

router.get("/auth/google/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("http://localhost:5173/");
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://mern-todo-backend-version-2.onrender.com/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      // Handle errors properly or replace 'err' with null
      // For example:
      if (!profile) {
        return done(null, false);
      }
      // If authentication succeeds, pass the user profile to the next middleware
      return done(null, profile);
    }
  )
);

export default router;
