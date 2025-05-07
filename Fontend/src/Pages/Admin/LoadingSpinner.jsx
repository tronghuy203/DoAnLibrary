import React from "react";

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-zinc-900/70 z-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-t-transparent border-cyan-500 dark:border-cyan-400 rounded-full animate-spin-continuous"></div>
        <div className="absolute inset-2 border-4 border-r-transparent border-blue-600 dark:border-blue-500 rounded-full animate-spin-continuous-reverse"></div>
        <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-full opacity-50 animate-pulse"></div>
      </div>

      <style>
        {`
          @keyframes spin-continuous {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-continuous-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          .animate-spin-continuous {
            animation: spin-continuous 1s linear infinite;
          }
          .animate-spin-continuous-reverse {
            animation: spin-continuous-reverse 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;