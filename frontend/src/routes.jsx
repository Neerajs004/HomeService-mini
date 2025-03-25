import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import WorkerPage from "./pages/Worker"; // Import Worker component
import Payment from "./pages/payment"; // Import Payment component

const AppRoutes = () => {
  return (
    <Routes>
    //  <Route path="/" element={<HomePage />} />  {/* Home Page */}
     <Route path="/user/:userId" element={<UserPage />} />  {/* User Page */}
      //<Route path="/admin/:adminId" element={<AdminPage />} /> {/* Admin Page */}
      <Route path="/worker/:workerId" element={<WorkerPage />} /> {/* Worker Page */}
      <Route path="/payment/:bookingId" element={<Payment />} /> {/* Payment Page */}
    </Routes>
  );
};

export default AppRoutes;
