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

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5100/api/v1/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            // If user doesn't exist, create a new user
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            });
            await user.save();
          }

          // Create JWT token
          const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          // Return the user and token
          const data = {
            user,
            token,
          };
          return done(null, data);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Facebook Strategy
  // passport.use(
  //   new FacebookStrategy(
  //     {
  //       clientID: process.env.FACEBOOK_APP_ID,
  //       clientSecret: process.env.FACEBOOK_APP_SECRET,
  //       callbackURL: "/auth/facebook/callback",
  //       profileFields: ["id", "displayName", "email"],
  //     },
  //     async (accessToken, refreshToken, profile, done) => {
  //       try {
  //         let user = await User.findOne({ facebookId: profile.id });
  //         if (user) {
  //           return done(null, user);
  //         } else {
  //           const newUser = new User({
  //             facebookId: profile.id,
  //             name: profile.displayName,
  //             email: profile.emails[0].value,
  //           });

  //           user = await newUser.save();
  //           return done(null, user);
  //         }
  //       } catch (err) {
  //         return done(err);
  //       }
  //     }
  //   )
  // );

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
