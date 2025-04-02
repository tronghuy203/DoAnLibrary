import Hero from "../Home/Hero";
import BestBooks from "../Home/BestBooks";
import Banner from "./Banner";
import AppStoreBanner from "./AppStoreBanner";
import TopBooks from "./TopBooks";
import Testimonial from "./Testimonial";
import Map from "./Map";

const Home = () => {
  
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
