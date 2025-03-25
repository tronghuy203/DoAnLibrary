import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../redux/apiRequest";
import { createAxios } from "../../createInstance";
import { logoutSuccess } from "../../redux/authSlice";

const Navbar = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = user?.accessToken;
  const id = user?._id;
  let axiosJWT = createAxios(user, dispatch, logoutSuccess);

  const topMenuRef = useRef();
  const toggleIconRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClickOutside = (e) => {
    if (topMenuRef.current &&!topMenuRef.current.contains(e.target) && toggleIconRef.current && !toggleIconRef.current.contains(e.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
 
  const activeNavbar = "w-5 bg-[#003A57] text-white rounded-md mx-auto min-h-max";


  const handleLogout = () => {
    logOut(dispatch, id, navigate, accessToken, axiosJWT);
  };

  return (
    <div className="content-wrapper max-w-full text-base mx-auto px-8 bg-slate-200">
      <div className="py-6 mx-10">
        <nav className="flex flex-row justify-between items-center relative">
          <div >
            <h1 className="basis-2/6 lg:ml-12 text-xl font-semibold cursor-pointer ">Library</h1>
          </div>
          {/* thanh tìm kiếm */}
          {/* {user && (
          <div className="relative flex ml-auto mt-1 mr-6">
            <input className="basis-1/6 rounded-2xl pl-7 h-8 w-28 lg:w-52" type="search" placeholder="Tìm kiếm"/>
            <svg xmlns="http://www.w3.org/2000/svg"  className="size-6 absolute top-1 left-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          )} */} 

          <div>
            <div id="top-menu" ref={topMenuRef} className={`basis-3/6 lg:flex lg:items-center lg:justify-end lg:gap-x-8 ${ isMenuOpen ? "topmenu-expanded" : "hidden lg:flex"}`}>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `min-w-[70px] text-center py-2 ${
                    isActive ? activeNavbar : ""
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `min-w-[70px] text-center py-2 ${
                    isActive ? activeNavbar : ""
                  }`
                }
              >
                Profile
              </NavLink>
              {user ? (
                <>
                  <p className="font-bold min-w-[100px] text-center">
                    Hi, <span>{user.username}</span>
                  </p>
                  <NavLink
                    to="/logout"
                    className="min-w-[70px] text-center py-2"
                    onClick={handleLogout}
                  >
                    Log out
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `min-w-[70px] text-center items-center py-2 ${
                        isActive ? activeNavbar : ""
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `min-w-[70px] text-center py-2 ${
                        isActive ? activeNavbar : ""
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>

            <div className="basis-3/6 lg:hidden cursor-pointer">
              <svg
                id="toggle-top-menu-icon"
                ref={toggleIconRef}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                onClick={handleToggleMenu}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
