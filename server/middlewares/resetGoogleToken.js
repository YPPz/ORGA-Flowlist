import { google } from "googleapis";
import User from "../models/User.js";

export async function ensureGoogleAccessToken(req, res, next) {
  try {
    const userId = req.user.user_id;
    const [user] = await User.getUserById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.provider !== "google" || !user.provider_access_token) {
      return next();
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      access_token: user.provider_access_token,
      refresh_token: user.provider_refresh_token,
    });

    try {
      // ตรวจสอบ token validity
      await oAuth2Client.getTokenInfo(user.provider_access_token);
      // token ยัง valid
      req.googleAccessToken = user.provider_access_token;
    } catch (err) {
      // ถ้า access token หมดอายุ → refresh
      const newTokens = await oAuth2Client.refreshAccessToken();
      const { access_token } = newTokens.credentials;

      // อัปเดต DB
      await User.updateTokens(userId, access_token, user.provider_refresh_token);

      req.googleAccessToken = access_token;
    }

    req.googleRefreshToken = user.provider_refresh_token;
    next();
  } catch (err) {
    console.error("Google token middleware error:", err);
    return res.status(500).json({ message: "Failed to refresh Google token" });
  }
}
