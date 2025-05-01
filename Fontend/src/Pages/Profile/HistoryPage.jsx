import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getBorrowHistory } from "../../redux/apiRequest";
import { getPaymentHistory, getPenaltyByBorrow, payPenalty } from "../../redux/apiBorrow";
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
  CurrencyDollarIcon,
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
  const [penalties, setPenalties] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.accessToken || !user?._id || !axiosJWT) {
      setError("Thiếu thông tin người dùng hoặc token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setLoadingHistory(true);
      setError(null);

      const history = await getBorrowHistory(user._id, user.accessToken, axiosJWT);
      setBorrowHistory(Array.isArray(history) ? history : []);

      const penaltyPromises = history.map(async (record) => {
        try {
          const penalty = await getPenaltyByBorrow(record._id, user.accessToken, axiosJWT);
          return { penaltyId: penalty._id, penalty, borrowId: record._id };
        } catch (err) {
          return { penaltyId: null, penalty: null, borrowId: record._id };
        }
      });
      const penaltyResults = await Promise.all(penaltyPromises);
      const penaltyMap = penaltyResults.reduce((acc, { penaltyId, penalty, borrowId }) => {
        if (penalty && penaltyId) {
          acc[penaltyId] = penalty; 
          acc[borrowId] = penalty; 
        }
        return acc;
      }, {});
      setPenalties(penaltyMap);

      const paymentHistoryData = await getPaymentHistory(user._id, user.accessToken, axiosJWT);
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

  const handlePayPenalty = async (penaltyId, method) => {
    console.log("handlePayPenalty called with:", { penaltyId, method });
    if (!penaltyId || !penalties[penaltyId]) {
      console.error("Penalty not found:", { penaltyId, penalties });
      setError("Không tìm thấy khoản phạt để thanh toán.");
      return;
    }
    if (method !== "vnpay") {
      setError("Phương thức thanh toán không được hỗ trợ.");
      return;
    }
    try {
      const res = await payPenalty(penaltyId, method, user.accessToken, dispatch, axiosJWT);
      console.log("PayPenalty Response:", res);

      if (res.paymentUrl) {
        console.log("Redirecting to VNPay:", res.paymentUrl);
        window.location.href = res.paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ VNPay.");
      }

      await fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Thanh toán thất bại. Vui lòng thử lại.";
      console.error("Payment Error:", {
        penaltyId,
        method,
        message: err.message,
        response: err.response?.data,
      });
      setError(errorMessage);
    }
  };

  const shortenTxnRef = (txnRef) => {
    if (!txnRef) return "N/A";
    if (txnRef.length <= 18) return txnRef;
    return `${txnRef.slice(0, 7)}...${txnRef.slice(-5)}`;
  };

  const getStatusDisplay = (status, returnDate) => {
    if (returnDate) return { text: "Đã trả", icon: <CheckCircleIcon className="h-5 w-5" /> };
    switch (status) {
      case "borrowing":
        return { text: "Đang mượn", icon: <BookOpenIcon className="h-5 w-5" /> };
      case "overdue":
        return { text: "Quá hạn", icon: <ExclamationTriangleIcon className="h-5 w-5" /> };
      case "waiting_pickup":
        return { text: "Chờ nhận", icon: <ClockIcon className="h-5 w-5" /> };
      default:
        return { text: status, icon: null };
    }
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

        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-14rem)]">
          <Sidebar
            user={user}
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
                          <th className="px-6 py-3">Tên sách</th>
                          <th className="px-4 py-3">Ngày mượn</th>
                          <th className="px-4 py-3">Hạn trả</th>
                          <th className="px-4 py-3">Ngày trả</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Phạt</th>
                          <th className="px-4 py-3">Hành động</th>
                          <th className="px-4 py-3">Xác nhận</th>
                        </tr>
                      </thead>
                      <tbody>
                        {borrowHistory.map((record, index) => {
                          const statusDisplay = getStatusDisplay(record.status, record.returnDate);
                          const penalty = penalties[record._id];
                          return (
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
                                    record.status === "overdue"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                      : record.status === "borrowing"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                      : record.status === "waiting_pickup"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  }`}
                                >
                                  {statusDisplay.icon}
                                  {statusDisplay.text}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {penalty ? (
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                      penalty.status === "pending"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    }`}
                                  >
                                    <CurrencyDollarIcon className="h-5 w-5" />
                                    {penalty.amount.toLocaleString("vi-VN")} ₫
                                    <span>({penalty.status === "pending" ? "Chưa trả" : "Đã trả"})</span>
                                  </span>
                                ) : (
                                  "Không có"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {penalty && penalty.status === "pending" && (
                                  <button
                                    onClick={() => handlePayPenalty(penalty._id, "vnpay")}
                                    className="bg-blue-500 dark:bg-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                                  >
                                    <CreditCardIcon className="w-4 h-4" />
                                    Thanh toán (VNPay)
                                  </button>
                                )}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {borrowHistory.map((record, index) => {
                      const statusDisplay = getStatusDisplay(record.status, record.returnDate);
                      const penalty = penalties[record._id];
                      return (
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
                                record.status === "overdue"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : record.status === "borrowing"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : record.status === "waiting_pickup"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              }`}
                            >
                              {statusDisplay.icon}
                              {statusDisplay.text}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Phạt:</span>{" "}
                            {penalty ? (
                              <span
                                className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  penalty.status === "pending"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                }`}
                              >
                                <CurrencyDollarIcon className="h-4 w-4" />
                                {penalty.amount.toLocaleString("vi-VN")} ₫
                                <span>({penalty.status === "pending" ? "Chưa trả" : "Đã trả"})</span>
                              </span>
                            ) : (
                              "Không có"
                            )}
                          </p>
                          {penalty && penalty.status === "pending" && (
                            <div className="mt-2">
                              <button
                                onClick={() => handlePayPenalty(penalty._id, "vnpay")}
                                className="bg-blue-500 dark:bg-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                              >
                                <CreditCardIcon className="w-4 h-4" />
                                Thanh toán (VNPay)
                              </button>
                            </div>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Xác nhận:</span>{" "}
                            <span
                              className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
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
                          </p>
                        </div>
                      );
                    })}
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
                              {payment.method === "vnpay" ? "Thẻ ngân hàng" : "N/A"}
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
                          {payment.method === "vnpay" ? "Thẻ ngân hàng" : "N/A"}
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