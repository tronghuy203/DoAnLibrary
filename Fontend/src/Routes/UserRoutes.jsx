// src/routes/UserRoutes.jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "../Layouts/UserLayout";

const Home = lazy(() => import("../Pages/Home/Home"));
const Profile = lazy(() => import("../Pages/Profile/Profile"));
const Login = lazy(() => import("../Pages/Login/Login"));
const Register = lazy(() => import("../Pages/Register/Register"));
const ForgotPassword = lazy(() => import("../Pages/ForgotPassword/ForgotPassword"));
const VerifyResetCode = lazy(() => import("../Pages/ForgotPassword/VerifyOTP"));
const ResetPassword = lazy(() => import("../Pages/ForgotPassword/ResetPassword"));
const AllBooks = lazy(() => import("../Pages/AllBooks/AllBooks"));
const Cart = lazy(() => import("../Pages/Cart/Cart"));
const DetailBook = lazy(() => import("../Pages/DetailBook/Detailbook"));
const DocumentList = lazy(() => import("../Pages/UserDocument/UserDocumentList"));
const DetailDocument = lazy(() => import("../Pages/UserDocument/DetailDocument"));
const UploadDocument = lazy(() => import("../Pages/UserDocument/UploadDocument"));
const Payment = lazy(() => import("../Pages/Payment/Payment"));
const PaymentSuccess = lazy(() => import("../Pages/Payment/PaymentSuccess"));
const PaymentRedirect = lazy(() => import("../Pages/Payment/PaymentRedirect"));
const PaymentFailed = lazy(() => import("../Pages/Payment/PaymentFailed"));
const UserRoutes = () => {
  return (
    <UserLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all-books" element={<AllBooks />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/books/:id" element={<DetailBook />} />
          <Route path="/document-list" element={<DocumentList />} />
          <Route path="/document/:id" element={<DetailDocument />} />
          <Route path="/upload-document" element={<UploadDocument />} />
          <Route path="/payment/:requestId" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-redirect" element={<PaymentRedirect />}/>
          <Route path="/payment-failed" element={<PaymentFailed />}/>
        </Routes>
      </Suspense>
    </UserLayout>
  );
};

export default UserRoutes;
