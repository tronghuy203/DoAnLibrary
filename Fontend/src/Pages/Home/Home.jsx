
import Hero from "../Home/Hero";
import RecentlyAddedBooks from "./RecentlyAdded";


const Home = () => {
  
  return (
    <div className="">
      <div className="bg-zinc-900 text-white px-10 py-8">
        <Hero />
        <RecentlyAddedBooks/>
      </div>
    </div>
  );
};

export default Home;
