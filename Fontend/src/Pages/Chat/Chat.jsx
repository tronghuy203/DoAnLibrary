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

const UserChat = () => {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      if (!user || !user.accessToken) {
        setError("Vui lòng đăng nhập để sử dụng trò chuyện.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Lấy ID của admin
        const adminResponse = await axiosJWT.get("/v1/user/admin");
        if (!adminResponse.data._id) {
          throw new Error("Không tìm thấy admin");
        }
        const adminId = adminResponse.data._id;

        // Tạo hoặc lấy chat
        const res = await axiosJWT.post("/v1/chat/create", { userId: adminId });
        setChatId(res.data._id);

        // Lấy lịch sử trò chuyện
        const history = await axiosJWT.get(`/v1/chat/history/${res.data._id}`);
        setMessages(history.data);

        // Tham gia phòng chat
        socket.emit("joinChat", { chatId: res.data._id, userId: user._id });
      } catch (err) {
        console.error("Lỗi khi tải chat:", err.response?.data || err);
        setError(err.response?.data?.message || "Không thể tải cuộc trò chuyện.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [axiosJWT, user]);

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
      <div className="w-full max-w-xl bg-gradient-to-b from-gray-900 to-gray-850 p-8 rounded-2xl shadow-2xl border border-gray-700/50 animate-fade-in">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-8 tracking-wide">
          Chat với Admin
        </h2>

        {loading ? (
          <div className="text-white text-center py-10">Đang tải...</div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-600/90 text-white px-6 py-4 rounded-lg shadow-lg mb-6 animate-fade-in-fast">
            <ExclamationCircleIcon className="w-5 h-5" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="h-80 overflow-y-scroll bg-gray-800/80 p-4 rounded-lg border border-gray-700 mb-6">
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
        )}
      </div>
    </div>
  );
};

export default UserChat;