import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import socket from "../socket";
import { loginSuccess } from "../../redux/authSlice";
import { getChatUsers, createChat, getChatHistory } from "../../redux/apiChat";
import { PaperAirplaneIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { getHistorySuccess } from "../../redux/chatSlice";

const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [newMessageUsers, setNewMessageUsers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { users, history, isFetching, error } = useSelector((state) => state.chat);
  const axiosInstance = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.admin) {
      dispatch(getHistorySuccess({ chatId: null, messages: [] }));
      dispatch({
        type: "chat/getUsersFailed",
        payload: "Chỉ admin mới có thể truy cập chức năng này.",
      });
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.accessToken || !user.admin) {
        return;
      }
      await getChatUsers(user.accessToken, dispatch, axiosInstance);
    };
    fetchUsers();
  }, [axiosInstance, user, dispatch]);

  const handleSelectUser = async (userId) => {
    try {
      setSelectedUser(userId);
      const chat = await createChat(userId, user.accessToken, dispatch, axiosInstance);
      setChatId(chat._id);

      await getChatHistory(chat._id, user.accessToken, dispatch, axiosInstance);

      socket.emit("joinChat", { chatId: chat._id, userId: user._id });

      setNewMessageUsers((prev) => prev.filter((id) => id !== userId));
    } catch (err) {
      console.error("Lỗi khi tạo chat:", err);
    }
  };

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      const senderId = newMessage.sender._id;

      if (!newMessageUsers.includes(senderId) && senderId !== user._id) {
        setNewMessageUsers((prev) => [...prev, senderId]);
      }

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
  }, [history, dispatch, chatId, user, newMessageUsers]);

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

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aHasNewMessage = newMessageUsers.includes(a._id);
      const bHasNewMessage = newMessageUsers.includes(b._id);
      if (aHasNewMessage && !bHasNewMessage) return -1;
      if (!aHasNewMessage && bHasNewMessage) return 1;
      return 0;
    });
  }, [users, newMessageUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-8 lg:px-12">
      <div className="w-full max-w-4xl bg-gradient-to-b from-gray-900 to-gray-850 p-8 rounded-2xl shadow-2xl border border-gray-700/50 animate-fade-in flex">
        <div className="w-1/3 border-r border-gray-700 pr-4">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-4">
            Danh sách người dùng
          </h3>
          {isFetching ? (
            <div className="text-white text-center py-4">Đang tải...</div>
          ) : error ? (
            <div className="flex items-center gap-3 bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg">
              <ExclamationCircleIcon className="w-5 h-5" />
              <p>{error}</p>
            </div>
          ) : sortedUsers.length === 0 ? (
            <p className="text-gray-400">Không có người dùng nào.</p>
          ) : (
            <ul className="space-y-2">
              {sortedUsers.map((u) => (
                <li
                  key={u._id}
                  onClick={() => handleSelectUser(u._id)}
                  className={`cursor-pointer p-3 rounded-lg hover:bg-gray-700/50 transition-all flex items-center gap-3 ${
                    selectedUser === u._id ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={u.avatar || "https://via.placeholder.com/40"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {newMessageUsers.includes(u._id) && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-gray-100">{u.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-2/3 pl-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-6">
            Chat với {users.find((u) => u._id === selectedUser)?.username || "người dùng"}
          </h2>
          {chatId ? (
            <>
              <div
                ref={chatContainerRef}
                className="h-96 overflow-y-scroll bg-gray-800/80 p-4 rounded-lg border border-gray-700 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
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
          ) : (
            <p className="text-gray-400 text-center">Chọn một người dùng để bắt đầu chat</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;