import jwt from "jsonwebtoken";
import crypto from "crypto";

const jwtSecret = crypto.randomBytes(32).toString('hex');

export const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, jwtSecret, {
    expiresIn: "30d",
  });
};

export const decodeToken = (token) => {
  return jwt.verify(token, jwtSecret);
};
