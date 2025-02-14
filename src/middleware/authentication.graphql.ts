
import { Request, Response, NextFunction } from "express";
import webTokenService from '../utils/webToken.service'
import HttpException from "../utils/HttpException.utils";
import { DotenvConfig } from '../config/env.config'

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
  return { user: null };
}
const token = authHeader.split(" ")[1];

  try {

    const payload = webTokenService.verify(token, DotenvConfig.ACCESS_TOKEN_SECRET);

    if (!payload || typeof payload !== "object" || !("id" in payload)) {
      throw new Error("Invalid token payload");
    }

    req.user = payload; // Attach user to the request
    return { user: payload }; // Return user
  } catch (error:unknown) {
    if(error instanceof Error){
      throw HttpException.badRequest(error.message)
    }
    throw HttpException.unauthorized("Invalid or expired Token");
  }
};

