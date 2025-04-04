import React from "react";
import { useNavigate } from "react-router-dom";
import Img1 from "../../Assets/book1-T1QIvOvc.jpg"
import Img2 from "../../Assets/book2-C96QbsXx.jpg"
import Img3 from "../../Assets/book3-5_h1HoKi.jpg"

const BooksData = [
    {
        id: 1,
        img: Img1,
        title: "His Life",
        description: "His Life là cuốn sách kể về cuộc đời đầy cảm hứng và những thử thách của một nhân vật nổi bật, đưa người đọc vào hành trình khám phá những khoảnh khắc quan trọng trong cuộc sống của anh."
    },
    {
        id: 2,
        img: Img2,
        title: "Who's there",
        description: "Who's There? là một cuốn sách đầy bí ẩn, cuốn hút người đọc vào những câu chuyện ly kỳ xoay quanh câu hỏi đơn giản nhưng ám ảnh: Ai đó?"
    },
    {
        id: 3,
        img: Img3,
        title: "Lost Boy",
        description: "Lost Boy là câu chuyện về một chàng trai trẻ đối mặt với những mất mát và tìm kiếm bản thân giữa những khó khăn, khơi gợi cảm xúc về sự trưởng thành, hy vọng và tìm kiếm sự kết nối trong cuộc sống."
    },
];

const BestBooks = () => {
    const navigate = useNavigate(); // Khởi tạo useNavigate

    const handleOrderClick = () => {
        navigate("/cart"); // Điều hướng đến trang /cart
    };
    return (
        <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
            <div className="container">
                {/* Header section */}
                <div data-aos="slide-up" className="text-center mb-24 max-w-[400px] mx-auto">
                    <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
                        Sách Thịnh Hành
                    </p>
                    <h1 className="text-3xl font-bold">
                        Sách Hay Nhất
                    </h1>
                    <p className="text-xs text-gray-400">
                        Sách thịnh hành hay nhất là những cuốn sách được nhiều người yêu thích, 
                        có nội dung hấp dẫn và giá trị cao, tạo ảnh hưởng lớn trong cộng đồng độc giả.{" "}
                    </p>
                </div>
                {/* card section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-5 place-items-center gap-20">
                    {
                        BooksData.map((book) => (
                            <div key={book.id} data-aos="zoom-in" className="rounded-2xl bg-white dark:bg-zinc-800 hover:bg-sky-600 dark:hover:bg-sky-600 hover:text-white relative shadow-xl duration-high group max-w-[300px]">
                                <div className="h-[100px]">
                                    <img src={book.img} alt="" className="max-w-[100px] block mx-auto transform -translate-y-14 group-hover:scale-105 duration-300 shadow-md" />
                                </div>
                                <div className="p-4 text-center">
                                    <div className="w-full flex items-center justify-center">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-yellow-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-yellow-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-yellow-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-yellow-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-yellow-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                                    </div>
                                    <h1 className="text-xl font-bold">{book.title}</h1>
                                    <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">{book.description}</p>
                                    <button 
                                        className="bg-sky-600 to-cyan-200 text-white px-4 py-2 rounded-full mt-4 hover:scale-105 duration-200 group-hover:bg-white group-hover:text-sky-600"
                                        onClick={handleOrderClick} // Thêm sự kiện onClick
                                    >
                                        Đặt Hàng Ngay
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
};

export default BestBooks
