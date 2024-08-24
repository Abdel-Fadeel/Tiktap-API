import jwt from "jsonwebtoken";

export const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
