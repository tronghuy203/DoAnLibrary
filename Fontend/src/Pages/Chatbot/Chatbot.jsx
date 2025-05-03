import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendChatMessage, fetchChatHistory } from "../../redux/apiChatbot";
import { clearMessages } from "../../redux/chatbotSlice";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaPaperPlane, FaSpinner, FaBook, FaFileAlt } from "react-icons/fa";

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
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

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
      navigate("/login");
      return;
    }

    dispatch(clearMessages());
    fetchChatHistory(user._id, user.accessToken, dispatch, axiosJWT)
      .then(() => {
        scrollToBottom();
      })
      .catch((err) => console.error("Lỗi khi tải lịch sử:", err));

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [user, navigate, dispatch, axiosJWT]);

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
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-zinc-800 flex justify-center items-center py-12 transition-colors duration-500">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Trò chuyện với Thư viện thông minh
          </h2>

          {chatState.error && (
            <div className="mb-4 text-red-500 text-center">{chatState.error}</div>
          )}
          {isTimeout && (
            <div className="mb-4 text-yellow-500 text-center">
              Yêu cầu mất quá lâu. Vui lòng thử lại sau hoặc kiểm tra kết nối.
            </div>
          )}

          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {chatState.isFetchingHistory ? (
              <div className="flex justify-center">
                <FaSpinner className="animate-spin text-teal-500 w-6 h-6" />
              </div>
            ) : allMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
              </div>
            ) : (
              allMessages.map((msg) => (
                <div
                  key={msg.key}
                  className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p>{msg.content || "Không có nội dung"}</p>
                    {msg.recommendations && (
                      <ul className="mt-2 text-sm">{formatRecommendations(msg.recommendations)}</ul>
                    )}
                  </div>
                </div>
              ))
            )}
            {chatState.isFetching && (
              <div className="flex justify-center">
                <FaSpinner className="animate-spin text-teal-500 w-6 h-6" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">Đang chờ phản hồi từ AI...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập câu hỏi về sách hoặc tài liệu..."
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!user || !axiosJWT}
            />
            <button
              type="submit"
              disabled={chatState.isFetching || !message.trim() || !user || !axiosJWT}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaPaperPlane />
              Gửi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;