import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { PermissionRoute } from "@/features/auth/components/PermissionRoute";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Toaster } from "@/shared/ui/toast";
import { PERMISSIONS } from "@/shared/auth/permissions";
import { getHomePathForRole } from "@/shared/auth/role-home";
import { useAuthStore } from "@/stores/auth.store";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);
const PosPage = lazy(() =>
  import("@/features/pos/pages/PosPage").then((module) => ({
    default: module.PosPage,
  }))
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);
const TransferListPage = lazy(() =>
  import("@/features/transfers/pages/TransferListPage").then((module) => ({
    default: module.TransferListPage,
  }))
);
const CreateTransferPage = lazy(() =>
  import("@/features/transfers/pages/CreateTransferPage").then((module) => ({
    default: module.CreateTransferPage,
  }))
);
const TransferDetailPage = lazy(() =>
  import("@/features/transfers/pages/TransferDetailPage").then((module) => ({
    default: module.TransferDetailPage,
  }))
);
const StockPage = lazy(() =>
  import("@/features/stocks/pages/StockPage").then((module) => ({
    default: module.StockPage,
  }))
);
const FinancePage = lazy(() =>
  import("@/features/finance/pages/FinancePage").then((module) => ({
    default: module.FinancePage,
  }))
);
const ItemsPage = lazy(() =>
  import("@/features/master-data/pages/ItemsPage").then((module) => ({
    default: module.ItemsPage,
  }))
);
const WarehousesPage = lazy(() =>
  import("@/features/master-data/pages/WarehousesPage").then((module) => ({
    default: module.WarehousesPage,
  }))
);
const LocationsPage = lazy(() =>
  import("@/features/master-data/pages/LocationsPage").then((module) => ({
    default: module.LocationsPage,
  }))
);
const UsersPage = lazy(() =>
  import("@/features/system/pages/UsersPage").then((module) => ({
    default: module.UsersPage,
  }))
);
const GlobalSettingsPage = lazy(() =>
  import("@/features/settings/pages/GlobalSettingsPage").then((module) => ({
    default: module.GlobalSettingsPage,
  }))
);
const AuditLogsPage = lazy(() =>
  import("@/features/system/pages/AuditLogsPage").then((module) => ({
    default: module.AuditLogsPage,
  }))
);

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
      Loading...
    </div>
  );
}

function RoleHomeRedirect() {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <Navigate
      to={getHomePathForRole(role)}
      replace
    />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <PermissionRoute
                  permission={PERMISSIONS.CASHIER_SESSIONS_READ}
                >
                  <PosPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleHomeRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <PermissionRoute
                  permission={PERMISSIONS.DASHBOARD_VIEW}
                >
                  <DashboardPage />
                </PermissionRoute>
              }
            />

            <Route
              path="transfers"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.TRANSFERS_READ}
                >
                  <TransferListPage />
                </PermissionRoute>
              }
            />
            <Route
              path="transfers/new"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.TRANSFERS_WRITE}
                >
                  <CreateTransferPage />
                </PermissionRoute>
              }
            />
            <Route
              path="transfers/:id"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.TRANSFERS_READ}
                >
                  <TransferDetailPage />
                </PermissionRoute>
              }
            />
            <Route
              path="stock"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.STOCK_READ}
                >
                  <StockPage />
                </PermissionRoute>
              }
            />
            <Route
              path="finance"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.FINANCE_READ}
                >
                  <FinancePage />
                </PermissionRoute>
              }
            />
            <Route
              path="items"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.ITEMS_READ}
                >
                  <ItemsPage />
                </PermissionRoute>
              }
            />
            <Route
              path="warehouses"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.WAREHOUSES_READ}
                >
                  <WarehousesPage />
                </PermissionRoute>
              }
            />
            <Route
              path="locations"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.LOCATIONS_READ}
                >
                  <LocationsPage />
                </PermissionRoute>
              }
            />
            <Route
              path="users"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.USERS_READ}
                >
                  <UsersPage />
                </PermissionRoute>
              }
            />
            <Route
              path="settings"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.SETTINGS_READ}
                >
                  <GlobalSettingsPage />
                </PermissionRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <PermissionRoute
                  permission={PERMISSIONS.AUDIT_READ}
                >
                  <AuditLogsPage />
                </PermissionRoute>
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </Suspense>

      <Toaster />
    </BrowserRouter>
  );
}
