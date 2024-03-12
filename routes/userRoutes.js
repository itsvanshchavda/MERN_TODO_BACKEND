import { Router } from "express";
import passport from "passport";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth2";

import {
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { User } from "../model/user.js";

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
    console.log("Google OAuth successful. User:", req.user);
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
      clientID: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
      callbackURL:
        "https://mern-todo-backend-version-2.onrender.com/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log("GoogleStrategy callback:", profile);
      User.create({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  )
);

export default router;
