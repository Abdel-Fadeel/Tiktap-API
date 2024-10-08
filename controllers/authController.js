import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { Resend } from "resend";
import { generateToken } from "../utils/jwtUtils.js";
import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError } from "../errors/customErrors.js";

// const resend = new Resend(process.env.RESEND_API_KEY);

export const register = async (req, res) => {
  await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "You are now registered and can login",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new UnauthenticatedError("Invalid credentials");

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid credentials");

  // Generate a token or continue with your login logic
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
      },
    },
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();

  const googleId = payload["sub"]; // Unique Google ID for the user
  const email = payload["email"];
  const name = payload["name"];

  return { googleId, email, name };
}

export const googleLogin = async (req, res) => {
  const { googleId: googleIdToken } = req.body;

  const { googleId, email, name } = await verifyGoogleIdToken(googleIdToken);

  // Find the user in the database by Google ID
  let user = await User.findOne({ googleId });

  if (!user) {
    // If the user doesn't exist, create a new one
    user = new User({
      googleId,
      signupType: "google",
      email,
      name,
    });
    await user.save();
  }

  // Generate a token or continue with your login logic
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
      },
    },
  });
};

export const facebookLogin = async (req, res) => {
  const { facebookId, email, name } = req.body;

  // Find the user in the database
  let user = await User.findOne({ facebookId });
  if (!user) {
    // If the user doesn't exist, create a new one
    user = new User({
      facebookId,
      signupType: "facebook",
      email,
      name,
    });
    await user.save();
  }

  // Generate a token or continue with your login logic
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
      },
    },
  });
};

export const postForgotPassword = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(20).toString("hex");
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "No account with that email address exists." });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const emailData = {
      to: user.email,
      from: process.env.RESEND_EMAIL,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // await resend.sendEmail(emailData);

    res.status(200).json({
      msg: `An e-mail has been sent to ${user.email} with further instructions.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const getResetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Password reset token is invalid or has expired." });
    }

    res.status(200).json({ msg: "Token is valid", token: req.params.token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const postResetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Password reset token is invalid or has expired." });
    }

    if (req.body.password !== req.body.confirm) {
      return res.status(400).json({ msg: "Passwords do not match." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ msg: "Success! Your password has been changed." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
