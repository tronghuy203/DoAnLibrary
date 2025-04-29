import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import socket from "../socket";
import { loginSuccess } from "../../redux/authSlice";
import { getChatUsers, createChat, getChatHistory } from "../../redux/apiChat";
import {
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  FaceSmileIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { getHistorySuccess } from "../../redux/chatSlice";
import EmojiPicker from "emoji-picker-react";

const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [newMessageUsers, setNewMessageUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { users, history, isFetching, error } = useSelector((state) => state.chat);
  const axiosInstance = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const messagesPerPage = 10;
  const TIME_GAP_THRESHOLD = 15 * 1000;

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      };
      textarea.addEventListener("input", adjustHeight);
      adjustHeight();
      return () => textarea.removeEventListener("input", adjustHeight);
    }
  }, []);

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

      await getChatHistory(chat._id, user.accessToken, dispatch, axiosInstance, 1, messagesPerPage);

      socket.emit("joinChat", { chatId: chat._id, userId: user._id });

      setNewMessageUsers((prev) => prev.filter((id) => id !== userId));
      scrollToBottom();
    } catch (err) {
      console.error("Lỗi khi tạo chat:", err);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setChatId(null);
    setMessage("");
    setShowEmojiPicker(false);
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
    scrollToBottom();
  }, [history, chatId, scrollToBottom]);

  const handleSendMessage = () => {
    if (message.trim() && chatId && user?._id) {
      socket.emit("sendMessage", {
        chatId,
        userId: user._id,
        content: message,
      });
      setMessage("");
      setShowEmojiPicker(false);
      setTimeout(scrollToBottom, 0);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shouldShowTimestamp = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentTime = new Date(currentMsg.createdAt).getTime();
    const prevTime = new Date(prevMsg.createdAt).getTime();
    return currentTime - prevTime > TIME_GAP_THRESHOLD;
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-3 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[50%] left-[70%] w-64 h-64 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-[10%] right-[20%] w-56 h-56 bg-cyan-300/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0">
          <div className="absolute w-3 h-3 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[15%] left-[10%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[45%] left-[75%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-purple-500/50 dark:bg-purple-400/40 rounded-full top-[65%] left-[25%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[5%] left-[55%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[30%] left-[85%] animate-particle"></div>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full h-32 sm:h-48 text-cyan-300/30 dark:text-cyan-700/30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-slide-up">
        <div className="text-center mb-6 sm:mb-10">
          <PaperAirplaneIcon className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-2 sm:mb-3 animate-pulse" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Chat Admin
          </h2>
          <p className="mt-1 sm:mt-2 text-base sm:text-xl text-gray-600 dark:text-gray-300">
            Kết nối và hỗ trợ người dùng nhanh chóng
          </p>
        </div>

        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 flex h-[80vh] sm:h-[70vh] animate-in fade-in duration-300">
          <div
            className={`w-full p-3 sm:p-6 bg-gray-50 dark:bg-gray-800/50 sm:w-1/3 sm:border-r border-gray-200 dark:border-gray-700 ${
              selectedUser ? "hidden sm:block" : "block"
            }`}
          >
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              Danh sách người dùng
            </h3>
            {isFetching ? (
              <div className="flex items-center gap-2 bg-teal-500/90 dark:bg-teal-400/90 text-white px-4 py-2 sm:px-4 sm:py-3 rounded-xl shadow-xl transition-all duration-300 animate-pulse max-w-xs mx-auto sm:text-center">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                <p className="text-sm sm:text-base">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 bg-red-500/80 dark:bg-red-600/80 text-white px-4 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg animate-in zoom-in max-w-xs mx-auto">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                <p className="text-sm sm:text-base">{error}</p>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="flex items-center gap-2 bg-teal-500/90 dark:bg-teal-400/90 text-white px-4 py-2 sm:px-4 sm:py-3 rounded-xl shadow-xl transition-all duration-300 animate-pulse max-w-xs mx-auto">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                <p className="text-sm sm:text-base">Không có người dùng nào</p>
              </div>
            ) : (
              <ul className="space-y-3 sm:space-y-2">
                {sortedUsers.map((u) => (
                  <li
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    className={`cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all flex items-center gap-2 sm:gap-3 ${
                      selectedUser === u._id ? "bg-gray-200 dark:bg-gray-700" : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={
                          u.avatar ||
                          "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                        }
                        alt="avatar"
                        className="w-8 sm:w-8 h-8 sm:h-8 rounded-full object-cover shadow-md transition-transform duration-200 hover:scale-110"
                      />
                      {newMessageUsers.includes(u._id) && (
                        <span className="absolute top-0 right-0 w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {u.username}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Khu vực chat */}
          <div
            className={`w-full flex flex-col sm:w-2/3 ${selectedUser ? "block" : "hidden sm:block"}`}
          >
            <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center gap-2">
              {selectedUser && (
                <button
                  onClick={handleBackToUsers}
                  className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg sm:text-3xl font-bold text-center sm:text-center text-gray-900 dark:text-gray-100 tracking-tight flex-1">
                Chat với {users.find((u) => u._id === selectedUser)?.username || "người dùng"}
              </h2>
            </div>

            {chatId ? (
              <>
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-4 sm:space-y-6 scrollbar scrollbar-w-1 sm:scrollbar-w-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-cyan-400 sm:scrollbar-thumb-blue-500 scrollbar-track-gray-800 [scrollbar-color:#22d3ee_#1f2937] sm:[scrollbar-color:#3b82f6_#1f2937] lg:scrollbar-w-3 lg:scrollbar-thumb-blue-600 lg:scrollbar-track-gray-800 lg:scrollbar-thumb-hover:blue-700"
                >
                  {(history[chatId] || []).map((msg, index) => {
                    const prevMsg = index > 0 ? (history[chatId] || [])[index - 1] : null;
                    const showTimestamp = shouldShowTimestamp(msg, prevMsg);

                    return (
                      <React.Fragment key={msg._id}>
                        {showTimestamp && (
                          <div className="flex justify-center my-2 sm:my-3">
                            <span className="text-xs sm:text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex ${
                            msg.sender._id === user._id ? "justify-end" : "justify-start"
                          } mb-2 sm:mb-3 animate-in slide-in-from-bottom-10 fade-in duration-300 hover:scale-[1.02] sm:hover:scale-[1.02] transition-transform`}
                        >
                          <div
                            className={`flex items-end gap-2 sm:gap-3 max-w-[80%] sm:max-w-[60%] ${
                              msg.sender._id === user._id ? "flex-row-reverse" : ""
                            }`}
                          >
                            <img
                              src={
                                msg.sender.avatar ||
                                "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                              }
                              alt="avatar"
                              className="w-6 sm:w-9 h-6 sm:h-9 rounded-full object-cover shadow-md transition-transform duration-200 hover:scale-110"
                            />
                            <div
                              className={`p-2 sm:p-2 rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg ${
                                msg.sender._id === user._id
                                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              <p className="text-xs sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="relative flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className="p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-full transition-all duration-200 hover:shadow-md"
                    >
                      <FaceSmileIcon className="w-5 sm:w-6 h-5 sm:h-6" />
                    </button>
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-12 sm:bottom-16 left-0 z-10 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-200"
                      >
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
                          height={300}
                          width={250}
                          className="sm:height-350 sm:width-300"
                        />
                      </div>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 px-3 sm:px-5 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-xs sm:text-base shadow-sm transition-all duration-200 hover:shadow-md resize-none min-h-[36px] sm:min-h-[44px]"
                      placeholder="Nhập tin nhắn..."
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-xl hover:scale-102 sm:hover:scale-105 w-8 sm:w-12 h-8 sm:h-12"
                    >
                      <PaperAirplaneIcon className="w-4 sm:w-5 h-4 sm:h-5 rotate-45" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-teal-500/90 dark:bg-teal-400/90 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-xl transition-all duration-300 animate-pulse max-w-xs">
                  <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                  <p className="text-sm sm:text-base">Chọn một người dùng để bắt đầu chat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;