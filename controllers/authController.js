import bcrypt from "bcryptjs";
import passport from "passport";
import crypto from "crypto";
import User from "../models/User.js";
import { Resend } from "resend";
import { generateToken } from "../utils/jwtUtils.js";
import { StatusCodes } from "http-status-codes";

// const resend = new Resend(process.env.RESEND_API_KEY);

export const postRegister = async (req, res) => {
  const { email,password } = req.body;

  await User.create({email, password});
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "You are now registered and can login",
  });
};

export const postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user)
      return res.status(400).json({ status: false, message: info.message });
    req.logIn(user, (err) => {
      if (err) throw err;
      const token = generateToken(user._id, user.email);
      const loggedInUser = {
        id: user._id,
        email: user.email,
        profiles: user.profiles,
      };
      res.status(200).json({
        status: true,
        message: "Logged in successfully",
        data: {
          token,
          user: loggedInUser,
        },
      });
    });
  })(req, res, next);
};

export const getLogout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({ status: true, message: "Logout successful" });
  });
};

export const googleCallback = (req, res) => {
  res.redirect("/dashboard");
};

export const facebookCallback = (req, res) => {
  res.redirect("/dashboard");
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
