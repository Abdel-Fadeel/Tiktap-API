import User from "../users/userModel.js";
import { generateToken } from "../../utils/jwtUtils.js";
import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError } from "../../errors/customErrors.js";


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



export const googleLogin = async (req, res) => {
  const { googleId, email, name } = req.body;

  // Find the user in the database
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
      },
    },
  });
};