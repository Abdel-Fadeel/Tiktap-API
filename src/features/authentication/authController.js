import User from "../users/userModel.js";
import { generateToken } from "../../utils/jwtUtils.js";
import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError, BadRequestError } from "../../errors/customErrors.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already registered");
  }

  // Validate password strength
  if (password && password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters long");
  }

  const user = await User.create({ ...req.body, lastLogin: new Date() });
  
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "You are now registered and can login",
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      }
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new UnauthenticatedError("Invalid credentials");

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid credentials");

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.email);

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Logged in successfully",
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        signupType: user.signupType,
        profiles: user.profiles,
        products: user.products,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
};

export const googleLogin = async (req, res) => {
  const { googleId, email, name } = req.body;

  if (!googleId || !email || !name) {
    throw new BadRequestError("Please provide all required fields");
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already registered with different signup method");
    }

    user = new User({
      googleId,
      signupType: "google",
      email,
      name,
      isEmailVerified: true,
      lastLogin: new Date(),
    });
    await user.save();
  } else {
    // Update last login
    user.lastLogin = new Date();
    await user.save();
  }

  const token = generateToken(user._id, user.email);

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Logged in successfully",
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        signupType: user.signupType,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
};

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("No user found with this email");
  }

  // Verify reset token
  if (user.resetPasswordToken !== token) {
    throw new BadRequestError("Invalid reset token");
  }

  // Check if token has expired
  if (user.resetPasswordExpires < Date.now()) {
    throw new BadRequestError("Reset token has expired");
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Password has been reset successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("No user found with this email");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetExpires = Date.now() + 3600000; // 1 hour from now

  // Save reset token to user
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Send email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h1>You requested a password reset</h1>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Password reset email sent",
  });
};