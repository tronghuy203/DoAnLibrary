import React, { } from "react";
import Hero from "../Home/Hero";
import BestBooks from "../Home/BestBooks";
import Banner from "./Banner";
import AppStoreBanner from "./AppStoreBanner";
import TopBooks from "./TopBooks";
import Testimonial from "./Testimonial";
import Map from "./Map";
// aos import
import AOS from "aos";
import "aos/dist/aos.css"

const Home = () => {

  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100, 
    });
    AOS.refresh();
  },[]);
  
  return (
    <div className="duration-200">  
        <Hero />
        <BestBooks />
        <Banner />
        <AppStoreBanner />
        <TopBooks />
        <Testimonial />
        <Map />
    </div>
  );
};

export default Home;
