import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to Login for now */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Onboarding />} />

        {/* Fallback */}
        <Route path="*" element={<h1 style={{ color: 'white', textAlign: 'center' }}>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
