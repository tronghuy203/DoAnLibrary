import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import socket from "../socket";
import { loginSuccess } from "../../redux/authSlice";
import {
  PaperAirplaneIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser); // Match UserChat's selector
  const axiosInstance = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // Redirect to login if user is not authenticated or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.admin) {
      setError("Chỉ admin mới có thể truy cập chức năng này.");
      setLoading(false);
    }
  }, [user, navigate]);

  // Lấy danh sách user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.accessToken || !user.admin) {
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get("/v1/chat/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách user:", err.response?.data || err);
        setError(err.response?.data?.message || "Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [axiosInstance, user]);

  // Tạo hoặc lấy chat khi chọn user
  const handleSelectUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.post("/v1/chat/create", { userId });
      setChatId(res.data._id);
      setSelectedUser(userId);

      // Lấy lịch sử trò chuyện
      const history = await axiosInstance.get(`/v1/chat/history/${res.data._id}`);
      setMessages(history.data);

      // Tham gia phòng chat
      socket.emit("joinChat", { chatId: res.data._id, userId: user._id });
    } catch (err) {
      console.error("Lỗi khi tạo chat:", err.response?.data || err);
      setError(err.response?.data?.message || "Không thể tải cuộc trò chuyện.");
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("error", (err) => {
      console.error("Lỗi socket:", err.message);
    });

    return () => {
      socket.off("newMessage");
      socket.off("error");
    };
  }, []);

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (message.trim() && chatId && user?._id) {
      socket.emit("sendMessage", {
        chatId,
        userId: user._id,
        content: message,
      });
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-8 lg:px-12">
      <div className="w-full max-w-4xl bg-gradient-to-b from-gray-900 to-gray-850 p-8 rounded-2xl shadow-2xl border border-gray-700/50 animate-fade-in flex">
        {/* Danh sách user */}
        <div className="w-1/3 border-r border-gray-700 pr-4">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-4">
            Danh sách người dùng
          </h3>
          {loading ? (
            <div className="text-white text-center py-4">Đang tải...</div>
          ) : error ? (
            <div className="flex items-center gap-3 bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg">
              <ExclamationCircleIcon className="w-5 h-5" />
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-400">Không có người dùng nào.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u._id}
                  onClick={() => handleSelectUser(u._id)}
                  className={`cursor-pointer p-3 rounded-lg hover:bg-gray-700/50 transition-all ${
                    selectedUser === u._id ? "bg-gray-700" : ""
                  }`}
                >
                  <span className="text-gray-100">{u.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Khu vực chat */}
        <div className="w-2/3 pl-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-6">
            Chat với {users.find((u) => u._id === selectedUser)?.username || "người dùng"}
          </h2>
          {chatId ? (
            <>
              <div className="h-96 overflow-y-scroll bg-gray-800/80 p-4 rounded-lg border border-gray-700 mb-4">
                {messages.map((msg) => (
                  <div key={msg._id} className="mb-2">
                    <span className="font-semibold text-cyan-400">{msg.sender.username}:</span>{" "}
                    <span className="text-gray-100">{msg.content}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-800/90 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                  Gửi
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center">Chọn một người dùng để bắt đầu chat</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;