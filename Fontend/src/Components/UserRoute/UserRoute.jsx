import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = useSelector((state) => state.auth.login.currentUser);

  if (user && user.accessToken) {
    return user.admin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
