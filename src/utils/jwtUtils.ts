import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, email: string, isAdmin?: boolean): string => {
  return jwt.sign(
    { id: userId, email, isAdmin },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token: string): { id: string; email: string; isAdmin?: boolean } => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string; isAdmin?: boolean };
}; 