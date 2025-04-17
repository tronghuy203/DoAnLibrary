import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getBorrowHistory, deleteUser } from "../../redux/apiRequest"; // Added deleteUser import
import { getPaymentHistory } from "../../redux/apiBorrow";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  CogIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "./Sidebar";

const HistoryPage = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const axiosJWT = useMemo(() => {
    if (!user || !dispatch) {
      console.warn("User or dispatch is undefined, axiosJWT will not be created.");
      return null;
    }
    return createAxios(user, dispatch, loginSuccess);
  }, [user, dispatch]);

  const [borrowHistory, setBorrowHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.accessToken || !user?._id || !axiosJWT) {
      setError("Thiếu thông tin người dùng hoặc token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setLoadingHistory(true);
      setError(null);

      const history = await getBorrowHistory(user._id, user.accessToken, axiosJWT);
      console.log("Borrow History:", history);
      setBorrowHistory(Array.isArray(history) ? history : []);

      const paymentHistoryData = await getPaymentHistory(user._id, user.accessToken, axiosJWT);
      console.log("Payment History:", paymentHistoryData);
      setPaymentHistory(Array.isArray(paymentHistoryData) ? paymentHistoryData : []);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || err.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.accessToken, user?._id, axiosJWT]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, fetchData, navigate]);

  const shortenTxnRef = (txnRef) => {
    if (!txnRef) return "N/A";
    if (txnRef.length <= 18) return txnRef;
    return `${txnRef.slice(0, 7)}...${txnRef.slice(-5)}`;
  };

  const handleDelete = (id) => {
    if (user && user._id === id && axiosJWT) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (user && axiosJWT) {
      dispatch(deleteUser(user._id, user.accessToken, navigate, axiosJWT));
      setShowDeleteConfirm(false);
      setIsSidebarOpen(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto mt-16 sm:mt-20">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900 dark:text-white" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white animate-fade-in">
              Lịch sử hoạt động
            </h1>
          </div>
          <button
            className="lg:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6 text-gray-900 dark:text-white" />
          </button>
        </header>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl shadow-md animate-slide-in flex items-center gap-2 sm:gap-3">
            <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Xác nhận xóa tài khoản
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-14rem)]">
          <Sidebar
            user={user}
            handleDelete={handleDelete}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <main className="lg:w-3/4 space-y-6">
            <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg animate-fade-in-up">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                Lịch sử mượn sách
              </h2>
              {loadingHistory ? (
                <p className="text-gray-500 dark:text-gray-400 animate-pulse flex items-center gap-2 text-sm sm:text-base">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Đang tải lịch sử...
                </p>
              ) : borrowHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm sm:text-base">
                  <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Chưa có lịch sử mượn sách
                </p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-gray-900 dark:text-white">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3">Tên sách</th>
                          <th className="px-4 py-3">Ngày mượn</th>
                          <th className="px-4 py-3">Hạn trả</th>
                          <th className="px-4 py-3">Ngày trả</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Xác nhận</th>
                        </tr>
                      </thead>
                      <tbody>
                        {borrowHistory.map((record, index) => (
                          <tr
                            key={record._id || index}
                            className={`${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-800"
                                : "bg-gray-50 dark:bg-gray-700"
                            } hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200`}
                          >
                            <td className="px-4 py-3">{record.bookId?.title || "N/A"}</td>
                            <td className="px-4 py-3">
                              {record.borrowDate
                                ? new Date(record.borrowDate).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {record.dueDate
                                ? new Date(record.dueDate).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {record.returnDate
                                ? new Date(record.returnDate).toLocaleDateString("vi-VN")
                                : "Chưa trả"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                  record.status === "returned"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : record.status === "borrowing"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : record.status === "waiting_pickup"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {record.status === "returned" ? (
                                  <CheckCircleIcon className="h-5 w-5" />
                                ) : record.status === "borrowing" ? (
                                  <BookOpenIcon className="h-5 w-5" />
                                ) : record.status === "waiting_pickup" ? (
                                  <ClockIcon className="h-5 w-5" />
                                ) : (
                                  <ExclamationTriangleIcon className="h-5 w-5" />
                                )}
                                {record.status === "returned"
                                  ? "Đã trả"
                                  : record.status === "borrowing"
                                  ? "Đang mượn"
                                  : record.status === "waiting_pickup"
                                  ? "Chờ nhận"
                                  : "Quá hạn"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                  record.adminConfirmed
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {record.adminConfirmed ? (
                                  <CheckCircleIcon className="h-5 w-5" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5" />
                                )}
                                {record.adminConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {borrowHistory.map((record, index) => (
                      <div
                        key={record._id || index}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm"
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          <span className="font-medium">Tên sách:</span>{" "}
                          {record.bookId?.title || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Ngày mượn:</span>{" "}
                          {record.borrowDate
                            ? new Date(record.borrowDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Hạn trả:</span>{" "}
                          {record.dueDate
                            ? new Date(record.dueDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Ngày trả:</span>{" "}
                          {record.returnDate
                            ? new Date(record.returnDate).toLocaleDateString("vi-VN")
                            : "Chưa trả"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Trạng thái:</span>{" "}
                          <span
                            className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === "returned"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : record.status === "borrowing"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : record.status === "waiting_pickup"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {record.status === "returned"
                              ? "Đã trả"
                              : record.status === "borrowing"
                              ? "Đang mượn"
                              : record.status === "waiting_pickup"
                              ? "Chờ nhận"
                              : "Quá hạn"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Xác nhận:</span>{" "}
                          <span
                            className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                              record.adminConfirmed
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {record.adminConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg animate-fade-in-up">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                Lịch sử thanh toán
              </h2>
              {loadingHistory ? (
                <p className="text-gray-500 dark:text-gray-400 animate-pulse flex items-center gap-2 text-sm sm:text-base">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Đang tải lịch sử...
                </p>
              ) : paymentHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm sm:text-base">
                  <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Chưa có lịch sử thanh toán
                </p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-gray-900 dark:text-white">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3">Mã giao dịch</th>
                          <th className="px-4 py-3">Số tiền</th>
                          <th className="px-4 py-3">Phương thức</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Ngày thanh toán</th>
                          <th className="px-4 py-3">Tên sách</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment, index) => (
                          <tr
                            key={payment._id || index}
                            className={`${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-800"
                                : "bg-gray-50 dark:bg-gray-700"
                            } hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200`}
                          >
                            <td className="px-4 py-3 truncate">
                              {shortenTxnRef(payment.vnpayTxnRef)}
                            </td>
                            <td className="px-4 py-3">
                              {payment.amount ? payment.amount.toLocaleString("vi-VN") : "N/A"} ₫
                            </td>
                            <td className="px-4 py-3">
                              {payment.method === "cash"
                                ? "Tiền mặt"
                                : payment.method === "vnpay"
                                ? "Thẻ ngân hàng"
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                  payment.status === "success"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {payment.status === "success" ? (
                                  <CheckCircleIcon className="h-5 w-5" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5" />
                                )}
                                {payment.status === "success" ? "Thành công" : "Thất bại"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {payment.createdAt
                                ? new Date(payment.createdAt).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {payment.borrowRecordId?.bookId?.title || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {paymentHistory.map((payment, index) => (
                      <div
                        key={payment._id || index}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm"
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          <span className="font-medium">Mã giao dịch:</span>{" "}
                          {shortenTxnRef(payment.vnpayTxnRef)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Số tiền:</span>{" "}
                          {payment.amount ? payment.amount.toLocaleString("vi-VN") : "N/A"} ₫
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Phương thức:</span>{" "}
                          {payment.method === "cash"
                            ? "Tiền mặt"
                            : payment.method === "vnpay"
                            ? "Thẻ ngân hàng"
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Trạng thái:</span>{" "}
                          <span
                            className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === "success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {payment.status === "success" ? "Thành công" : "Thất bại"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Ngày thanh toán:</span>{" "}
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Tên sách:</span>{" "}
                          {payment.borrowRecordId?.bookId?.title || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;