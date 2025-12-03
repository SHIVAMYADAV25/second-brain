import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "ssh";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers["authorization"];
    if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    // console.log(token)
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify and narrow type
    const decoded = jwt.verify(token, SECRET) as JwtPayload | string;

    if (typeof decoded === "string") {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Expecting id claim on JWT; adjust if you use another claim name
    const id = (decoded as JwtPayload & { id?: string }).id;
    if (!id) {
      return res.status(403).json({ message: "Token missing id claim" });
    }

    // req.userId exists if you've added the declaration (see types file)
    (req as Request & { userId?: string }).userId = id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
