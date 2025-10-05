import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

passport.use('local', new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {

    try {
      const results = await User.findByEmail(email);

      if (!results.length) return done(null, false, { message: 'User not found' });

      const user = results[0];

      if (user.provider === 'google' || user.provider === 'facebook') {
        return done(null, false);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);

    } catch (err) {
      return done(err);
    }
  }
));
