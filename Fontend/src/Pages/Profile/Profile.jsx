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

  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
    avatar: user?.avatar || "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
  });

  const [uploading, setUploading] = useState(false);

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
      await updateUserProfile(user._id, updatedData, user.accessToken, axiosJWT, dispatch);
      setEditMode(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật", err);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setUpdatedData({ ...updatedData, avatar: data.secure_url });
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 pt-20 pb-20">
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hồ sơ</h1>
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs font-semibold text-white rounded-full shadow-sm ${
              user?.admin ? "bg-indigo-600" : "bg-teal-500"
            }`}
          >
            {user?.admin ? "Admin" : "User"}
          </span>
        </div>

        {!editMode ? (
          <div className="flex flex-col items-center gap-6">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="w-full space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Tên:</span>
                <span className="text-gray-900 font-semibold">{user.username}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-900 font-semibold">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Điện thoại:</span>
                <span className="text-gray-900 font-semibold">{user.phone || "Chưa có"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Ngày sinh:</span>
                <span className="text-gray-900 font-semibold">
                  {user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa có"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="w-full max-w-xs bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium"
            >
              Chỉnh sửa
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <img
                src={updatedData.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto"
              />
              <label className="mt-3 inline-block">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <span className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm hover:bg-gray-200 transition-colors font-medium">
                  Đổi ảnh
                </span>
              </label>
              {uploading && <p className="text-amber-500 text-sm mt-2 font-medium">Đang tải...</p>}
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={updatedData.username}
                onChange={(e) => setUpdatedData({ ...updatedData, username: e.target.value })}
                placeholder="Tên đăng nhập"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900 placeholder-gray-400"
              />
              <input
                type="email"
                value={updatedData.email}
                onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900 placeholder-gray-400"
              />
              <input
                type="tel"
                value={updatedData.phone}
                onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
                placeholder="Số điện thoại"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900 placeholder-gray-400"
              />
              <input
                type="date"
                value={updatedData.dob}
                onChange={(e) => setUpdatedData({ ...updatedData, dob: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleUpdate}
                className="bg-teal-500 text-white px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-all duration-300 font-medium"
              >
                Lưu
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => handleDelete(user._id)}
            className="w-full max-w-xs bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-all duration-300 font-medium"
          >
            Xóa tài khoản
          </button>
        </div>
      </div>
    </main>
  );
};

export default Profile;