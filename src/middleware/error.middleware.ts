import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  AppError,
} from "../utils/errors";

import {
  logger,
} from "../config/logger";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(
      err.statusCode
    ).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}