import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt.service.js";
import { getSafeUserById } from "../services/user.service.js";
import { JwtPayload } from "../types/auth.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Auth Middleware");
  const token = req.cookies.session;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = verifyToken(token) as JwtPayload;
    // 🔴 IMPORTANT: check DB
    const user = await getSafeUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = decoded; // { userId }
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// export const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.session;

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const decoded = verifyToken(token);

//     // 🔴 IMPORTANT: check DB
//     const user = await getUser(decoded.userId);

//     if (!user) {
//       return res.status(401).json({ error: "User no longer exists" });
//     }

//     req.user = decoded;
//     next();
//   } catch {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
// };
