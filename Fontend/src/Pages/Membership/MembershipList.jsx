import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllMemberships, getMembershipStatus, purchaseMembership, getUserPoints } from "../../redux/apiMembership";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaCrown, FaCheckCircle } from "react-icons/fa";

const membershipPriority = {
  Free: 0,
  Basic: 1,
  Premium: 2,
};

const MembershipList = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const memberships = useSelector((state) => state.membership.memberships);
  const currentMembership = useSelector((state) => state.membership.currentMembership);
  const isFetching = useSelector((state) => state.membership.isFetching);
  const error = useSelector((state) => state.membership.error);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState({});

  useEffect(() => {
    if (user?.accessToken) {
      const fetchUserPoints = async () => {
        try {
          const res = await getUserPoints(user.accessToken, axiosJWT);
          setUserPoints(res.points);
        } catch (err) {
          console.error("Lỗi khi lấy số điểm:", err);
        }
      };
      fetchUserPoints();
    }
  }, [user, axiosJWT]);

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
      const selectedMembership = memberships.find((m) => m._id === membershipId);
      const currentMembershipName = currentMembership?.membershipId.name;
      const selectedMembershipName = selectedMembership?.name;
      const method = selectedMethod[membershipId] || (selectedMembershipName === "Free" ? "free" : "vnpay");

      if (
        currentMembershipName &&
        membershipPriority[currentMembershipName] > membershipPriority[selectedMembershipName]
      ) {
        const confirmDowngrade = window.confirm(
          `Bạn đang sử dụng gói ${currentMembershipName}, cao hơn gói ${selectedMembershipName}. Việc mua gói thấp hơn sẽ thay thế gói hiện tại. Bạn có chắc chắn muốn tiếp tục?`
        );
        if (!confirmDowngrade) {
          return;
        }
      }

      if (method === "points" && userPoints < selectedMembership.price) {
        alert("Bạn không đủ điểm để mua gói này!");
        return;
      }

      const response = await purchaseMembership(membershipId, method, user.accessToken, dispatch, axiosJWT);
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        alert("Đăng ký gói thành công!");
        await getMembershipStatus(user.accessToken, dispatch, axiosJWT);
        if (method === "points") {
          setUserPoints(userPoints - selectedMembership.price);
        }
      }
    } catch (err) {
      alert("Lỗi khi mua gói: " + (err.response?.data?.message || err.message));
      await getMembershipStatus(user.accessToken, dispatch, axiosJWT);
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} VND`;
  };

  const formatPointsToVND = (points) => {
    const vnd = points;
    return vnd.toLocaleString("vi-VN");
  };

  const getMembershipBadge = (name) => {
    switch (name) {
      case "Free":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Free
          </span>
        );
      case "Basic":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200">
            Basic
          </span>
        );
      case "Premium":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-200">
            <FaCrown className="w-4 h-4 mr-1" /> Premium
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-24 sm:py-16 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Chọn gói thành viên của bạn
          </h2>
          {currentMembership && (
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Gói hiện tại: {getMembershipBadge(currentMembership.membershipId.name)} (Hết hạn:{" "}
              {new Date(currentMembership.userMembershipId.endDate).toLocaleDateString("vi-VN")})
            </p>
          )}
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Số điểm hiện tại: <span className="font-semibold">{userPoints} điểm</span> ={" "}
            <span className="font-semibold">{formatPointsToVND(userPoints)} VND</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 text-red-500 text-center text-sm sm:text-base font-medium">
            {error}
          </div>
        )}

        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {memberships.length > 0 ? (
              memberships.map((membership, index) => (
                <div
                  key={membership._id}
                  className="relative bg-white/95 dark:bg-gray-800/95 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 dark:from-blue-900/50 dark:to-teal-900/50 rounded-2xl -z-10"></div>
                  <div className="flex flex-col items-center mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {membership.name}
                    </h3>
                    <div className="mt-2">{getMembershipBadge(membership.name)}</div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    {formatPrice(membership.price)} / {membership.duration} ngày
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 w-5 h-5" /> {membership.viewLimit} lượt xem/ngày
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 w-5 h-5" /> {membership.downloadLimit} lượt tải/ngày
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 w-5 h-5" /> Hỗ trợ{" "}
                      {membership.name === "Premium" ? "ưu tiên" : "cơ bản"}
                    </li>
                  </ul>
                  {membership.name !== "Free" && (
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
                        Phương thức thanh toán:
                      </label>
                      <select
                        value={selectedMethod[membership._id] || "vnpay"}
                        onChange={(e) => setSelectedMethod({ ...selectedMethod, [membership._id]: e.target.value })}
                        className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      >
                        <option value="vnpay">VNPay</option>
                        <option value="points" disabled={userPoints < membership.price}>
                          Điểm ({userPoints < membership.price ? "Không đủ điểm" : "Sử dụng điểm"})
                        </option>
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => handlePurchase(membership._id)}
                    disabled={currentMembership?.membershipId._id === membership._id}
                    className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white rounded-lg shadow-md transition-all duration-300 ${
                      currentMembership?.membershipId._id === membership._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {currentMembership?.membershipId._id === membership._id ? "Đang sử dụng" : "Chọn gói"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center col-span-full text-base sm:text-lg animate-fade-in">
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