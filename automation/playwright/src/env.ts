export type Credentials = {
  username: string;
  password: string;
};

export type RoleName = "admin" | "finance" | "cashier";

const roleEnv: Record<RoleName, [string, string]> = {
  admin: ["WMS_ADMIN_USERNAME", "WMS_ADMIN_PASSWORD"],
  finance: ["WMS_FINANCE_USERNAME", "WMS_FINANCE_PASSWORD"],
  cashier: ["WMS_CASHIER_USERNAME", "WMS_CASHIER_PASSWORD"],
};

export const appUrl = process.env.WMS_APP_URL || "https://app-ku.unaux.com";

export const apiBaseUrl =
  process.env.WMS_API_BASE_URL ||
  "https://wms-production-23d1.up.railway.app";

export const reportMonth =
  process.env.WMS_REPORT_MONTH || currentJakartaMonth();

export const syncGoogle = process.env.WMS_SYNC_GOOGLE === "true";

export function credentialsFor(role: RoleName): Credentials | null {
  const [usernameKey, passwordKey] = roleEnv[role];
  const username = process.env[usernameKey];
  const password = process.env[passwordKey];

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export function missingCredentialsMessage(role: RoleName) {
  const [usernameKey, passwordKey] = roleEnv[role];

  return `Set ${usernameKey} and ${passwordKey} in automation/playwright/.env`;
}

function currentJakartaMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .slice(0, 7);
}
