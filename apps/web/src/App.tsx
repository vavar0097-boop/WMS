import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ItemsPage } from "@/features/master-data/pages/ItemsPage";
import { LocationsPage } from "@/features/master-data/pages/LocationsPage";
import { WarehousesPage } from "@/features/master-data/pages/WarehousesPage";
import { StockPage } from "@/features/stocks/pages/StockPage";
import { AuditLogsPage } from "@/features/system/pages/AuditLogsPage";
import { UsersPage } from "@/features/system/pages/UsersPage";
import { CreateTransferPage } from "@/features/transfers/pages/CreateTransferPage";
import { TransferDetailPage } from "@/features/transfers/pages/TransferDetailPage";
import { TransferListPage } from "@/features/transfers/pages/TransferListPage";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Toaster } from "@/shared/ui/toast";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <Navigate to="/dashboard/transfers" replace />
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
              element={<DashboardPage />}
            />

          <Route
            path="transfers"
            element={<TransferListPage />}
          />
          <Route
            path="transfers/new"
            element={<CreateTransferPage />}
          />
          <Route
            path="transfers/:id"
            element={<TransferDetailPage />}
          />
          <Route path="stock" element={<StockPage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route
            path="warehouses"
            element={<WarehousesPage />}
          />
          <Route
            path="locations"
            element={<LocationsPage />}
          />
          <Route path="users" element={<UsersPage />} />
          <Route
            path="audit-logs"
            element={<AuditLogsPage />}
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard/transfers"
              replace
            />
          }
        />
      </Routes>

      <Toaster />
    </BrowserRouter>
  );
}
