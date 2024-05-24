import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  dueDate: string;
  iat: number;
  exp: number;
}

const planExpired = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { dueDate } = decoded as TokenPayload;
    console.log(dueDate, new Date(dueDate));
    if (new Date(dueDate) < new Date()) {
      throw new AppError("PLAN_EXPLIRED", 401);
    }
  } catch (err) {
    throw new AppError("Seu plano está expirado", 403 );
  }

  return next();
};

export default planExpired;
