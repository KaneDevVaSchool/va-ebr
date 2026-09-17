import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { EbrApp } from "./EbrApp";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <EbrApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
