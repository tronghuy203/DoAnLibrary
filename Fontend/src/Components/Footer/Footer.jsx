import React from "react";
import { EnvelopeIcon, PhoneIcon, GlobeAltIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-gray-100 px-6 py-8 lg:px-12 lg:py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in justify-center text-center">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-4">
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-blue-400">
              Nhóm phát triển
            </h1>
          </div>
          <p className="text-gray-300 text-sm sm:text-base text-center md:text-left">
            TrongHuy - DucKhoa - VanMai
          </p>
          <p className="text-gray-400 text-sm sm:text-base text-center md:text-left">
            DongA University
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-4">
            Liên hệ
          </h2>
          <div className="space-y-2 text-gray-300 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-blue-400" />
              <a
                href="mailto:nhomdongadn@gmail.com"
                className="hover:text-blue-400 transition duration-200"
              >
                nhomdongadn@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-blue-400" />
              <a
                href="tel:+84123456789"
                className="hover:text-blue-400 transition duration-200"
              >
                +84 123 456 789
              </a>
            </div>
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-blue-400" />
              <a
                href="https://donga.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition duration-200"
              >
                donga.edu.vn
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-4">
            Theo dõi chúng tôi
          </h2>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition duration-200 transform hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12c0 5.02 3.66 9.17 8.44 9.88v-7h-2.54v-2.88h2.54v-2.2c0-2.52 1.5-3.91 3.8-3.91 1.1 0 2.25.2 2.25.2v2.48h-1.27c-1.25 0-1.64.78-1.64 1.58v1.85h2.8l-.45 2.88h-2.35v7C18.34 21.17 22 17.02 22 12c0-5.52-4.48-10-10-10z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition duration-200 transform hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition duration-200 transform hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9.01h3.41v1.56h.05c.48-.91 1.65-1.87 3.39-1.87 3.62 0 4.29 2.38 4.29 5.48v6.27zM5.34 7.45c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm1.78 13h-3.56V9.01h3.56v11.44zM22 22H2c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h20c.55 0 1 .45 1 1v18c0 .55-.45 1-1 1z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p className="text-gray-400 text-sm sm:text-base">
          © 2025, TrongHuy - DucKhoa - VanMai - DongA University
        </p>
      </div>
    </footer>
  );
};

export default Footer;