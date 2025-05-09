import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import React, {useEffect} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <Router>    
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
