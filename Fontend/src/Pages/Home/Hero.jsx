import React, { useState } from "react"
import { useNavigate } from 'react-router-dom';
import Book1 from "../../Assets/book1-T1QIvOvc.jpg"
import Book2 from "../../Assets/book2-C96QbsXx.jpg"
import Book3 from "../../Assets/book3-5_h1HoKi.jpg"
import Vector from "../../Assets/blue-pattern-frndFZgs.png"

const ImageList = [
    {
        id: 1,
        img: Book1,
        title: "His Life",
        description: "His Life là cuốn sách kể về cuộc đời đầy cảm hứng và những thử thách của một nhân vật nổi bật, đưa người đọc vào hành trình khám phá những khoảnh khắc quan trọng trong cuộc sống của anh."
    },
    {
        id: 2,
        img: Book2,
        title: "Who's there",
        description: "Who's There? là một cuốn sách đầy bí ẩn, cuốn hút người đọc vào những câu chuyện ly kỳ xoay quanh câu hỏi đơn giản nhưng ám ảnh: Ai đó?"
    },
    {
        id: 3,
        img: Book3,
        title: "Lost Boy",
        description: "Lost Boy là câu chuyện về một chàng trai trẻ đối mặt với những mất mát và tìm kiếm bản thân giữa những khó khăn, khơi gợi cảm xúc về sự trưởng thành, hy vọng và tìm kiếm sự kết nối trong cuộc sống."
    },
];

const Hero = () => {

    const navigate = useNavigate(); 

    const handleOrderClick = () => {
        navigate('/cart'); 
    };

    const [imageId, setImageId] = useState(Book1);
    const [title, setTitle] = useState("Hệ thống thư viện tài liệu online");
    const [description, setDescription] = useState (
        "Hệ thống thư viện tài liệu online cung cấp kho tài liệu số phong phú, hỗ trợ tìm kiếm, đọc, tải và chia sẻ tài liệu cho sinh viên, giảng viên, nhà nghiên cứu. Với các tính năng tìm kiếm nâng cao và quản lý tài liệu, hệ thống giúp tiết kiệm thời gian và tạo cộng đồng chia sẻ tri thức.");

    const bgImage = {
        backgroundImage: `url(${Vector})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        width: "100%",
    };
    return (
        <div className="min-h-[650px] sm:min-h-[750px]  bg-gray-100 flex justify-center items-center dark:bg-zinc-950 dark:text-white duration-200" style={bgImage}>
            <div className="container pb-8 sm:pb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="flex flex-col justify-center gap-4 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1">
                        <h1 data-aos="zoom-out" data-aos-duration="500" className="text-5xl sm:text-6xl lg:text-7xl font-bold">{title}
                            <p data-aos="slide-up" data-aos-duration="500" data-aos-delay="100" className="bg-clip-text text-transparent bg-gradient-to-b from-sky-600 text-right text-sm lg:text-lg to-cyan-200">
                                by Huy-Mai-Khoa
                            </p>
                        </h1>
                        <p data-aos="slide-up" data-aos-duration="500" data-aos-delay="100" className="text-sm lg:text-lg">{description}
                        </p>
                        <button data-aos="zoom-in"
                            onClick={handleOrderClick}
                            className="inline-block bg-gradient-to-r from-sky-600 to-cyan-200 text-white px-4 py-2 mx-auto sm:mx-0 sm:w-36 rounded-full mt-4 hover:scale-105 duration-200 text-sm font-medium">
                            Đặt Hàng Ngay
                        </button>
                    </div>
                    <div className="min-h-[450px] flex justify-center items-center relative order-1 sm:order-2">
                        <div className="h-[300px] sm:h-[450px] overflow-hidden flex justify-center items-center">
                            <img data-aos="zoom-in" data-aos-once="true" src={imageId} alt="" className="w-[250px] h-[250px] sm:h-[350px] sm:w-[300px] sm:scale-125 object-contain mx-auto "/>
                        </div>
                        <div className="flex lg:flex-col lg:top-1/2 lg:-translate-y-1/2 lg:py-2 justify-center gap-4 absolute -bottom-[40px] lg:-right-1 rounded-full">
                            { ImageList.map((data,index) => (
                                <img key={index} data-aos="zoom-in" data-aos-once="true" src={data.img} className="max-w-[100px] h-[100px] object-contain inline-block hover:scale-110 duration-200"
                                onClick={()=>{
                                        setImageId(
                                            data.id === 1 ? Book1 : 
                                            data.id === 2 ? Book2 : 
                                            Book3
                                        );
                                        setTitle(data.title);
                                        setDescription(data.description);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;