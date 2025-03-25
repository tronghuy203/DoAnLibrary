import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUserProfile } from "../../redux/apiRequest";
import "./Profile.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const CLOUDINARY_UPLOAD_PRESET = "profileimage"; // Thay bằng upload preset của bạn
const CLOUDINARY_CLOUD_NAME = "dy889jy4s"; // Thay bằng cloud name của bạn

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
    <main className="profile-container">
      <div className="profile-title">Thông tin cá nhân</div>
      <div className="profile-role">{`Vai trò: ${user?.admin ? "Admin" : "User"}`}</div>

      {!editMode ? (
        <div className="profile-info">
          <img src={user.avatar} alt="Avatar" className="profile-avatar" />
          <p><strong>Tên đăng nhập:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone || "Còn trống"}</p>
          <p><strong>Ngày sinh:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : "Còn trống"}</p>
          <button className="update-button" onClick={() => setEditMode(true)}>Cập nhật thông tin</button>
        </div>
      ) : (
        <div className="profile-edit-form">
          <input
            type="text"
            value={updatedData.username}
            onChange={(e) => setUpdatedData({ ...updatedData, username: e.target.value })}
            placeholder="Nhập tên đăng nhập mới"
          />
          <input
            type="email"
            value={updatedData.email}
            onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
            placeholder="Nhập email mới"
          />
          <input
            type="tel"
            value={updatedData.phone}
            onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
            placeholder="Nhập số điện thoại mới"
          />
          <input
            type="date"
            value={updatedData.dob}
            onChange={(e) => setUpdatedData({ ...updatedData, dob: e.target.value })}
          />
          <label>
            <strong>Ảnh đại diện:</strong>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
          {uploading && <p>Đang tải ảnh lên...</p>}
          {updatedData.avatar && <img src={updatedData.avatar} alt="Avatar mới" className="profile-avatar" />}
          
          <button className="save-button" onClick={handleUpdate}>Lưu thay đổi</button>
          <button className="cancel-button" onClick={() => setEditMode(false)}>Hủy</button>
        </div>
      )}

      <div className="delete-user" onClick={() => handleDelete(user._id)}>Xóa tài khoản</div>
    </main>
  );
};

export default Profile;
