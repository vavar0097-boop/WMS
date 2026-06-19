import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  PORT: Number(process.env.PORT ?? 3000),

  SUPABASE_URL: getEnv("SUPABASE_URL"),

  SUPABASE_SERVICE_ROLE_KEY: getEnv(
    "SUPABASE_SERVICE_ROLE_KEY"
  ),

  JWT_ACCESS_SECRET: getEnv(
    "JWT_ACCESS_SECRET"
  ),

  JWT_REFRESH_SECRET: getEnv(
    "JWT_REFRESH_SECRET"
  ),
};