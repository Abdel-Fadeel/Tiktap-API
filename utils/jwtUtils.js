import jwt from "jsonwebtoken";

export const generateToken = (userId, email) => {
  console.log(userId, email);
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
