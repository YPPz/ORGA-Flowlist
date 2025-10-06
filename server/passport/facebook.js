import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:5100/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || null;

    // 1. Find user by email 
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser.length) {
        const user = existingUser[0];

        if (user.provider !== 'facebook') {
          return done(null, false);
        }

        await User.updateTokens?.(
          user.user_id,
          accessToken,
          refreshToken || user.provider_refresh_token
        );

        return done(null, { ...user, accessToken, refreshToken });
      }
    }

    // 2. If user not found → create a new account
    let avatarUrl = null;
    if (profile.photos?.length) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profile.photos[0].value, {
          folder: "avatars",
          public_id: `facebook_${profile.id}`,
        });
        avatarUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const newUser = {
      email,
      display_name: profile.displayName,
      provider: 'facebook',
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
