import User from "../users/userModel.js";
import { generateToken } from "@/utils/jwtUtils.js";
import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError, BadRequestError } from "@/errors/customErrors.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { IRequest, IResponse } from "@/types/index.js";

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const register = async (req: IRequest, res: IResponse) => {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already registered");
  }

  const user = await User.create({ 
    email, 
    password,
    signupType: 'email/password',
    lastLogin: new Date() 
  });
  
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "You are now registered and can login",
    data: {
      user: {
        id: user._id,
        email: user.email,
      }
    }
  });
};

export const login = async (req: IRequest, res: IResponse) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new UnauthenticatedError("Invalid credentials");

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid credentials");

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id.toString(), user.email, user.isAdmin);

  // Populate products array with full product details
  await user.populate({
    path: 'products.productId',
    select: 'name price description image'
  });

  // Transform the products array to rename productId to product
  const transformedProducts = user.products.map(item => ({
    product: item.productId,
    amount: item.amount
  }));

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Logged in successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profiles: user.profiles,
        products: transformedProducts,
      },
      token,
    },
  });
};

export const googleLogin = async (req: IRequest, res: IResponse) => {
  const { googleId, email, name } = req.body;

  // Check if user exists with this email but different signup method
  const existingUser = await User.findOne({ email });
  if (existingUser && !existingUser.googleId) {
    throw new BadRequestError("Email already registered with different signup method");
  }

  let user = await User.findOne({ googleId });

  if (!user) {
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

  const token = generateToken(user._id.toString(), user.email, user.isAdmin);

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
        isAdmin: user.isAdmin,
      },
    },
  });
};

export const resetPassword = async (req: IRequest, res: IResponse) => {
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
  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
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

export const forgotPassword = async (req: IRequest, res: IResponse) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("No user found with this email");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

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