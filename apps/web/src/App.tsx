import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { FinancePage } from "@/features/finance/pages/FinancePage";
import { PermissionRoute } from "@/features/auth/components/PermissionRoute";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ItemsPage } from "@/features/master-data/pages/ItemsPage";
import { LocationsPage } from "@/features/master-data/pages/LocationsPage";
import { WarehousesPage } from "@/features/master-data/pages/WarehousesPage";
import { PosPage } from "@/features/pos/pages/PosPage";
import { StockPage } from "@/features/stocks/pages/StockPage";
import { GlobalSettingsPage } from "@/features/settings/pages/GlobalSettingsPage";
import { AuditLogsPage } from "@/features/system/pages/AuditLogsPage";
import { UsersPage } from "@/features/system/pages/UsersPage";
import { CreateTransferPage } from "@/features/transfers/pages/CreateTransferPage";
import { TransferDetailPage } from "@/features/transfers/pages/TransferDetailPage";
import { TransferListPage } from "@/features/transfers/pages/TransferListPage";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Toaster } from "@/shared/ui/toast";
import { PERMISSIONS } from "@/shared/auth/permissions";
import { getHomePathForRole } from "@/shared/auth/role-home";
import { useAuthStore } from "@/stores/auth.store";

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

      <Toaster />
    </BrowserRouter>
  );
}
