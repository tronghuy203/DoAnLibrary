// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import Footer from "./Components/Footer/Footer"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
