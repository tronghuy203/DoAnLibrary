import { Link } from "react-router-dom"; // Import Link để tạo nút "Xem chi tiết"

const RecentlyAddedBooks = ({ books }) => {
  return (
    <div className="p-4 lg:p-6">
      {/* Tiêu đề */}
      <h4 className="text-3xl sm:text-4xl font-bold text-yellow-100 mb-8 animate-fade-in">
        Recently Added Books
      </h4>

      {/* Danh sách sách */}
      {books && books.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <li
              key={book._id}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              <h3 className="font-bold text-lg sm:text-xl text-gray-100 mb-2 truncate">
                {book.title}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-2">
                <span className="font-semibold">Tác giả:</span> {book.author}
              </p>
              <p className="text-gray-300 text-sm sm:text-base mb-3 line-clamp-3">
                {book.description}
              </p>
              <p className="text-red-400 font-bold text-lg sm:text-xl mb-4">
                {book.price.toLocaleString("vi-VN")} ₫
              </p>
              <Link to={`/books/${book._id}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                  Xem chi tiết
                </button>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-center text-lg animate-fade-in">
          Không có sách nào
        </p>
      )}
    </div>
  );
};

export default RecentlyAddedBooks;