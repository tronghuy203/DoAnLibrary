import { UserGroupIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline"; 

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 lg:p-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400 mb-4 mt-5">
          Admin Dashboard
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl mb-8">
          Chào mừng bạn đến với trang quản trị.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-4">
            <UserGroupIcon className="w-10 h-10 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                Tổng số người dùng
              </h3>
              <p className="text-3xl font-bold text-blue-400">150</p>
              <p className="text-gray-400 text-sm mt-1">
                Tăng <span className="text-green-400">10%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-4">
            <BookOpenIcon className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                Tổng số sách
              </h3>
              <p className="text-3xl font-bold text-green-400">320</p>
              <p className="text-gray-400 text-sm mt-1">
                Tăng <span className="text-green-400">5%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-4">
            <ClockIcon className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                Hoạt động gần đây
              </h3>
              <p className="text-3xl font-bold text-yellow-400">45</p>
              <p className="text-gray-400 text-sm mt-1">
                Hành động trong 24 giờ qua
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-6">
          Thống kê chi tiết
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-300 mb-4">
              Người dùng hoạt động (7 ngày qua)
            </h4>
            <div className="flex items-end gap-2 h-48">
              <div className="flex-1 bg-blue-500 rounded-t h-24 hover:h-28 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-32 hover:h-36 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-20 hover:h-24 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-28 hover:h-32 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-36 hover:h-40 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-16 hover:h-20 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-24 hover:h-28 transition-all duration-200"></div>
            </div>
            <div className="flex justify-between text-gray-400 text-sm mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Sách được mượn nhiều nhất
              </h4>
              <p className="text-gray-200">
                <span className="font-bold text-green-400">"Dune"</span> - 25 lượt mượn
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Người dùng tích cực nhất
              </h4>
              <p className="text-gray-200">
                <span className="font-bold text-blue-400">JohnDoe</span> - 15 hoạt động
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;