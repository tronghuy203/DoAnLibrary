import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  getAllBorrowRecords,
  confirmPickup,
  confirmReturn,
} from "../../redux/apiBorrow";
import {
  ClipboardDocumentCheckIcon,
  ArrowUturnUpIcon,
} from "@heroicons/react/24/outline";

const BorrowBook = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const borrowList = useSelector((state) => state.borrow.borrowRecords);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess),[user, dispatch]);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

  // Tính toán dữ liệu hiển thị
  const totalRecords = borrowList?.length || 0;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = borrowList?.slice(indexOfFirstRecord, indexOfLastRecord);

  useEffect(() => {
    if (user?.accessToken) {
      getAllBorrowRecords(user.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

  const handleConfirmPickup = async (id) => {
    try {
      await confirmPickup(id, user.accessToken, dispatch, axiosJWT);
      await getAllBorrowRecords(user.accessToken, dispatch, axiosJWT);
    } catch (err) {
      console.error("❌ Xác nhận lấy sách thất bại", err);
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await confirmReturn(id, user.accessToken, dispatch, axiosJWT);
      await getAllBorrowRecords(user.accessToken, dispatch, axiosJWT);
    } catch (err) {
      console.error("❌ Xác nhận trả sách thất bại", err);
    }
  };

  // Hàm chuyển trang
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Tạo danh sách số trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-10 tracking-wide drop-shadow-md animate-fade-in-up">
          Quản Lý Mượn Trả Sách
        </h2>

        {borrowList?.length > 0 ? (
          <>
            <div className="w-full bg-gray-800 rounded-xl shadow-md border border-gray-700/50 overflow-hidden">
              {/* Tiêu đề bảng */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_2fr_2fr_1fr_1fr_1fr_1.5fr] bg-gray-700 text-gray-200 font-semibold p-4">
                <div className="text-base">ID</div>
                <div className="text-base">Người Mượn</div>
                <div className="text-base">Sách</div>
                <div className="text-base">Trạng thái</div>
                <div className="text-base">Ngày Mượn</div>
                <div className="text-base">Ngày Trả</div>
                <div className="text-base">Hành động</div>
              </div>

              {/* Nội dung bảng */}
              <div className="divide-y divide-gray-700">
                {currentRecords.map((borrow) => (
                  <div
                    key={borrow._id}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr_2fr_1fr_1fr_1fr_1.5fr] p-4 hover:bg-gray-750 hover:-translate-y-1 transition-all duration-300 animate-slide-in"
                  >
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">ID:</span>
                      <span className="text-base break-all">{borrow._id.slice(-6)}</span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Người Mượn:</span>
                      <span className="text-base">{borrow.userId?.username || "Không xác định"}</span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Sách:</span>
                      <span className="text-base">{borrow.bookId?.title || "Không xác định"}</span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Trạng thái:</span>
                      <span className="text-base">
                        {borrow.returnDate
                          ? "Đã trả"
                          : borrow.status === "borrowing"
                          ? "Đang mượn"
                          : "Chờ lấy"}
                      </span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Ngày Mượn:</span>
                      <span className="text-base">
                        {new Date(borrow.borrowDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Ngày Trả:</span>
                      <span className="text-base">
                        {borrow.returnDate
                          ? new Date(borrow.returnDate).toLocaleDateString("vi-VN")
                          : "Chưa trả"}
                      </span>
                    </div>
                    <div className="py-2 flex items-center gap-2">
                      {!borrow.returnDate &&
                        (borrow.status === "borrowing" ? (
                          <button
                            onClick={() => handleConfirmReturn(borrow._id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                          >
                            <ArrowUturnUpIcon className="w-4 h-4" />
                            Xác nhận trả
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConfirmPickup(borrow._id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                          >
                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            Xác nhận lấy
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2 sm:gap-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-md"
                  }`}
                >
                  Trang trước
                </button>
                <div className="flex gap-1 sm:gap-2">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => goToPage(number)}
                      className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                        currentPage === number
                          ? "bg-cyan-400 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-md"
                  }`}
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-400 py-10 animate-slide-in text-lg sm:text-xl">
            Không có đơn mượn nào
          </p>
        )}
      </div>
    </div>
  );
};

export default BorrowBook;