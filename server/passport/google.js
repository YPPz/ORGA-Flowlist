import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // 1. หา user จาก email ก่อน
    let existingUser = await User.findByEmail(email);

    if (existingUser.length) {
      const user = existingUser[0];
      if (user.provider !== 'google') {
        // เจอ email ซ้ำ แต่สมัครด้วย provider อื่น
        return done(null, false);
      }

      // ✅ provider = google → อัปเดต token
      await User.updateTokens(
        user.user_id,
        accessToken,
        refreshToken || user.provider_refresh_token
      );
      return done(null, { ...user, accessToken, refreshToken });
    }

    // 2. ถ้าไม่มี user → สมัครใหม่
    let avatarUrl = null;
    if (profile.photos?.length) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profile.photos[0].value, {
          folder: "avatars",
          public_id: `google_${profile.id}`
        });
        avatarUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const newUser = {
      email,
      display_name: profile.displayName,
      provider: 'google',
      provider_id: profile.id,
      avatar: avatarUrl,
      provider_access_token: accessToken,
      provider_refresh_token: refreshToken,
    };
    const result = await User.createUser(newUser);
    newUser.user_id = result.insertId;
    done(null, newUser);

  } catch (err) {
    done(err);
  }
}));
