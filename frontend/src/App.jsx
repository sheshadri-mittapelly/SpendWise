
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Transactions from "./pages/Transactions.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Transactions */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        {/* Protected Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
