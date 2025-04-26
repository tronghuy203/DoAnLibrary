import React from "react";
import Slider from "react-slick";
import khachhang from "../../Assets/khachhang.jpg"
import khachhang2 from "../../Assets/khachhang2.jpg"
import khachhang3 from "../../Assets/khachhang3.jpg"


const testimoniaData = [
    {
        id: 1,
        name: "Trọng Huy",
        text: "Dịch vụ tuyệt vời! Giao diện dễ sử dụng, tài liệu phong phú và hỗ trợ rất nhiệt tình.",
        img: khachhang,
    },
    {
        id: 2,
        name: "Văn Mãi",
        text: "Dịch vụ tuyệt vời! Giao diện dễ sử dụng, tài liệu phong phú và hỗ trợ rất nhiệt tình.",
        img: khachhang2,
    },
    {
        id: 3,
        name: "Đức Khoa",
        text: "Dịch vụ tuyệt vời! Giao diện dễ sử dụng, tài liệu phong phú và hỗ trợ rất nhiệt tình.",
        img: khachhang3,
    },
];

const Testimonial = () => {
    var settings = {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        cssEase: "linear",
        pauseOnHover: true,
        pauseOnFocus: true,
        responsive: [
            {
                breakpoint: 10000,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    initialSlide: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="py-10 bg-white mx-auto flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
            <div className="container">
                <div data-aos="slide-up" className="text-center mb-24 max-w-[400px] mx-auto">
                    <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
                        Khách hàng của chúng tôi nói gì?
                    </p>
                    <h1 className="text-3xl font-bold">
                        Ý Kiến
                    </h1>
                    <p className="text-xs text-gray-400">
                        Chúng tôi luôn nỗ lực mang đến trải nghiệm tốt nhất, và sự hài lòng của khách hàng chính là minh chứng rõ ràng nhất.{" "}
                    </p>
                </div>
                <div data-aos="zoom-in" className="">
                    <div className="">
                        <Slider {...settings}>
                            {testimoniaData.map((data,index) => (
                                <div key={index} className="px-3">
                                    <div className="flex flex-col gap-4 shadow-lg py-8 px-6 rounded-xl dark:bg-gray-800 bg-sky-100 relative">
                                        <div className="my-6">
                                            <div className="">
                                                <img src={data.img} alt="" className="rounded-full w-20 h-20 object-cover mb-5"/>
                                            </div>
                                            <div className="">
                                                <div className="">
                                                    <p className="text-gray-500 text-sm">{data.text}</p>
                                                    <h1 className="text-xl font-bold text-black/80 dark:text-white">{data.name}</h1>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="absolute text-black/20 z-10 -top-5  right-0 font-serif text-9xl">,,</p>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonial