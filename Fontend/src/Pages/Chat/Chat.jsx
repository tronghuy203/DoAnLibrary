import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import socket from "../socket";
import { loginSuccess } from "../../redux/authSlice";
import { getAdmin, createChat, getChatHistory } from "../../redux/apiChat";
import { PaperAirplaneIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { getHistorySuccess } from "../../redux/chatSlice";

const UserChat = () => {
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { history, isFetching, error } = useSelector((state) => state.chat);
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchChat = async () => {
      if (!user || !user.accessToken) {
        return;
      }

      try {
        const admin = await getAdmin(user.accessToken, dispatch, axiosJWT);
        if (!admin._id) {
          throw new Error("Không tìm thấy admin");
        }
        const adminId = admin._id;

        const chat = await createChat(adminId, user.accessToken, dispatch, axiosJWT);
        setChatId(chat._id);

        await getChatHistory(chat._id, user.accessToken, dispatch, axiosJWT);

        socket.emit("joinChat", { chatId: chat._id, userId: user._id });
      } catch (err) {
        console.error("Lỗi khi tải chat:", err);
      }
    };

    fetchChat();
  }, [axiosJWT, user, dispatch]);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      if (newMessage.chatId === chatId) {
        dispatch(
          getHistorySuccess({
            chatId,
            messages: [...(history[chatId] || []), newMessage],
          })
        );
        if (newMessage.sender._id !== user._id) {
          socket.emit("markAsRead", { chatId, messageId: newMessage._id });
        }
      }
    });

    socket.on("error", (err) => {
      console.error("Lỗi socket:", err.message);
    });

    return () => {
      socket.off("newMessage");
      socket.off("error");
    };
  }, [history, dispatch, chatId, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, chatId]);

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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-8 lg:px-12">
      <div className="w-full max-w-xl bg-gradient-to-b from-gray-900 to-gray-850 p-8 rounded-2xl shadow-2xl border border-gray-700/50 animate-fade-in">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-8 tracking-wide">
          Chat với Admin
        </h2>

        {isFetching ? (
          <div className="text-white text-center py-10">Đang tải...</div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-600/90 text-white px-6 py-4 rounded-lg shadow-lg mb-6 animate-fade-in-fast">
            <ExclamationCircleIcon className="w-5 h-5" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div
              ref={chatContainerRef}
              className="h-80 overflow-y-scroll bg-gray-800/80 p-4 rounded-lg border border-gray-700 mb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {(history[chatId] || []).map((msg) => (
                <div
                  key={msg._id}
                  className={`flex mb-4 ${
                    msg.sender._id === user._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[70%] ${
                      msg.sender._id === user._id ? "flex-row-reverse" : ""
                    }`}
                  >
                    <img
                      src={msg.sender.avatar || "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender._id === user._id
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <span>{formatTime(msg.createdAt)}</span>
                        {msg.sender._id === user._id}
                      </div>
                    </div>
                  </div>
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