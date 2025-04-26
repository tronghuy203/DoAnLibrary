import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllUsers, updateUserProfile } from "../../redux/apiRequest";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  CloudArrowUpIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import Sidebar from "./Sidebar";

const countries = [
  { code: "VN", name: "Việt Nam" },
  { code: "US", name: "United States" },
  { code: "JP", name: "Japan" },
];

const citiesByCountry = {
  VN: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"],
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
  JP: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"],
};

const CLOUDINARY_UPLOAD_PRESET = "profileimage";
const CLOUDINARY_CLOUD_NAME = "dy889jy4s";

const Profile = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const axiosJWT = useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user, dispatch]
  );

  const [editMode, setEditMode] = useState({
    profile: false,
    personalInfo: false,
    address: false,
  });
  const [updatedData, setUpdatedData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
    avatar:
      user?.avatar ||
      "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
    country: user?.country || "",
    city: user?.city || "",
    postalCode: user?.postalCode || "",
    taxId: user?.taxId || "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (axiosJWT) {
      getAllUsers(user.accessToken, dispatch, axiosJWT).catch((err) => {
        console.error("Error fetching users:", err);
        setError("Không thể tải dữ liệu người dùng.");
      });
    }
  }, [user, navigate, dispatch, axiosJWT]);

  const handleUpdate = async () => {
    if (!axiosJWT) {
      setError("Không thể kết nối đến server.");
      return;
    }
    try {
      const payload = { ...updatedData };
      await updateUserProfile(user._id, payload, user.accessToken, axiosJWT, dispatch);
      dispatch(loginSuccess({ ...user, ...payload }));
      setEditMode({ profile: false, personalInfo: false, address: false });
      setSuccess("Cập nhật hồ sơ thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancel = () => {
    setUpdatedData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
      avatar:
        user?.avatar ||
        "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
      country: user?.country || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
      taxId: user?.taxId || "",
    });
    setEditMode({ profile: false, personalInfo: false, address: false });
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        setUpdatedData({ ...updatedData, avatar: data.secure_url });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Tải ảnh thất bại. Vui lòng thử lại.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setUpdatedData({
      ...updatedData,
      country: selectedCountry,
      city: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto mt-16 sm:mt-20">
        <header className="mb-6 flex items-center justify-between group">
          <div className="flex items-center gap-3 transform group-hover:translate-x-1 transition-transform duration-300">
            <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white animate-fade-in">
              Cài đặt tài khoản
            </h1>
          </div>
          <button
            className="lg:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6 text-gray-900 dark:text-white" />
          </button>
        </header>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl shadow-md animate-slide-in flex items-center gap-2 sm:gap-3 hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors duration-300">
            <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 transform hover:rotate-12 transition-transform duration-200" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl shadow-md animate-slide-in flex items-center gap-2 sm:gap-3 hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors duration-300">
            <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 transform hover:scale-110 transition-transform duration-200" />
            <span className="text-sm sm:text-base">{success}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-14rem)]">
          <Sidebar
            user={user}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <main className="lg:w-3/4 space-y-6">
            <section id="profile" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up group">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  <IdentificationIcon className="h-5 w-5 sm:h-6 sm:w-6 transform group-hover:scale-110 transition-transform duration-200" />
                  Hồ sơ của tôi
                </h2>
                {!editMode.profile ? (
                  <button
                    onClick={() => setEditMode({ ...editMode, profile: true })}
                    className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative group">
                  <img
                    src={updatedData.avatar}
                    alt="Ảnh đại diện"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md group-hover:ring-4 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300"
                  />
                  {editMode.profile && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-blue-600 hover:scale-110 transition-all duration-300">
                      <CameraIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  {editMode.profile ? (
                    <input
                      type="text"
                      value={updatedData.username}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                    />
                  ) : (
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {updatedData.username || "Chưa có tên"}
                      </h3>
                      <span
                        className={`mt-2 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white rounded-full w-36 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 ${
                          user?.admin ? "bg-indigo-600" : "bg-teal-500"
                        } hover:bg-opacity-80 transition-opacity duration-300`}
                      >
                        <IdentificationIcon className="h-4 w-4" />
                        {user?.admin ? "Quản trị viên" : "Người dùng"}
                      </span>
                    </div>
                  )}
                  {uploading && (
                    <p className="text-amber-500 text-xs sm:text-sm mt-2 animate-pulse flex items-center justify-center sm:justify-start gap-2">
                      <CloudArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 transform animate-bounce" />
                      Đang tải...
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up group">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  <IdentificationIcon className="h-5 w-5 sm:h-6 sm:w-6 transform group-hover:scale-110 transition-transform duration-200" />
                  Thông tin cá nhân
                </h2>
                {!editMode.personalInfo ? (
                  <button
                    onClick={() => setEditMode({ ...editMode, personalInfo: true })}
                    className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="group">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <IdentificationIcon className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:scale-110 transition-transform duration-200" />
                    Họ và tên
                  </label>
                  {editMode.personalInfo ? (
                    <input
                      type="text"
                      value={updatedData.username}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {updatedData.username || "Chưa có"}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:scale-110 transition-transform duration-200" />
                    Địa chỉ Email
                  </label>
                  {editMode.personalInfo ? (
                    <input
                      type="email"
                      value={updatedData.email}
                      onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {updatedData.email || "Chưa có"}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:scale-110 transition-transform duration-200" />
                    Số điện thoại
                  </label>
                  {editMode.personalInfo ? (
                    <input
                      type="tel"
                      value={updatedData.phone}
                      onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {updatedData.phone || "Chưa có"}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:scale-110 transition-transform duration-200" />
                    Ngày sinh
                  </label>
                  {editMode.personalInfo ? (
                    <input
                      type="date"
                      value={updatedData.dob}
                      onChange={(e) => setUpdatedData({ ...updatedData, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {updatedData.dob
                        ? new Date(updatedData.dob).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up group">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 transform group-hover:scale-110 transition-transform duration-200" />
                  Địa chỉ
                </h2>
                {!editMode.address ? (
                  <button
                    onClick={() => setEditMode({ ...editMode, address: true })}
                    className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                    >
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="group">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:scale-110 transition-transform duration-200" />
                    Quốc gia
                  </label>

                  {editMode.address ? (
                    <select
                      value={updatedData.country}
                      onChange={handleCountryChange}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                    >
                      <option value="">Chọn quốc gia</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {countries.find((c) => c.code === updatedData.country)?.name || "Chưa có"}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:scale-110 transition-transform duration-200" />
                    Thành phố/Khu vực
                  </label>
                  {editMode.address ? (
                    <select
                      value={updatedData.city}
                      onChange={(e) => setUpdatedData({ ...updatedData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                      disabled={!updatedData.country}
                    >
                      <option value="">Chọn thành phố</option>
                      {updatedData.country &&
                        citiesByCountry[updatedData.country]?.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {updatedData.city || "Chưa có"}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;