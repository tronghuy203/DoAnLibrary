// src/components/MembershipList.js
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllMemberships, getMembershipStatus, purchaseMembership } from "../../redux/apiMembership";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaCrown, FaCheckCircle } from "react-icons/fa";

const MembershipList = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const memberships = useSelector((state) => state.membership.memberships);
  const currentMembership = useSelector((state) => state.membership.currentMembership);
  const isFetching = useSelector((state) => state.membership.isFetching);
  const purchaseStatus = useSelector((state) => state.membership.purchaseStatus);
  const error = useSelector((state) => state.membership.error);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user?.accessToken) {
      getAllMemberships(user.accessToken, dispatch, axiosJWT);
      getMembershipStatus(user.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate, dispatch, axiosJWT]);

  const handlePurchase = async (membershipId) => {
    try {
      const method = membershipId === memberships.find((m) => m.name === "Free")?._id ? "free" : "vnpay";
      const response = await purchaseMembership(membershipId, method, user.accessToken, dispatch, axiosJWT);
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl; // Chuyển hướng đến VNPay
      } else {
        alert("Đăng ký gói thành công!");
        getMembershipStatus(user.accessToken, dispatch, axiosJWT); // Cập nhật trạng thái gói
      }
    } catch (err) {
      alert("Lỗi khi mua gói: " + err.message);
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} VND`;
  };

  const getMembershipBadge = (name) => {
    switch (name) {
      case "Free":
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">Free</span>;
      case "Basic":
        return <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm">Basic</span>;
      case "Premium":
        return (
          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
            <FaCrown className="w-4 h-4" /> Premium
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-zinc-800 flex justify-center items-start py-32 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <h2
            data-aos="slide-up"
            className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-slide-in-left"
          >
            Chọn gói thành viên của bạn
          </h2>
          {currentMembership && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Gói hiện tại: {getMembershipBadge(currentMembership.membershipId.name)} (Hết hạn:{" "}
              {new Date(currentMembership.userMembershipId.endDate).toLocaleDateString("vi-VN")})
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 text-red-500 text-center">
            {error}
          </div>
        )}

        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-300 dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {memberships.length > 0 ? (
              memberships.map((membership, index) => (
                <div
                  key={membership._id}
                  className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 to-blue-200/20 dark:from-gray-700/20 dark:to-indigo-900/20 rounded-2xl -z-10"></div>
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
                      {membership.name}
                    </h3>
                    {getMembershipBadge(membership.name)}
                  </div>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                    {formatPrice(membership.price)} / {membership.duration} ngày
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" /> {membership.viewLimit} lượt xem/ngày
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" /> {membership.downloadLimit} lượt tải/ngày
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" /> Hỗ trợ {membership.name === "Premium" ? "ưu tiên" : "cơ bản"}
                    </li>
                  </ul>
                  <button
                    onClick={() => handlePurchase(membership._id)}
                    disabled={currentMembership?.membershipId._id === membership._id}
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg shadow-md transform transition-all duration-300 ${
                      currentMembership?.membershipId._id === membership._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 hover:scale-105"
                    }`}
                  >
                    {currentMembership?.membershipId._id === membership._id ? "Đang sử dụng" : "Chọn gói"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center col-span-full text-lg animate-fade-in">
                Không có gói thành viên nào.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipList;