import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import passport from "passport";
import { getSafeUser } from "../helpers/getSafeUser.js";

// Login
export const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ success: false, message: info.message || "Login failed" });

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({ success: true, message: "Login successful", user: getSafeUser(user) });
        });
    })(req, res, next);
};

// Register
export const register = async (req, res) => {
    const { email, password, display_name } = req.body;

    try {
        const existingUser = await User.findByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        await User.createUser({ email, display_name, password: hashedPassword });
        return res.status(201).json({ success: true, message: "Register successful" });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const results = await User.findByEmail(email);
        let user = null;

        if (results.length > 0) {
            user = results[0];
        }

        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");

            const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
            const resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 ชม.

            await User.updateUser(user.user_id, {
                reset_token: resetTokenHash,
                reset_token_expire: resetTokenExpire,
            });

            // ส่ง email (ใช้ nodemailer + Gmail/SMTP)
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

            await transporter.sendMail({
                from: `"ORGA Flowlist" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Password Reset Request",
                html: `
          <p>You requested a password reset</p>
          <p>Click <a href="${resetUrl}">here</a> to reset your password</p>
          <p>This link is valid for 1 hour.</p>
        `,
            });
        }
        res.json({
            success: true,
            message: "If an account with that email exists, we sent a reset link.",
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const results = await User.findByResetToken(tokenHash);

        if (!results.length || new Date(results[0].reset_token_expire) < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateUser(user.user_id, {
            password: hashedPassword,
            reset_token: null,
            reset_token_expire: null,
        });

        res.json({ success: true, message: "Password reset successful" });

    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Login success
export const loginSuccess = (req, res) => {
    if (req.user) {
        return res.status(200).json({
            success: true,
            message: "successfull",
            user: getSafeUser(req.user),
        });
    } else {
        res.status(403).json({ success: false, message: "Not authorized" });
    }
};

// Logout
export const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect(process.env.CLIENT_URL);
    });
}