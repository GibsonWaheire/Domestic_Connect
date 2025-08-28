import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

// Custom hook to force navigation to home
const useForceNavigateHome = () => {
  const navigate = useNavigate();
  
  const forceNavigateHome = () => {
    // Clear any stored navigation state that might cause redirects
    sessionStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('redirectAfterLogin');
    
    // Try React Router first
    navigate('/home', { replace: true });
    
    // If that doesn't work, force a hard navigation
    setTimeout(() => {
      if (window.location.pathname !== '/home') {
        console.log('React Router navigation failed, forcing hard navigation');
        window.location.href = '/home';
      }
    }, 100);
  };
  
  return forceNavigateHome;
};

interface ReturnToHomeProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

const ReturnToHome = ({ 
  variant = 'outline', 
  size = 'default', 
  showIcon = true,
  className = ''
}: ReturnToHomeProps) => {
  const forceNavigateHome = useForceNavigateHome();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={forceNavigateHome}
      className={`rounded-full transition-all duration-200 hover:scale-105 ${className}`}
      title="Return to Home Page"
    >
      {showIcon && <ArrowLeft className="h-4 w-4 mr-2" />}
      Return to Home
    </Button>
  );
};

export default ReturnToHome;
