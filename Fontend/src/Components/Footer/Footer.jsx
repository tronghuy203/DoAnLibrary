import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaArrowRight, FaPhoneAlt } from 'react-icons/fa';

const FooterLinks = [
  {
    title: "Home",
    link: "/#"
  },
  {
    title: "About",
    link: "/#about"
  },
  {
    title: "Contact",
    link: "/#contact"
  },
  {
    title: "Blog",
    link: "/#blog"
  },
];
const FooterLinks2 = [
  {
    title: "Help Center",
    link: "/#help-center"
  },
  {
    title: "Contact Us",
    link: "/#contact-us"
  },
  {
    title: "FAQs",
    link: "/#faqs"
  },
  {
    title: "Support Book",
    link: "/#support-book"
  },
];
const FooterLinks3 = [
  {
    title: "About Us",
    link: "/#about-us"
  },
  {
    title: "Careers",
    link: "/#careers"
  },
  {
    title: "News & Press",
    link: "/#news&press"
  },
  {
    title: "Terms & Conditions",
    link: "/#terms&conditions"
  },
];

const Footer = () => {
  return (
    <div className="py-10 bg-gray-100 flex justify-center items-center dark:bg-zinc-950 dark:text-white duration-200">
      <div className="container">
        <div className="grid md:grid-cols-3 py-5 ">
          {/* company details */}
          <div className="py-8 px-4">
            <h1 className="sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3">
              Books Library
            </h1>
            <p className="">
              Books Library là thư viện số, giúp người dùng dễ dàng tìm kiếm, đọc và tải sách mọi lúc, mọi nơi.{" "}
            </p>
            <br />
            {/* social links */}
            <div className="flex items-center gap-3">
              <FaArrowRight className="rotate-[-45deg]"/>
              <p>Thành phố Đà Nẵng</p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <FaPhoneAlt />
              <p>+91 123456789</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://www.instagram.com/" className="text-3xl">
                <FaInstagram/>
              </a>
              <a href="https://www.facebook.com/" className="text-3xl">
                <FaFacebook/>
              </a>
              <a href="https://www.linkedin.com/" className="text-3xl">
                <FaLinkedin/>
              </a>
            </div>
          </div>
          {/* Links section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 col-span-2 md:pl-10">
            <div className="">
              <div className="py-8 px-4">
                <h1 className="text-xl font-bold sm:text-left text-justify mb-3">
                  Important Links
                </h1>
                <ul className="flex flex-col gap-3">
                  {FooterLinks.map((data) => (
                    <li className="cursor-pointer hover:translate-x-1 duration-300 hover:text-sky-600 space-x-1 text-gray-500">
                      <span>&#11162;</span>
                      <span>{data.title}</span>
                    </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="">
              <div className="py-8 px-4">
                <h1 className="text-xl font-bold sm:text-left text-justify mb-3">
                  Customer Support
                </h1>
                <ul className="flex flex-col gap-3">
                  {FooterLinks2.map((data) => (
                    <li className="cursor-pointer hover:translate-x-1 duration-300 hover:text-sky-600 space-x-1 text-gray-500">
                      <span>&#11162;</span>
                      <span>{data.title}</span>
                    </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="">
              <div className="py-8 px-4">
                <h1 className="text-xl font-bold sm:text-left text-justify mb-3">
                  Company Info
                </h1>
                <ul className="flex flex-col gap-3">
                  {FooterLinks3.map((data) => (
                    <li className="cursor-pointer hover:translate-x-1 duration-300 hover:text-sky-600 space-x-1 text-gray-500">
                      <span>&#11162;</span>
                      <span>{data.title}</span>
                    </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* footer section */}
        <div className="">
          <div className="border-t-2 border-gray-300/50">
            <p className="text-center py-10">2025 &copy; Huy-Mai-Khoa. All rights reserved || Made with ♥ by HMK</p>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default Footer;