import { Request, Response } from "express";

import {
  AuthRequest,
} from "../../../middleware/auth.middleware";
import {
  UnauthorizedError,
} from "../../../utils/errors";
import {
  successResponse,
} from "../../../utils/response";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private service = new AuthService();

  login = async (
    req: Request,
    res: Response
  ) => {
    const {
      username,
      password,
    } = req.body;

    const result = await this.service.login({
      username,
      password,
    });

    res.cookie(
      "access_token",
      result.accessToken,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      }
    );

    res.cookie(
      "refresh_token",
      result.refreshToken,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      }
    );

    return successResponse(
      res,
      result.user,
      "Login successful"
    );
  };

  me = async (
    req: AuthRequest,
    res: Response
  ) => {
    return successResponse(
      res,
      req.user,
      "Current User"
    );
  };

  logout = async (
    _req: Request,
    res: Response
  ) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return successResponse(
      res,
      null,
      "Logout successful"
    );
  };

  refresh = async (
    req: Request,
    res: Response
  ) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedError(
        "Refresh token missing"
      );
    }

    const accessToken =
      this.service.refresh(refreshToken);

    res.cookie(
      "access_token",
      accessToken,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      }
    );

    return successResponse(
      res,
      null,
      "Token refreshed"
    );
  };
}
