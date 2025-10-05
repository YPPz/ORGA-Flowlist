import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:5100/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || null;

    // 1. หา user จาก email ก่อน
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser.length) {
        const user = existingUser[0];
        if (user.provider !== 'facebook') {
          return done(null, false);
        }
        return done(null, user);
      }
    }

    // 2. ถ้าไม่เจอ user → สมัครใหม่
    const newUser = {
      email,
      display_name: profile.displayName,
      provider: 'facebook',
      provider_id: profile.id,
      avatar: profile.photos?.[0]?.value || null
    };
    const result = await User.createUser(newUser);
    newUser.user_id = result.insertId;
    done(null, newUser);

  } catch (err) {
    done(err);
  }
}));
