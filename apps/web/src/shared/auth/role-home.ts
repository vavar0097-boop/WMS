export function getHomePathForRole(role?: string | null) {
  if (role === "CASHIER" || role === "OPERATOR") {
    return "/pos";
  }

  if (role === "FINANCE") {
    return "/dashboard/finance";
  }

  if (role === "WAREHOUSE") {
    return "/dashboard/transfers";
  }

  return "/dashboard";
}
