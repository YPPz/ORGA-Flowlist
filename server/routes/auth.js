import express from "express";
import passport from "passport";
import { login, register, forgotPassword, resetPassword, loginSuccess, logout } from "../controllers/authController.js";

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL;

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/login/success", loginSuccess);
router.get("/logout", logout);

// Facebook
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook", {
  successRedirect: CLIENT_URL,
  failureRedirect: `${CLIENT_URL}/login?error=${encodeURIComponent("This email is already registered with another login method.")}`
}));

// Google
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
  accessType: "offline",
}));
router.get("/google/callback", passport.authenticate("google", {
  successRedirect: CLIENT_URL,
  failureRedirect: `${CLIENT_URL}/login?error=${encodeURIComponent("This email is already registered with another login method.")}`,
}));

export default router;
