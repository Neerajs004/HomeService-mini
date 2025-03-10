import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import WorkerPage from "./pages/Worker"; // Import Worker component

const AppRoutes = () => {
  return (
    <Routes>
    //  <Route path="/" element={<HomePage />} />  {/* Home Page */}
     <Route path="/user/:userId" element={<UserPage />} />  {/* User Page */}
      //<Route path="/admin/:adminId" element={<AdminPage />} /> {/* Admin Page */}
      <Route path="/worker/:workerId" element={<WorkerPage />} /> {/* Worker Page */}
    </Routes>
  );
};

export default AppRoutes;
