import Footer from "../Components/Footer/Footer";
import Navbar from "../Components/Navbar/Navbar";

const UserLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default UserLayout;
