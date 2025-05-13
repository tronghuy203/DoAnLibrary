import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { payRentalFeeAndCreateBorrow, getBorrowRequestDetails } from "../../redux/apiBorrow";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook, FaCreditCard, FaArrowLeft, FaChevronDown } from "react-icons/fa";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const PaymentPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { requestDetails, isFetching, error } = useSelector((state) => state.borrow);
  const axiosJWT = createAxios(user, dispatch);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!requestId) {
      alert("Không tìm thấy ID yêu cầu mượn!");
      navigate("/");
      return;
    }

    if (!requestDetails || requestDetails._id !== requestId) {
      getBorrowRequestDetails(requestId, user.accessToken, dispatch, axiosJWT);
    }
  }, [requestId, user, requestDetails, navigate, axiosJWT, dispatch]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    try {
      const paymentData = await payRentalFeeAndCreateBorrow(
        requestId,
        paymentMethod,
        user.accessToken,
        dispatch,
        axiosJWT,
        navigate
      );
      if (paymentMethod === "cash") {
        alert("Thanh toán bằng tiền mặt thành công!");
      } else if (paymentMethod === "vnpay") {
        alert("Đang chuyển hướng đến VNPay...");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi thanh toán. Vui lòng thử lại!";
      console.error("Lỗi khi thanh toán:", err);
      alert(errorMessage);
    }
  };

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  if (isFetching || !requestDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 animate-pulse text-lg font-medium">
          Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400 text-lg font-medium">
          Có lỗi xảy ra khi tải thông tin!
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 min-h-screen relative bg-gradient-to-br from-blue-100 via-gray-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden">
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

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full sm:max-w-xl mx-auto p-6 sm:p-8 z-10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-3xl animate-gradient"></div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-8 tracking-tight italic">
          Thanh Toán Phí Mượn Sách
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <FaBook className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
            Thông Tin Thanh Toán
          </h2>
          <div className="grid grid-cols-1 gap-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-medium">Tên người nhận:</span>
              <span className="text-blue-600 dark:text-blue-400">
                {user?.username || user?.name || "Không xác định"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sách:</span>
              <span className="text-blue-600 dark:text-blue-400 truncate">
                {requestDetails.bookId?.title || requestDetails.bookId || "Chưa xác định"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phí mượn:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {(requestDetails.bookId?.price || "0").toLocaleString("vi-VN")} ₫
              </span>
            </div>
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
            Chọn Phương Thức Thanh Toán
          </h2>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500"
          >
            <option value="">-- Chọn phương thức --</option>
            <option value="vnpay">Thẻ tín dụng (VNPay)</option>
            <option value="cash">Tiền mặt</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-left flex items-center justify-between text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200"
          >
            <span className="flex items-center">
              <FaBook className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
              Hướng Dẫn Thanh Toán
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
                  <li>Chọn phương thức thanh toán phù hợp (Tiền mặt hoặc VNPay).</li>
                  <li>Nếu chọn Tiền mặt, đến thư viện tại<strong>tầng 9 trường Đại Học Đông Á, 33 Xô Viết Nghệ Tĩnh, Thành Phố Đà Nẵng</strong> để thanh toán.</li>
                  <li>Nếu chọn VNPay, bạn sẽ được chuyển hướng đến cổng thanh toán trực tuyến.</li>
                  <li>Sau khi thanh toán thành công, bạn sẽ nhận được xác nhận mượn sách.</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/books/${requestDetails.bookId?._id || ""}`)}
            className="w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Quay Lại Trang Sách
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={isFetching}
            className={`w-full bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FaCreditCard className="inline-block mr-2" />
            {isFetching ? "Đang xử lý..." : "Thanh Toán Ngay"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;