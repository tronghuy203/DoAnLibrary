import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.auth.login);
  if (!currentUser || !currentUser.admin) {
    return <Navigate to="/" />;
  }
  return children;
};

export default AdminRoute;
