import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import flash from "connect-flash";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/usersRoute.js";
import profileRoutes from "./routes/profilesRoute.js";
import groupRoutes from "./routes/groupsRoute.js";
import contactRoutes from "./routes/contactsRoute.js";
import initializePassport from "./config/passport.js";
import authMiddleware from "./middlewares/authMiddleware.js";

dotenv.config();

// Passport Config
initializePassport(passport);

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profiles", authMiddleware, profileRoutes);
app.use("/api/v1/groups", authMiddleware, groupRoutes);
app.use("/api/v1/contacts", authMiddleware, contactRoutes);

const PORT = process.env.PORT || 3100;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
