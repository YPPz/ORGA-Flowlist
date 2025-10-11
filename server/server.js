import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from './passport/index.js';
import authRoute from './routes/auth.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/category.js';
import assistRoutes from "./routes/assist.js";
import eventRoutes from "./routes/event.js"
import { scheduleDemoReset, checkDemoSession } from './middlewares/demoAccount.js';

const app = express();

// --- Global security & parsing middlewares ---
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later."
});
app.use(limiter);
app.use(express.json());

app.use(cors({
  origin: [process.env.CLIENT_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// --- Session & Passport setup ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Auth routes (login / logout / etc.) ---
app.use("/auth", authRoute);

// --- Set session for Demo Account ---
app.use(checkDemoSession);

// --- Protected routes (ต้องตรวจ session ทุกครั้ง) ---
app.use("/api/assist", assistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calendar", eventRoutes);
app.use("/api/categories", categoryRoutes);

// --- Error handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// --- Start server ---
const port = process.env.PORT || 5100;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// --- Demo reset data ---
scheduleDemoReset();

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});
