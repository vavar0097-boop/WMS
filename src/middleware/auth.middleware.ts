import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";

import {
UnauthorizedError,
} from "../utils/errors";

export interface AuthRequest
extends Request {
user?: {
id: string;
username: string;
role: string;
};
}

export function authMiddleware(
req: AuthRequest,
_res: Response,
next: NextFunction
) {
const token =
req.cookies?.access_token;

if (!token) {
throw new UnauthorizedError(
"Access token missing"
);
}

try {


const payload =
jwt.verify(
  token,
  env.JWT_ACCESS_SECRET
) as {
  sub: string;
  username: string;
  role: string;
};

req.user = {
  id: payload.sub,
  username: payload.username,
  role: payload.role,
};

next();


} catch {


throw new UnauthorizedError(
  "Invalid token"
);


}
}
