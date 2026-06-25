export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  TRANSFERS_READ: "transfers:read",
  TRANSFERS_WRITE: "transfers:write",
  TRANSFERS_ACTION: "transfers:action",
  STOCK_READ: "stock:read",
  STOCK_WRITE: "stock:write",
  ITEMS_READ: "items:read",
  ITEMS_WRITE: "items:write",
  WAREHOUSES_READ: "warehouses:read",
  WAREHOUSES_WRITE: "warehouses:write",
  LOCATIONS_READ: "locations:read",
  LOCATIONS_WRITE: "locations:write",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  FINANCE_READ: "finance:read",
  FINANCE_WRITE: "finance:write",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  AUDIT_READ: "audit:read",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS),
  SUPERVISOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRANSFERS_READ,
    PERMISSIONS.TRANSFERS_WRITE,
    PERMISSIONS.TRANSFERS_ACTION,
    PERMISSIONS.STOCK_READ,
    PERMISSIONS.STOCK_WRITE,
    PERMISSIONS.ITEMS_READ,
    PERMISSIONS.WAREHOUSES_READ,
    PERMISSIONS.LOCATIONS_READ,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
  OPERATOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRANSFERS_READ,
    PERMISSIONS.TRANSFERS_WRITE,
    PERMISSIONS.STOCK_READ,
    PERMISSIONS.ITEMS_READ,
    PERMISSIONS.WAREHOUSES_READ,
    PERMISSIONS.LOCATIONS_READ,
  ],
  AUDITOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRANSFERS_READ,
    PERMISSIONS.STOCK_READ,
    PERMISSIONS.ITEMS_READ,
    PERMISSIONS.WAREHOUSES_READ,
    PERMISSIONS.LOCATIONS_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.AUDIT_READ,
  ],
};

export function getPermissionsForRole(role?: string | null) {
  return ROLE_PERMISSIONS[role ?? ""] ?? [];
}

export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
) {
  return getPermissionsForRole(role).includes(permission);
}
