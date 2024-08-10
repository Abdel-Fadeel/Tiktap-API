import "express-async-errors";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import flash from "connect-flash";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/usersRoute.js";
import profileRoutes from "./routes/profilesRoute.js";
import groupRoutes from "./routes/groupsRoute.js";
import contactRoutes from "./routes/contactsRoute.js";
import initializePassport from "./config/passport.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import errorHandlerMiddleware from "./middlewares/errorHandler.js";

// Access .env files
dotenv.config();

// Create HTTP Server
const app = express();

// Security Packages
app.use(helmet());
app.use(mongoSanitize());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport Config
initializePassport(passport);

// Express session
app.use(
  session({ secret: "your secret", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profiles", authMiddleware, profileRoutes);
app.use("/api/v1/groups", authMiddleware, groupRoutes);
app.use("/api/v1/contacts", authMiddleware, contactRoutes);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// NOT FOUND Handler
app.use("*", (req, res, next) => {
  res.status(404).json({ message: "Route not found." });
});

// Global Error Handler
app.use(errorHandlerMiddleware);

// Connect to Database and Start listening
try {
  await mongoose.connect(process.env.MONGO_URI);
  const port = process.env.PORT || 5100;
  app.listen(port, () =>
    console.log(`Server started listening on PORT ${port}...`)
  );
} catch (error) {
  console.log(error);
  process.exit(1);
}
