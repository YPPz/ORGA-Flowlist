import express from "express";
import { ensureAuth } from "../middlewares/auth.js";
import { ensureGoogleAccessToken } from "../middlewares/resetGoogleToken.js";
import { askAssistant } from "../controllers/assistController.js";

const router = express.Router();

router.post("/ask", ensureAuth, ensureGoogleAccessToken, askAssistant);

export default router;
