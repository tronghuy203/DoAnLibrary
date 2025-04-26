import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import socket from "../socket";
import { loginSuccess } from "../../redux/authSlice";
import { getAdmin, createChat, getChatHistory } from "../../redux/apiChat";
import {
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import { getHistorySuccess } from "../../redux/chatSlice";
import EmojiPicker from "emoji-picker-react";

const UserChat = () => {
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { history, isFetching, error } = useSelector((state) => state.chat);
  const axiosJWT = useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user, dispatch]
  );

  const messagesPerPage = 10;
  const TIME_GAP_THRESHOLD = 15 * 1000;

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchChat = async () => {
      if (!user || !user.accessToken) return;

      try {
        const admin = await getAdmin(user.accessToken, dispatch, axiosJWT);
        if (!admin._id) throw new Error("Không tìm thấy admin");
        const adminId = admin._id;

        const chat = await createChat(
          adminId,
          user.accessToken,
          dispatch,
          axiosJWT
        );
        setChatId(chat._id);

        await getChatHistory(
          chat._id,
          user.accessToken,
          dispatch,
          axiosJWT,
          1,
          messagesPerPage
        );
        socket.emit("joinChat", { chatId: chat._id, userId: user._id });
        scrollToBottom();
      } catch (err) {
        console.error("Lỗi khi tải chat:", err);
      }
    };

    fetchChat();
  }, [axiosJWT, user, dispatch, scrollToBottom]);

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
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="mt-16 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-[80vh] sm:h-[85vh] animate-in fade-in duration-300">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 tracking-tight">
            Chat với tư vấn viên
          </h2>
        </div>

        {isFetching && !history[chatId]?.length ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 animate-pulse">
            Đang tải...
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-500/80 dark:bg-red-600/80 text-white px-6 py-4 mx-4 my-4 rounded-lg shadow-lg animate-in zoom-in">
            <ExclamationCircleIcon className="w-5 h-5" />
            <p>{error}</p>
          </div>
        ) : chatId ? (
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6 scrollbar scrollbar-w-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-blue-500 scrollbar-track-gray-800 [scrollbar-color:#808080_#1f2937] lg:scrollbar-w-3 lg:scrollbar-thumb-blue-600 lg:scrollbar-track-gray-800 lg:scrollbar-thumb-hover:blue-700"
            >
              {(history[chatId] || []).map((msg, index) => {
                const prevMsg =
                  index > 0 ? (history[chatId] || [])[index - 1] : null;
                const showTimestamp = shouldShowTimestamp(msg, prevMsg);

                return (
                  <React.Fragment key={msg._id}>
                    {showTimestamp && (
                      <div className="flex justify-center my-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 px-4 py-1.5 rounded-full shadow-sm transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${
                        msg.sender._id === user._id
                          ? "justify-end"
                          : "justify-start"
                      } mb-3 animate-in slide-in-from-bottom-10 fade-in duration-300 hover:scale-[1.02] transition-transform`}
                    >
                      <div
                        className={`flex items-end gap-3 max-w-[70%] sm:max-w-[60%] ${
                          msg.sender._id === user._id ? "flex-row-reverse" : ""
                        }`}
                      >
                        <img
                          src={
                            msg.sender.avatar ||
                            "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                          }
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover shadow-md transition-transform duration-200 hover:scale-110"
                        />
                        <div
                          className={`p-2 rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg ${
                            msg.sender._id === user._id
                              ? "bg-blue-500 dark:bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="relative flex items-center space-x-2">
                <button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-full transition-all duration-200 hover:shadow-md"
                >
                  <FaceSmileIcon className="w-6 h-6" />
                </button>
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-16 left-0 z-10 animate-in fade-in slide-in-from-bottom-10 duration-200"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={
                        document.documentElement.classList.contains("dark")
                          ? "dark"
                          : "light"
                      }
                      height={350}
                      width={300}
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
                  className="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base shadow-sm transition-all duration-200 hover:shadow-md resize-none min-h-[44px] scrollbar-none"
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white p-3 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105"
                >
                  <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Đang tải cuộc trò chuyện...
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;
