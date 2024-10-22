import { Request, Response, NextFunction } from "express";
import { JwtAuthService } from "../../infrastructure/services/JwtAuthService";

const jwtSecret = process.env.JWT_SECRET!;
const authService = new JwtAuthService(jwtSecret);

export function recruiterAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = authService.verifyToken(token);
    if (decoded && decoded.role === "recruiter") {
      (req as any).user = decoded;
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
