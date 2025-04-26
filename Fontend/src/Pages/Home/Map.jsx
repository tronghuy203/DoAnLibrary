import React from "react";

const Map = () => {
  
    return (
      <div className="py-10 bg-white mx-auto flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200 ">
        <div className="container">
            <div data-aos="slide-up" className="text-center mb-10 max-w-[400px] mx-auto">
                <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
                    Nơi khách hàng muốn đến
                </p>
                <h1 className="text-3xl font-bold">
                    Địa chỉ
                </h1>
                <p className="text-xs text-gray-400">
                    Nơi khách hàng luôn muốn đến không chỉ để tận hưởng dịch vụ chất lượng, mà còn để trải nghiệm không gian thân thiện, chuyên nghiệp và đáp ứng mọi nhu cầu một cách hoàn hảo.
                </p>
            </div>
            <div data-aos="zoom-in" className="googlemap">
                <div className="flex justify-center">
                    <div className="w-full border overflow-hidden shadow-lg">
                        <iframe className="w-full"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.8918309353044!2d108.22062651584508!3d16.03128840516969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218389cf02c2b%3A0xbdc63233587e2d88!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyDEkMO0bmcgw4E!5e1!3m2!1svi!2sus!4v1744616343978!5m2!1svi!2sus"
                            width="100%" height="350" allowFullScreen="" loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>  
      </div>
    );
  };
  
  export default Map;