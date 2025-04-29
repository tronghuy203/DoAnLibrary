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
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const BorrowBook = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const borrowList = useSelector((state) => state.borrow.borrowRecords);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

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
      console.error("Xác nhận lấy sách thất bại", err);
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await confirmReturn(id, user.accessToken, dispatch, axiosJWT);
      await getAllBorrowRecords(user.accessToken, dispatch, axiosJWT);
    } catch (err) {
      console.error("Xác nhận trả sách thất bại", err);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[50%] left-[70%] w-64 h-64 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-[10%] right-[20%] w-56 h-56 bg-cyan-300/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0">
          <div className="absolute w-3 h-3 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[15%] left-[10%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[45%] left-[75%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-purple-500/50 dark:bg-purple-400/40 rounded-full top-[65%] left-[25%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[5%] left-[55%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[30%] left-[85%] animate-particle"></div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-slide-up">
          <BookOpenIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-4 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Quản Lý Mượn Trả Sách
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Theo dõi và quản lý các đơn mượn sách một cách dễ dàng
          </p>
        </div>

        {borrowList?.length > 0 ? (
          <>
            <div className="w-full bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-[0.5fr_1.5fr_2fr_1fr_1fr_1fr_2fr] bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/50 dark:to-blue-900/50 text-gray-900 dark:text-gray-100 font-semibold p-6 sm:p-8">
                <div className="text-base sm:text-lg">ID</div>
                <div className="text-base sm:text-lg">Người Mượn</div>
                <div className="text-base sm:text-lg">Sách</div>
                <div className="text-base sm:text-lg">Trạng thái</div>
                <div className="text-base sm:text-lg">Ngày Mượn</div>
                <div className="text-base sm:text-lg">Ngày Trả</div>
                <div className="text-base sm:text-lg">Hành động</div>
              </div>

              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {currentRecords.map((borrow) => (
                  <div
                    key={borrow._id}
                    className="flex flex-col sm:grid sm:grid-cols-[0.5fr_1.5fr_2fr_1fr_1fr_1fr_2fr] p-5 sm:p-8 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-750/80 dark:hover:to-gray-700/80 hover:-translate-y-0.5 hover:border-l-4 hover:border-cyan-500 transition-all duration-300 animate-slide-up"
                  >
                    <div className="py-2 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-600 dark:text-cyan-400 mr-2">ID:</span>
                      <span className="text-base break-all">{borrow._id.slice(-6)}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-600 dark:text-cyan-400 mr-2">Người Mượn:</span>
                      <span className="text-base">{borrow.userId?.username || "Không xác định"}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-600 dark:text-cyan-400 mr-2">Sách:</span>
                      <span className="text-base">{borrow.bookId?.title || "Không xác định"}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-600 dark:text-cyan-400 mr-2">Trạng thái:</span>
                      <span className="text-base">
                        {borrow.returnDate
                          ? "Đã trả"
                          : borrow.status === "borrowing"
                          ? "Đang mượn"
                          : "Chờ lấy"}
                      </span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-600 dark:text-cyan-400 mr-2">Ngày Mượn:</span>
                      <span className="text-base">
                        {new Date(borrow.borrowDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-600 dark:text-cyan-400 mr-2">Ngày Trả:</span>
                      <span className="text-base">
                        {borrow.returnDate
                          ? new Date(borrow.returnDate).toLocaleDateString("vi-VN")
                          : "Chưa trả"}
                      </span>
                    </div>
                    <div className="py-2 flex items-center gap-3 sm:gap-4">
                      {!borrow.returnDate &&
                        (borrow.status === "borrowing" ? (
                          <button
                            onClick={() => handleConfirmReturn(borrow._id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 text-white font-semibold py-2 px-4 sm:px-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2 text-base"
                          >
                            <ArrowUturnUpIcon className="w-6 h-6 text-white transform hover:rotate-12 transition-transform duration-200" />
                            Xác nhận trả
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConfirmPickup(borrow._id)}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 hover:from-amber-700 hover:to-amber-800 dark:hover:from-amber-600 dark:hover:to-amber-700 text-white font-semibold py-2 px-4 sm:px-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2 text-base"
                          >
                            <ClipboardDocumentCheckIcon className="w-6 h-6 text-white transform hover:rotate-12 transition-transform duration-200" />
                            Xác nhận lấy
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-4 sm:gap-6 animate-slide-up">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-700 dark:from-cyan-500 dark:to-cyan-600 hover:from-cyan-700 hover:to-cyan-800 dark:hover:from-cyan-600 dark:hover:to-cyan-700 text-white hover:shadow-lg hover:scale-110"
                  }`}
                >
                  ←
                </button>
                <div className="flex gap-3 sm:gap-4">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => goToPage(number)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 ${
                        currentPage === number
                          ? "bg-gradient-to-r from-cyan-600 to-cyan-700 dark:from-cyan-500 dark:to-cyan-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-gray-300 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-800 dark:text-gray-200 hover:text-white hover:scale-105"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-700 dark:from-cyan-500 dark:to-cyan-600 hover:from-cyan-700 hover:to-cyan-800 dark:hover:from-cyan-600 dark:hover:to-cyan-700 text-white hover:shadow-lg hover:scale-110"
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 animate-pulse">
            <BookOpenIcon className="w-24 h-24 mx-auto text-cyan-600 dark:text-cyan-400 mb-6 animate-bounce" />
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4">
              Không có đơn mượn nào
            </p>
            <button
              onClick={() => window.location.href = "/books"}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 hover:from-cyan-700 hover:to-blue-700 dark:hover:from-cyan-600 dark:hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto text-base sm:text-lg"
            >
              <BookOpenIcon className="w-6 h-6 text-white" />
              Xem danh sách sách
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowBook;