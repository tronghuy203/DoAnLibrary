import { useEffect } from "react";
import { getAllUsers, deleteUser } from "../../redux/apiRequest";
import "./Profile.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const Profile = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

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

  return (
    <main className="profile-container">
      <div className="profile-title">Thông tin cá nhân</div>
      <div className="profile-role">
        {`Vai trò: ${user?.admin ? "Admin" : "User"}`}
      </div>
      <div className="profile-info">
        <p><strong>Tên đăng nhập:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <div className="delete-user" onClick={() => handleDelete(user._id)}>
        Xóa tài khoản
      </div>
    </main>
  );
};

export default Profile;
