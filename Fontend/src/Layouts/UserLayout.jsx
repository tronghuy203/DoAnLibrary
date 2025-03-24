// src/layouts/UserLayout.jsx
import Navbar from "../Components/Navbar/Navbar";

const UserLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default UserLayout;
