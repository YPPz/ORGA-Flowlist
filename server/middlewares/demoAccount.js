import cron from "node-cron";
import { listEventsRaw, deleteEventRaw } from "../controllers/eventController.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

// Middleware: set demo session
export const checkDemoSession = (req, res, next) => {
    const demoEmail = "demo@gmail.com";
    if (req.user?.email === demoEmail && req.session) {
        const now = Date.now();
        const loginTime = req.session.demoLoginTime || now;
        req.session.demoLoginTime = loginTime;

        if (now - loginTime > 30 * 60 * 1000) {
             console.log("⏰ Demo session expired, destroying session...");
            req.session.destroy(err => {
                if (err) console.error(err);
                return res.status(401).json({ message: "Demo session expired" });
            });
        } else {
            next();
        }
    } else {
        next();
    }
};

// Helper: reset demo data
export const scheduleDemoReset = () => {
    cron.schedule("0 0,12 * * *", async () => {
        try {
            const demoEmail = "demo@gmail.com";
            const users = await User.findByEmail(demoEmail);
            if (!users.length) return;
            const user = users[0];

            // Delete all events
            const events = await listEventsRaw(user, null);
            for (const event of events) {
                await deleteEventRaw(user, event.event_id, null);
            }

            // Delete all categories
            const categories = await Category.getAllCategoriesByUser(user.user_id);
            for (const category of categories) {
                await Category.deleteCategory(category.category_id, user.user_id);
            }

            console.log("✅ Demo account events and categories reset successfully");

        } catch (err) {
            console.error("❌ Error resetting demo account:", err);
        }
    });
};