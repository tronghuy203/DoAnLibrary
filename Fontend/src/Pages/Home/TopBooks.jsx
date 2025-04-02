import React from "react";
import { useNavigate } from 'react-router-dom';
import Book1 from "../../Assets/book1-T1QIvOvc.jpg"
import Book2 from "../../Assets/book2-C96QbsXx.jpg"
import Book3 from "../../Assets/book3-5_h1HoKi.jpg"

const BooksData = [
    {
        id: 1,
        img: Book1,
        title: "Who's there",
        rating: 5.0,
        author: "Someone",
    },
    {
        id: 2,
        img: Book2,
        title: "His Life",
        rating: 4.5,
        author: "John",
    },
    {
        id: 3,
        img: Book3,
        title: "Lost boys",
        rating: 5.7,
        author: "Lost Girl",
    },
    {
        id: 4,
        img: Book3,
        title: "Lost boys",
        rating: 5.7,
        author: "Lost Girl",
    },
    {
        id: 5,
        img: Book2,
        title: "His Life",
        rating: 4.5,
        author: "John",
    },
    {
        id: 6,
        img: Book1,
        title: "Who's there",
        rating: 5.0,
        author: "Someone",
    },
    {
        id: 1,
        img: Book1,
        title: "Who's there",
        rating: 5.0,
        author: "Someone",
    },
    {
        id: 2,
        img: Book2,
        title: "His Life",
        rating: 4.5,
        author: "John",
    },
    {
        id: 3,
        img: Book3,
        title: "Lost boys",
        rating: 5.7,
        author: "Lost Girl",
    },
    
];

const TopBooks = () => {
    const navigate = useNavigate();

    const handleViewAllBooksClick = () => {
        navigate('/all-books'); 
    };
    return (
        <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
            <div className="container placeholder-gray-100">
                {/* header */}
                <div className="text-center mb-24 max-w-[400px] mx-auto">
                    <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
                        Sách Hay Nhất
                    </p>
                    <h1 className="text-3xl font-bold">
                        Sách Hàng Đầu
                    </h1>
                    <p className="text-xs text-gray-400">
                        Sách hay nhất và là hàng đầu trong mọi loại sách là nguồn cảm hứng vô tận, mở rộng tầm hiểu biết và thay đổi cách nhìn về thế giới.{" "}
                    </p>
                </div>
                {/* card */}
                <div className="">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5">
                        {BooksData.map((data) => (
                            <div className="space-y-3">
                                <img src={data.img} alt="" className="h-[220px] w-[150px] object-cover rounded-md"/>
                                <div className="">
                                    <h2 className="font-semibold">{data.title}</h2>
                                    <p className="text-sm text-gray-700 dark:text-gray-400">{data.author}</p>
                                    <div className="flex items-center gap-1">
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" class="text-yellow-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                                        <span>{data.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={handleViewAllBooksClick}
                            className="text-center mt-10 cursor-pointer bg-sky-600 text-white py-2 px-5 rounded-full">
                                Xem Tất Cả Sách
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBooks;