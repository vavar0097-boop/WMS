import { Response, NextFunction } from "express";

import { AuthRequest } from "./auth.middleware";

import {
ForbiddenError,
} from "../utils/errors";

export function roleMiddleware(
...allowedRoles: string[]
) {

return (
req: AuthRequest,
_res: Response,
next: NextFunction
) => {


const role =
  (req.user as any)?.role;

if (
  !role ||
  !allowedRoles.includes(role)
) {
  throw new ForbiddenError(
    "Access denied"
  );
}

next();


};
}
