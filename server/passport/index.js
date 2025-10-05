import './local.js';
import './google.js';
import './facebook.js';
import passport from 'passport';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!global.userCache) global.userCache = {};
    if (global.userCache[id]) return done(null, global.userCache[id]);

    const results = await User.getUserById(id);
    if (!results.length) return done(null, false);

    global.userCache[id] = results[0];
    done(null, results[0]);
  } catch (err) {
    done(err);
  }
});

export default passport;
