import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUserProfile } from "../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const CLOUDINARY_UPLOAD_PRESET = "profileimage";
const CLOUDINARY_CLOUD_NAME = "dy889jy4s";

const Profile = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [editMode, setEditMode] = useState({
    profile: false,
    personalInfo: false,
    address: false,
  });
  const [updatedData, setUpdatedData] = useState({
    username: user?.username || "",
    firstName: user?.username?.split(" ")[0] || "",
    lastName: user?.username?.split(" ")[1] || "",
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user?.accessToken) {
      getAllUsers(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, navigate, axiosJWT]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleDelete = (id) => {
    if (user && user._id === id) {
      dispatch(deleteUser(id, user.accessToken, navigate, axiosJWT));
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...updatedData,
        username: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
      };
      console.log("Sending update payload:", payload);
      await updateUserProfile(user._id, payload, user.accessToken, axiosJWT, dispatch);
      dispatch(
        loginSuccess({
          ...user,
          ...payload,
        })
      ); // Update Redux store
      setEditMode({ profile: false, personalInfo: false, address: false });
      setSuccess("Cập nhật hồ sơ thành công!");
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      setError("Cập nhật thất bại. Vui lòng thử lại.");
      setSuccess(null);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancel = () => {
    setUpdatedData({
      username: user?.username || "",
      firstName: user?.username?.split(" ")[0] || "",
      lastName: user?.username?.split(" ")[1] || "",
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
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setUpdatedData({ ...updatedData, avatar: data.secure_url });
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
      setError("Tải ảnh thất bại. Vui lòng thử lại.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-6 sm:px-6 md:px-8 lg:px-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg transform transition-all hover:shadow-xl">
        <h1 className="mt-10 text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white">
          Cài đặt tài khoản
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>
        )}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-md">
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg">
              <li>
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 font-semibold px-3 py-2 border border-blue-600 dark:border-blue-400 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-300 block text-center"
                >
                  Hồ sơ của tôi
                </a>
              </li>
              {[
                "Bảo mật",
                "Nhóm",
                "Thành viên nhóm",
                "Thông báo",
                "Thanh toán",
                "Xuất dữ liệu",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:underline px-3 py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 block text-center"
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li className="mt-8 sm:mt-10">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-600 dark:text-red-400 hover:underline px-3 py-2 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300 block text-center w-full"
                >
                  Xóa tài khoản
                </button>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 md:mb-6 text-gray-900 dark:text-white">
              Hồ sơ của tôi
            </h2>

            {/* Profile Section */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8 transform transition-all hover:scale-[1.01] duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  <img
                    src={updatedData.avatar}
                    alt="Ảnh đại diện"
                    className="w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md"
                  />
                  <div>
                    {editMode.profile ? (
                      <input
                        type="text"
                        value={updatedData.username}
                        onChange={(e) =>
                          setUpdatedData({
                            ...updatedData,
                            username: e.target.value,
                            firstName: e.target.value.split(" ")[0] || "",
                            lastName: e.target.value.split(" ")[1] || "",
                          })
                        }
                        className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                          {updatedData.username}
                        </h3>
                        <span
                          className={`inline-block mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold text-white rounded-full shadow-sm ${
                            user?.admin ? "bg-indigo-600" : "bg-teal-500"
                          }`}
                        >
                          {user?.admin ? "Quản trị viên" : "Người dùng"}
                        </span>
                      </>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      Quản lý đội nhóm
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                      Leeds, Vương quốc Anh
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode.profile ? (
                    <>
                      <label className="cursor-pointer bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300">
                        Đổi ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {uploading && (
                        <p className="text-amber-500 text-xs sm:text-sm">Đang tải...</p>
                      )}
                      <button
                        onClick={handleUpdate}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Lưu
                        <i className="material-icons text-sm sm:text-base">save</i>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Hủy
                        <i className="material-icons text-sm sm:text-base">cancel</i>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode({ ...editMode, profile: true })}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 text-xs sm:text-sm"
                    >
                      Chỉnh sửa
                      <i className="material-icons text-sm sm:text-base">create</i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8 transform transition-all hover:scale-[1.01] duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  Thông tin cá nhân
                </h3>
                {editMode.personalInfo ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 text-xs sm:text-sm"
                    >
                      Lưu
                      <i className="material-icons text-sm sm:text-base">save</i>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-xs sm:text-sm"
                    >
                      Hủy
                      <i className="material-icons text-sm sm:text-base">cancel</i>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode({ ...editMode, personalInfo: true })}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 text-xs sm:text-sm"
                  >
                    Chỉnh sửa
                    <i className="material-icons text-sm sm:text-base">create</i>
                  </button>
                )}
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tên</p>
                  {editMode.personalInfo ? (
                    <input
                      type="text"
                      value={updatedData.firstName}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          firstName: e.target.value,
                          username: `${e.target.value} ${updatedData.lastName}`.trim(),
                        })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Họ</p>
                  {editMode.personalInfo ? (
                    <input
                      type="text"
                      value={updatedData.lastName}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          lastName: e.target.value,
                          username: `${updatedData.firstName} ${e.target.value}`.trim(),
                        })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.lastName || "Chưa có"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Địa chỉ Email</p>
                  {editMode.personalInfo ? (
                    <input
                      type="email"
                      value={updatedData.email}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, email: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Số điện thoại</p>
                  {editMode.personalInfo ? (
                    <input
                      type="tel"
                      value={updatedData.phone}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, phone: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.phone || "Chưa có"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Ngày sinh</p>
                  {editMode.personalInfo ? (
                    <input
                      type="date"
                      value={updatedData.dob}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, dob: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.dob
                        ? new Date(updatedData.dob).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tiểu sử</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Quản lý đội nhóm
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-md transform transition-all hover:scale-[1.01] duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  Địa chỉ
                </h3>
                {editMode.address ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 text-xs sm:text-sm"
                    >
                      Lưu
                      <i className="material-icons text-sm sm:text-base">save</i>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-xs sm:text-sm"
                    >
                      Hủy
                      <i className="material-icons text-sm sm:text-base">cancel</i>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode({ ...editMode, address: true })}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border rounded-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 text-xs sm:text-sm"
                  >
                    Chỉnh sửa
                    <i className="material-icons text-sm sm:text-base">create</i>
                  </button>
                )}
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Quốc gia</p>
                  {editMode.address ? (
                    <input
                      type="text"
                      value={updatedData.country}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, country: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.country || "Vương quốc Anh"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Thành phố/Khu vực</p>
                  {editMode.address ? (
                    <input
                      type="text"
                      value={updatedData.city}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, city: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.city || "Leeds, Đông Luân Đôn"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Mã bưu điện</p>
                  {editMode.address ? (
                    <input
                      type="text"
                      value={updatedData.postalCode}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, postalCode: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.postalCode || "ERT 2354"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Mã số thuế</p>
                  {editMode.address ? (
                    <input
                      type="text"
                      value={updatedData.taxId}
                      onChange={(e) =>
                        setUpdatedData({ ...updatedData, taxId: e.target.value })
                      }
                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {updatedData.taxId || "AS45645756"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;