import { Heart, HomeIcon, Pill } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

function Error404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* Animated Icons */}
        <div className="flex justify-center gap-6 mb-8">
          <Heart 
            className="w-12 h-12 text-primary animate-pulse" 
            fill="#bf2231" 
          />
          <Pill 
            className="w-12 h-12 text-secondary rotate-45" 
            fill="#3498db" 
          />
          <Heart 
            className="w-12 h-12 text-primary animate-pulse" 
            fill="#bf2231" 
          />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-light-text dark:text-dark-text">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Looks like this page took a sick day! 
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Don't worry, our healthcare team is on it. 
            Let's get you back to the homepage.
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
            className="bg-primary hover:bg-red-700 transition-colors"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Homepage
          </Button>
        </div>

        {/* Health Tips Easter Egg */}
        <div className="mt-12 p-4 bg-white dark:bg-dark-bg rounded-lg shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            While you're here, remember to: 
            <span className="block mt-2 font-medium">
              Stay hydrated • Get enough sleep • Exercise regularly
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Error404;
