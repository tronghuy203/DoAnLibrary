import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../redux/apiRequest";
import { createAxios } from "../../createInstance";
import { logoutSuccess } from "../../redux/authSlice";
import { Link } from "react-router-dom";
import DarkMode from "./DarkMode";
import {UserIcon, ShoppingCartIcon, BookOpenIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, DocumentTextIcon} from "@heroicons/react/24/outline";

const Navbar = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = user?.accessToken;
  const id = user?._id;
  const axiosJWT = createAxios(user, dispatch, logoutSuccess);

  const topMenuRef = useRef();
  const toggleIconRef = useRef();
  const dropdownRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        topMenuRef.current &&
        !topMenuRef.current.contains(e.target) &&
        toggleIconRef.current &&
        !toggleIconRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleToggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleLogout = () => {
    logOut(dispatch, id, navigate, accessToken, axiosJWT);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 backdrop-blur-md shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-x-2 ">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                className="h-10 w-10 object-contain" 
                src="https://static.vecteezy.com/system/resources/previews/024/043/963/original/book-icon-clipart-transparent-background-free-png.png" 
                alt="BookLibrary"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Books Library</span>
            </Link>
            <div className="lg:hidden">
              <DarkMode />
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <NavItem to="/" icon={<BookOpenIcon className="w-5 h-5" />} text="Trang chủ" />
            
            <div className="flex items-center space-x-4 ml-4">
              {user ? (
                <>
                  <NavItem to="/all-books" icon={<BookOpenIcon className="w-5 h-5" />} text="Sách" />
                  <NavItem to="/document-list" icon={<DocumentTextIcon className="w-5 h-5" />} text="Tài liệu" />
                  <NavItem to="/cart" icon={<ShoppingCartIcon className="w-5 h-5" />} text="Giỏ hàng" />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={handleToggleDropdown}
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      {user?.avatar ? 
                        <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" /> : 
                        <img src="/default-avatar.png" alt="Default Avatar" className="w-8 h-8 rounded-full object-cover" />
                      }
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-lg py-2 animate-in fade-in-0">
                        <div className="px-4 py-2 border-b dark:border-zinc-800">
                          <div className="flex items-center space-x-2">
                            {user?.avatar ? 
                              <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" /> : 
                              <img src="/default-avatar.png" alt="Default Avatar" className="w-10 h-10 rounded-full object-cover" />
                            }
                            <span className="text-sm text-gray-800 dark:text-gray-200">{user.username}</span>
                          </div>
                        </div>
                        <NavLink
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserIcon className="w-5 h-5" />
                          <span>Hồ sơ</span>
                        </NavLink>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <NavItem to="/login" icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />} text="Login" />
                  <NavItem to="/register" icon={<UserIcon className="w-5 h-5" />} text="Register" />
                </>
              )}
            </div>
            <DarkMode />
          </div>

          <button
            ref={toggleIconRef}
            onClick={handleToggleMenu}
            className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div 
            ref={topMenuRef}
            className="lg:hidden absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-full bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 shadow-lg animate-in slide-in-from-top-2 flex flex-col items-center"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 text-center">
              <MobileNavItem to="/" icon={<BookOpenIcon className="w-5 h-5" />} text="Home" />
              <MobileNavItem to="/all-books" icon={<BookOpenIcon className="w-5 h-5" />} text="Books" />
              <MobileNavItem to="/document-list" icon={<DocumentTextIcon className="w-5 h-5" />} text="Tài liệu" />
              <MobileNavItem to="/cart" icon={<ShoppingCartIcon className="w-5 h-5" />} text="Cart" />
              
              {user ? (
                <>
                  <MobileNavItem to="/profile" icon={<UserIcon className="w-5 h-5" />} text="Profile" />
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-center">
                    {user?.avatar ? 
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover mr-2" /> : 
                      <img src="/default-avatar.png" alt="Default Avatar" className="w-8 h-8 rounded-full object-cover mr-2" />
                    }
                    {user.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <MobileNavItem to="/login" icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />} text="Login" />
                  <MobileNavItem to="/register" icon={<UserIcon className="w-5 h-5" />} text="Register" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
      }`
    }
  >
    {icon}
    <span>{text}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-2 px-4 py-2 text-sm rounded-lg w-full ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
      }`
    }
  >
    {icon}
    <span>{text}</span>
  </NavLink>
);

export default Navbar;