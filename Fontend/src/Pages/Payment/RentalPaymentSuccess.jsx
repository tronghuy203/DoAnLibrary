import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { checkPaymentStatus } from "../../redux/apiBorrow";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook, FaCreditCard, FaArrowLeft, FaInfoCircle, FaChevronDown, FaPhone, FaEnvelope } from "react-icons/fa";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import Confetti from "react-confetti";

const RentalPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);

  const axiosJWT = useMemo(() => {
    if (user) {
      return createAxios(user, dispatch);
    }
    return null;
  }, [user, dispatch]);

  const { txnRef, payment, borrowRecord } = location.state || {};
  const [paymentData, setPaymentData] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!user || !user.accessToken) {
      console.error("Người dùng chưa đăng nhập");
      navigate("/login");
      return;
    }

    const fetchPaymentData = async () => {
      if (txnRef && axiosJWT) {
        try {
          const res = await checkPaymentStatus(txnRef, user.accessToken, dispatch, axiosJWT);
          setPaymentData(res);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu thanh toán:", err);
          navigate("/payment-failed");
        }
      } else if (payment && borrowRecord) {
        setPaymentData({ payment, borrowRecord });
      } else {
        console.error("Không có dữ liệu thanh toán hợp lệ");
        navigate("/payment-failed");
      }
    };

    fetchPaymentData();
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [txnRef, payment, borrowRecord, user?.accessToken, axiosJWT, dispatch, navigate]);

  const shortenTxnRef = (txnRef) => {
    if (!txnRef) return "N/A";
    if (txnRef.length <= 18) return txnRef;
    return `${txnRef.slice(0, 10)}...${txnRef.slice(-8)}`;
  };

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "N/A";
  };

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 animate-pulse text-lg font-medium">
          Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  const { payment: paymentInfo, borrowRecord: borrow } = paymentData;

  return (
    <div className="mt-10 min-h-screen relative bg-gradient-to-br from-blue-100 via-gray-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: ["#60A5FA", "#34D399"] },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 1, direction: "none", random: true },
          },
          interactivity: {
            events: { onhover: { enable: true, mode: "repulse" } },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full sm:max-w-3xl mx-auto p-6 sm:p-8 z-10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-3xl animate-gradient"></div>

        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-30 blur-xl rounded-full animate-pulse-slow"></div>
            <div className="bg-green-100 dark:bg-green-950 p-5 rounded-full">
              <motion.svg
                className="w-14 h-14 text-green-500 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0, rotate: -45 }}
                  animate={{ pathLength: 1, rotate: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.svg>
            </div>
          </motion.div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-6 tracking-tight italic">
          Thanh Toán Thành Công
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center items-center mb-10"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse-slow">
                <FaCreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">Thanh toán</span>
            </motion.div>
            <div className="w-10 sm:w-12 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse-slow">
                <FaBook className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">Chờ nhận sách</span>
            </motion.div>
            <div className="w-10 sm:w-12 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FaBook className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">Nhận sách</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <FaCreditCard className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            Thông Tin Thanh Toán
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-medium">Mã giao dịch:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{shortenTxnRef(paymentInfo.vnpayTxnRef || "N/A")}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Số tiền:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {paymentInfo.amount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phương thức:</span>
              <span>
                {paymentInfo.method === "cash"
                  ? "Tiền mặt"
                  : paymentInfo.method === "vnpay"
                  ? "Thẻ ngân hàng"
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <span className="text-green-500 dark:text-green-400 font-semibold">
                {paymentInfo.status === "success" ? "Thành công" : "N/A"}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <FaBook className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            Thông Tin Mượn Sách
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-medium">Tên sách:</span>
              <span className="text-blue-600 dark:text-blue-400">{borrow?.bookId?.title || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {borrow?.status === "waiting_pickup" ? "Chờ nhận" : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Ngày mượn:</span>
              <span className="font-bold ">{formatDate(borrow?.borrowDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Hạn trả:</span>
              <span className="font-bold ">{formatDate(borrow?.dueDate)}</span>
            </div>

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-left flex items-center justify-between text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200"
          >
            <span className="flex items-center">
              <FaBook className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
              Hướng Dẫn Nhận Sách
            </span>
            <motion.div animate={{ rotate: showGuide ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <FaChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base"
              >
                <ol className="list-decimal list-inside space-y-2">
                  <li>Đến thư viện tại <strong>tầng 9 trường Đại Học Đông Á, 33 Xô Viết Nghệ Tĩnh, Thành Phố Đà Nẵng</strong> trong giờ làm việc (8:00 - 17:00).</li>
                  <li>Cung cấp <strong>mã giao dịch</strong>, <strong>tên sách</strong> hoặc <strong>thông tin người dùng </strong>tại quầy tiếp nhận.</li>
                  <li>Kiểm tra sách và ký xác nhận nhận sách.</li>
                  <li>Trả sách đúng hạn trước <strong>{formatDate(borrow?.dueDate)}</strong>.</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <button
            onClick={() => setShowSupport(!showSupport)}
            className="w-full text-left flex items-center justify-between text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200"
          >
            <span className="flex items-center">
              <FaPhone className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
              Liên Hệ Hỗ Trợ
            </span>
            <motion.div animate={{ rotate: showSupport ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <FaChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showSupport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  <FaPhone className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <a href="tel:+84234567890" className="text-blue-600 dark:text-blue-400 hover:underline">
                    +84 234 567 890
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <a href="mailto:support@library.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@library.com
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/all-books")}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Quay Lại Danh Sách Sách
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/history")}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <FaInfoCircle className="inline-block mr-2" />
            Xem Lịch Sử Mượn
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RentalPaymentSuccess;
