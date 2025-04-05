import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReviews, updateReview, deleteReview } from "../../redux/apiReview";
import { createAxios } from "../../createInstance";

const DocumentReviews = () => {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews.reviews);
  const loading = useSelector((state) => state.reviews.loading);
  const error = useSelector((state) => state.reviews.error);
  const user = useSelector((state) => state.auth.login.currentUser);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const axiosJWT = createAxios(user, dispatch);

  useEffect(() => {
    getReviews("document", "all", dispatch);
  }, [dispatch]);

  const handleEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để sửa đánh giá!");
      return;
    }

    const updatedData = {
      rating: editRating,
      comment: editComment,
      userId: user._id,
      isAdmin: user?.admin || false,
    };

    try {
      await updateReview(editingReviewId, updatedData, user.accessToken, dispatch, axiosJWT);
      setEditingReviewId(null);
      getReviews("document", "all", dispatch);
    } catch (err) {
      console.error("Lỗi khi sửa đánh giá:", err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!user) {
      alert("Bạn cần đăng nhập để xóa đánh giá!");
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      try {
        await deleteReview(reviewId, { userId: user._id, isAdmin: user?.admin || false }, user.accessToken, dispatch, axiosJWT);
        getReviews("document", "all", dispatch);
      } catch (err) {
        console.error("Lỗi khi xóa đánh giá:", err);
      }
    }
  };

  if (loading) {
    return <div className="text-center text-gray-100">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Quản lý đánh giá tài liệu</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        {reviews?.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nội dung</th>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4">{review._id}</td>
                  <td className="py-3 px-4">
                    {editingReviewId === review._id ? (
                      <form onSubmit={handleUpdateReview} className="flex flex-col gap-2">
                        <select
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                          className="border p-1 rounded text-black"
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num} sao
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="border p-1 rounded w-full text-black"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                        <div>
                        <p className="font-semibold text-yellow-400">{review.rating} ⭐</p>
                        <p>{review.comment}</p>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">{review.userId?.username || "N/A"}</td>
                  <td className="py-3 px-4">
                    {editingReviewId !== review._id && (
                      <>
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-blue-400 hover:underline mr-2"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-400 hover:underline"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">Chưa có đánh giá nào.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentReviews;
