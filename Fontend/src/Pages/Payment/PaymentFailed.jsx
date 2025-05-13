import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { FaPhone, FaEnvelope, FaChevronDown, FaArrowLeft } from "react-icons/fa";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-gray-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden">
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
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full sm:max-w-2xl mx-auto p-6 sm:p-8 z-10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-t-3xl animate-gradient"></div>

        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-200 dark:bg-red-900 opacity-30 blur-xl rounded-full animate-pulse-slow"></div>
            <div className="bg-red-100 dark:bg-red-950 p-5 rounded-full">
              <XCircleIcon className="w-14 h-14 text-red-500 dark:text-red-400" />
            </div>
          </motion.div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-red-700 dark:text-red-500 mb-6 tracking-tight italic">
          Thanh Toán Thất Bại
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6"
        >
          Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại sau hoặc liên hệ đội ngũ hỗ trợ để được trợ giúp.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <button
            onClick={() => setShowSupport(!showSupport)}
            className="w-full text-left flex items-center justify-between text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200"
          >
            <span className="flex items-center">
              <FaPhone className="w-6 h-6 mr-2 text-red-500 dark:text-red-400" />
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
                  <FaPhone className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <a href="tel:+84234567890" className="text-red-600 dark:text-red-400 hover:underline">
                    +84 234 567 890
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <a href="mailto:support@library.com" className="text-red-600 dark:text-red-400 hover:underline">
                    support@library.com
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/all-books")}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <FaArrowLeft className="inline-block mr-2" />
          Quay Lại Danh Sách Sách
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;