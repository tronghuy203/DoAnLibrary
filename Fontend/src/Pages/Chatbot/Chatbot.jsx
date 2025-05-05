import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendChatMessage, fetchChatHistory } from "../../redux/apiChatbot";
import { clearMessages } from "../../redux/chatbotSlice";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaPaperPlane, FaSpinner, FaBook, FaFileAlt, FaTimes, FaComment } from "react-icons/fa";

const Chatbot = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const chatState = useSelector((state) => state.chatbot);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => (user && user.accessToken ? createAxios(user, dispatch, loginSuccess) : null), [
    user?.accessToken,
    dispatch,
  ]);
  const [message, setMessage] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const chatbotRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (!user || !user._id || !user.accessToken) {
      return;
    }

    if (isOpen) {
      dispatch(clearMessages());
      fetchChatHistory(user._id, user.accessToken, dispatch, axiosJWT)
        .then(() => {
          scrollToBottom();
        })
        .catch((err) => console.error("Lỗi khi tải lịch sử:", err));
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [user, navigate, dispatch, axiosJWT, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user?._id || !axiosJWT) return;

    setIsTimeout(false);
    try {
      await sendChatMessage(message, user._id, user.accessToken, dispatch, axiosJWT);
      setMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
      if (err.message.includes("timeout")) {
        setIsTimeout(true);
      }
    };
  };

  const formatRecommendations = (recommendations) => {
    if (!recommendations) return [];
    const books = recommendations.books?.map((book, i) => (
      <li key={`book-${i}`} className="flex items-center gap-2">
        <FaBook className="text-blue-500" />
        <span>
          {book.title || "Không có tiêu đề"} ({book.avgRating?.toFixed(1) || 0}/5)
        </span>
      </li>
    )) || [];

    const documents = recommendations.documents?.map((doc, i) => (
      <li key={`doc-${i}`} className="flex items-center gap-2">
        <FaFileAlt className="text-green-500" />
        <span>
          {doc.title || "Không có tiêu đề"} ({doc.avgRating?.toFixed(1) || 0}/5)
        </span>
      </li>
    )) || [];

    return [...books, ...documents];
  };

  const allMessages = useMemo(() => [
    ...chatState.history
      .slice()
      .reverse()
      .flatMap((item, index) => [
        { content: item.question, sender: "user", key: `history-user-${index}`, createdAt: item.createdAt },
        { content: item.response, sender: "bot", recommendations: item.recommendations, key: `history-bot-${index}`, createdAt: item.createdAt },
      ]),
    ...chatState.messages.map((msg, index) => ({ ...msg, key: `temp-${index}`, createdAt: new Date().toISOString() })),
  ], [chatState.history, chatState.messages]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #e5e7eb; /* gray-200 */
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #14b8a6; /* teal-500 */
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #22d3ee; /* cyan-400 */
          }
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #374151; /* gray-700 */
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #14b8a6; /* teal-500 */
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #22d3ee; /* cyan-400 */
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #14b8a6 #e5e7eb; /* teal-500 gray-200 */
          }
          .dark .custom-scrollbar {
            scrollbar-color: #14b8a6 #374151; /* teal-500 gray-700 */
          }
        `}
      </style>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
        >
          <FaComment className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-end justify-end p-6">
          <div
            ref={chatbotRef}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg w-full max-w-sm h-[34rem] rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 scale-100 origin-bottom-right"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">
                Trò chuyện với Thư viện
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 custom-scrollbar">
              {chatState.isFetchingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <FaSpinner className="animate-spin text-teal-500 w-8 h-8" />
                </div>
              ) : allMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
                </div>
              ) : (
                allMessages.map((msg) => (
                  <div
                    key={msg.key}
                    className={`mb-4 flex animate-slide-up ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{msg.content || "Không có nội dung"}</p>
                      {msg.recommendations && (
                        <ul className="mt-2 text-xs">{formatRecommendations(msg.recommendations)}</ul>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatState.isFetching && (
                <div className="flex justify-start items-center gap-2">
                  <FaSpinner className="animate-spin text-teal-500 w-5 h-5" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Đang chờ phản hồi...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-b-2xl">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all duration-200"
                disabled={!user || !axiosJWT}
              />
              <button
                type="submit"
                disabled={chatState.isFetching || !message.trim() || !user || !axiosJWT}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:shadow-md hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-all duration-200"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </form>

            {chatState.error && (
              <div className="p-2 text-red-500 text-center text-sm">{chatState.error}</div>
            )}
            {isTimeout && (
              <div className="p-2 text-yellow-500 text-center text-sm">
                Yêu cầu mất quá lâu. Vui lòng thử lại.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;