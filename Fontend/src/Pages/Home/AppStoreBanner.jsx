import React from "react";
import BoardImg from "../../Assets/bg-banner-appstore.png"
import PlayStoreImg from "../../Assets/play_store-25MAnoNl.png"
import AppStoreImg from "../../Assets/app_store-aoAyJ2T_.png"

const bannerImg = {
    backgroundImage: `url(${BoardImg})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    height: "100%",
    width: "100%"
}
const AppStoreBanner = () => {
    return (
        <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200" style={bannerImg}>
            <div className="container">
                <div className="space-y-6 max-w-xl mx-auto">
                    <h1 className="text-2xl text-center sm:text-4xl font-semibold">
                        Đọc sách trong tầm tay bạn
                    </h1>
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                            <img src={PlayStoreImg} alt="Google Play Store" className="max-w-[150px] sm:max-w-[120px] md:max-w-[200px]"/>
                        </a>
                        <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                            <img src={AppStoreImg} alt="App Store" className="max-w-[150px] sm:max-w-[120px] md:max-w-[200px]"/>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppStoreBanner