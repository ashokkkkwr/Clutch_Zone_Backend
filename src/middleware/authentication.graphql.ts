import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokenManager";
import HttpException from "../utils/HttpException.utils";

interface UserPayload {
  id?: string;
  role?: string;
}

export const authenticateGraphql = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw HttpException.unauthorized("Authorization token is required.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token, process.env.JWT_SECRET) as UserPayload;
    
    if (!payload || typeof payload !== "object" || !("id" in payload)) {
      throw new Error("Invalid token payload");
    }

    req.user = payload;
    next();
  } catch (error) {
    throw HttpException.unauthorized("Invalid or expired Token");
  }
};
