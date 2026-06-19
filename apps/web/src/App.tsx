import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { CreateTransferPage } from "@/features/transfers/pages/CreateTransferPage";
import { TransferDetailPage } from "@/features/transfers/pages/TransferDetailPage";
import { TransferListPage } from "@/features/transfers/pages/TransferListPage";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Toaster } from "@/shared/ui/toast";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard/transfers"
              replace
            />
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
              <Navigate
                to="/dashboard/transfers"
                replace
              />
            }
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