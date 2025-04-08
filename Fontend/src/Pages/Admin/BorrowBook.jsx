import React, { useEffect, useMemo } from "react";
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
  // Giả sử reducer của bạn được đăng ký dưới key "borrow"
  const borrowList = useSelector((state) => state.borrow.borrowRecords);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user, dispatch]
  );

  useEffect(() => {
    if (user?.accessToken) {
      getAllBorrowRecords(user.accessToken, dispatch, axiosJWT);
      console.log("Borrow List from Redux:", borrowList);
    }
  }, [user, dispatch, axiosJWT]);

  const handleConfirmPickup = async (id) => {
    try {
      await confirmPickup(id, user.accessToken, dispatch, axiosJWT);
      await getAllBorrowRecords(user.accessToken, dispatch, axiosJWT); // Refresh danh sách
    } catch (err) {
      console.error("❌ Xác nhận lấy sách thất bại", err);
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await confirmReturn(id, user.accessToken, dispatch, axiosJWT);
      await getAllBorrowRecords(user.accessToken, dispatch, axiosJWT); // Refresh danh sách
    } catch (err) {
      console.error("❌ Xác nhận trả sách thất bại", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4">
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-10">
        Quản Lý Mượn Trả Sách
      </h2>

      {borrowList?.length > 0 ? (
        <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-md border border-gray-700/50 overflow-hidden">
          {/* Tiêu đề bảng */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_2fr_2fr_1fr_1fr_1.5fr] bg-gray-700 text-gray-200 font-semibold p-4">
            <div>ID</div>
            <div>Người Mượn</div>
            <div>Sách</div>
            <div>Trạng thái</div>
            <div>Ngày mượn</div>
            <div>Hành động</div>
          </div>

          {/* Nội dung bảng */}
          <div className="divide-y divide-gray-700">
            {borrowList.map((borrow) => (
              <div
                key={borrow._id}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr_2fr_1fr_1fr_1.5fr] p-4 hover:bg-gray-750 transition-all duration-300"
              >
                <div className="text-sm break-all">
                  {borrow._id.slice(-6)}
                </div>
                <div>{borrow.userId?.username}</div>
                <div>{borrow.bookId?.title}</div>
                <div>
                  {borrow.returnDate
                    ? "Đã trả"
                    : borrow.status === "borrowing"
                    ? "Đang mượn"
                    : "Chờ lấy"}
                </div>
                <div>
                  {new Date(borrow.borrowDate).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {/* Nếu chưa có returnDate, hiển thị nút hành động */}
                  {!borrow.returnDate &&
                    (borrow.status === "borrowing" ? (
                      <button
                        onClick={() => handleConfirmReturn(borrow._id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <ArrowUturnUpIcon className="w-4 h-4" />
                        Xác nhận trả
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirmPickup(borrow._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
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
      ) : (
        <p className="text-center text-gray-400 text-lg">
          Không có đơn mượn nào
        </p>
      )}
    </div>
  );
};

export default BorrowBook;
