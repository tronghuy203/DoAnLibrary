import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../Components/AdminRoute/AdminRoute";
import AdminLayout from "../Layouts/AdminLayout";


const AdminDashboard = lazy(() => import("../Pages/Admin/AdminDashboard"));
const CreateBook = lazy(() => import("../Pages/Admin/CreateBook"));
const ListBook = lazy(() => import("../Pages/Admin/ListBook"));
const UpdateBook = lazy(() => import("../Pages/Admin/UpdateBook"));
const AdminUserManagement = lazy(() => import("../Pages/Admin/AdminUserManagement"));
const CreateDocument = lazy(() => import("../Pages/Admin/CreateDocument"));
const ListDocument = lazy(() => import("../Pages/Admin/ListDocument"));
const BorrowBook = lazy(() => import("../Pages/Admin/BorrowBook"));
const BookReview = lazy(() => import("../Pages/Admin/BookReview"));
const DocumentReview = lazy(() => import("../Pages/Admin/DocumentReview"));
const ListCategory = lazy(() => import("../Pages/Admin/ListCategory"));
const RevenueDashboard = lazy(() => import("../Pages/Admin/RevenueDashboard"));
const AdminDocumentApprove = lazy(() => import("../Pages/Admin/AdminDocumentApprove"));
const AdminChat = lazy(() => import("../Pages/Admin/AdminChat"));


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
            <Route path="documents/create" element={<CreateDocument />} />
            <Route path="documents/list" element={<ListDocument />} />
            <Route path="documents/approve" element={<AdminDocumentApprove />} />
            <Route path="manage/borrow" element={<BorrowBook />} />
            <Route path="manage-revenue/revenue" element={<RevenueDashboard  />} />
            <Route path="books/categorys/list" element={<ListCategory />} />
            <Route path="reviews/books" element={<BookReview />} />
            <Route path="reviews/documents" element={<DocumentReview />} />
            <Route path="chat" element={<AdminChat />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminRoute>
  );
};

export default AdminRoutes;
