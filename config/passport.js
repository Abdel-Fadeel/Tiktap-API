import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default function (passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).populate("profiles");
          if (!user) {
            return done(null, false, {
              message: "That email is not registered",
            });
          }

          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Email or password is incorrect",
            });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((data, done) => {
    // In this case, data contains both the user object and the token
    done(null, data.user.id); // Serialize only the user ID
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
