import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../Components/AdminRoute/AdminRoute";
import AdminLayout from "../Layouts/AdminLayout";

const AdminDashboard = lazy(() => import("../Pages/Admin/AdminDashboard"));
const CreateBook = lazy(() => import("../Pages/Admin/CreateBook"));
const ListBook = lazy(() => import("../Pages/Admin/ListBook"));
const UpdateBook = lazy(() => import("../Pages/Admin/UpdateBook"));
const AdminUserManagement = lazy(() => import("../Pages/Admin/AdminUserManagement"));
const AdminDocumentList = lazy(() => import("../Pages/Admin/AdminDocumentList"));

const AdminRoutes = () => {
  return (
    <AdminRoute>
      <Suspense fallback={<div>Loading admin...</div>}>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books/create" element={<CreateBook />} />
            <Route path="books/list" element={<ListBook />} />
            <Route path="books/update/:bookId" element={<UpdateBook />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="documents/list" element={<AdminDocumentList />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminRoute>
  );
};

export default AdminRoutes;
