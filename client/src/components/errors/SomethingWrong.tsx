import { AlertCircle, RefreshCcw, HomeIcon, Syringe } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

function SomethingWrong() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* Animated Icons */}
        <div className="flex justify-center gap-6 mb-8">
          <Syringe className="w-12 h-12 text-secondary -rotate-45 animate-bounce" />
          <AlertCircle className="w-12 h-12 text-primary animate-pulse" />
          <Syringe className="w-12 h-12 text-secondary rotate-45 animate-bounce" />
        </div>

        {/* Error Message */}
        <Alert variant="destructive" className="bg-primary/10 border-primary dark:bg-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-2xl font-bold text-primary dark:text-light-text">
            Something Went Wrong
          </AlertTitle>
          <AlertDescription className="text-primary dark:text-light-text">
            Our health system needs a quick check-up. Don't worry, we'll have everything back to normal soon.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button 
            onClick={handleRefresh}
            variant="secondary"
            size="lg"
            className="space-x-2"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>

          <Button 
            onClick={() => navigate('/')} 
            size="lg" 
            className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 space-x-2"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Back to Homepage</span>
          </Button>
        </div>

        {/* Health System Status */}
        <div className="mt-12 p-4 bg-white dark:bg-dark-bg rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Health System Status
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm text-light-text dark:text-dark-text">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>System recovery in progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SomethingWrong;
