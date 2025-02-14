import { Heart } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg/95 backdrop-blur-sm z-50">
      <div className="relative flex items-center justify-center">
        <Heart 
          className="w-12 h-12 text-red-500 animate-pulse mb-2" 
          fill="currentColor"
        />
        <div className="absolute -bottom-3">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-200">
        Loading Jeevan Verse...
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Connecting you to healthcare services
      </p>
    </div>
  );
};

export default LoadingScreen;