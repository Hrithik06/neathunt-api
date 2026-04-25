import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
