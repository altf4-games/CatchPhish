import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/register";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard";
import AboutUs from "./pages/about";
import Services from "./pages/services";
import Home from "./pages/LandingPage";
import Resources from "./pages/resources";
import ReportTracker from "./pages/ReportTracker";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect default route to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/LandingPage" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/tracker" element={<ReportTracker />} />
        {/* Catch all unmatched routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
