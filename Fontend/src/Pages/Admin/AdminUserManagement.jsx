import React, { useState, useEffect, useMemo } from "react";
import { getAllUsers, deleteUser, updateUser } from "../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const AdminUserManagement = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const userList = useSelector((state) => state.users.users?.allUsers);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [formData, setFormData] = useState({ username: "", email: "", admin: false });
  const [editUserId, setEditUserId] = useState(null);

  useEffect(() => {
    if (user?.accessToken) {
      getAllUsers(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

  const handleDelete = (id) => {
    if (user?.admin) {
      dispatch(deleteUser(id, user.accessToken, null, axiosJWT));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editUserId) {
        await updateUser(editUserId, formData, user.accessToken, dispatch, axiosJWT);
        
        // ✅ Gọi lại API lấy danh sách mới sau khi cập nhật
        getAllUsers(user?.accessToken, dispatch, axiosJWT); 
        
        setFormData({ username: "", email: "", admin: false });
        setEditUserId(null);
    }
};


  const handleEdit = (user) => {
    setFormData({ username: user.username, email: user.email, admin: user.admin });
    setEditUserId(user._id);
  };

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      {/* Form cập nhật người dùng */}
      {editUserId && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tên người dùng"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={formData.admin}
              onChange={(e) => setFormData({ ...formData, admin: e.target.checked })}
            />
            Admin
          </label>
          <button type="submit">Cập nhật</button>
        </form>
      )}
      {/* Danh sách người dùng */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {userList?.length > 0 ? (
            userList.map((u) => (
              <tr key={u._id}>
                <td>{u._id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.admin ? "Admin" : "User"}</td>
                <td>
                  {!u.admin && <button onClick={() => handleDelete(u._id)}>Xóa</button>}
                  <button onClick={() => handleEdit(u)}>Chỉnh sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Không có người dùng nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;
