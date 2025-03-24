// src/routes/UserRoutes.jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "../Layouts/UserLayout";

const Home = lazy(() => import("../Pages/Home/Home"));
const Profile = lazy(() => import("../Pages/Profile/Profile"));
const Login = lazy(() => import("../Pages/Login/Login"));
const Register = lazy(() => import("../Pages/Register/Register"));

const UserRoutes = () => {
  return (
    <UserLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Suspense>
    </UserLayout>
  );
};

export default UserRoutes;
