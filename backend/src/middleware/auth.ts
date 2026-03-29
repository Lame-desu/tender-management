import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function generateRefreshToken(id: number): string {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn });
}

export function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearTokenCookies(res: Response) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  // Try access token first
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, ACCESS_SECRET) as JwtPayload;
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
      return next();
    } catch {
      // Access token expired or invalid — fall through to refresh
    }
  }

  // Try refresh token
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: number };
      // Look up user to get current role/email
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      try {
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (user && user.status === "ACTIVE") {
          const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
          const newAccessToken = generateAccessToken(payload);
          setTokenCookies(res, newAccessToken, refreshToken);
          req.user = payload;
          return next();
        }
      } finally {
        await prisma.$disconnect();
      }
    } catch {
      // Refresh token also invalid
    }
  }

  return res.status(401).json({ success: false, message: "Authentication required" });
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    return next();
  };
}
