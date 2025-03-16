import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/register";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard";
import AboutUs from './pages/about';
import Services from './pages/services';
import Home from "./pages/LandingPage";
import Resources from "./pages/resources";
import Navbar from "./pages/Navbar";// You'll need to create this component

// Layout component that includes the navbar
const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without navbar */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes with navbar */}
        <Route element={<Layout />}>
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/resources" element={<Resources />} />
        </Route>
        
        {/* Catch all unmatched routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;