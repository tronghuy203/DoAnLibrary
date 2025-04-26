// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import React, {useEffect} from "react";
// aos import
import AOS from "aos";
import "aos/dist/aos.css"


const App = () => {

    React.useEffect(() => {
      AOS.init({
        offset: 100,
        duration: 800,
        easing: "ease-in-sine",
        delay: 100, 
        once: true,
      });
      AOS.refresh();
    },[]); 

  return (
    <Router>
      
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
  );
};

export default App;
