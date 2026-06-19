import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../../config/env";

import { LoginDto } from "../dto/login.dto";

import { UnauthorizedError }
  from "../../../utils/errors";

import { AuthRepository }
  from "../repositories/auth.repository";

export class AuthService {

  private repository =
    new AuthRepository();

  async login(
    { username, password }: LoginDto
  ) {

    const user =
      await this.repository.findByUsername(
        username
      );

    if (!user) {
      throw new UnauthorizedError(
        "Invalid credentials"
      );
    }

    const valid =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!valid) {
      throw new UnauthorizedError(
        "Invalid credentials"
      );
    }

    const accessToken =
      jwt.sign(
        {
          sub: user.id,
          username: user.username,
          role: user.role_name ?? "OPERATOR",
        },
        env.JWT_ACCESS_SECRET,
        {
          expiresIn: "15m",
        }
      );

    const refreshToken =
      jwt.sign(
        {
          sub: user.id,
        },
        env.JWT_REFRESH_SECRET,
        {
          expiresIn: "7d",
        }
      );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  refresh(
refreshToken: string
) {

const payload =
jwt.verify(
refreshToken,
env.JWT_REFRESH_SECRET
) as {
sub: string;
};

return jwt.sign(
{
sub: payload.sub,
},
env.JWT_ACCESS_SECRET,
{
expiresIn: "15m",
}
);
}

}