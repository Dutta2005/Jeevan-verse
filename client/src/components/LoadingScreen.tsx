import React from "react";
import { PulseLoader } from "react-spinners";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-dark-bg/95 bg-white/95">
      {/* <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div> */}
      <PulseLoader
          color="red"
          size={15}
          margin={4}
          speedMultiplier={0.8}
      />
      <p className="text-lg font-semibold text-primary ml-2">Loading...</p>
    </div>
  );
};

export default LoadingScreen;