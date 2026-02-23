import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/home', { replace: true });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReturnHome}
      className={`rounded-full transition-all duration-200 hover:scale-105 ${className}`}
      title="Return to Home Page"
    >
      {showIcon && <ArrowLeft className="h-4 w-4 mr-2" />}
      Return to Home
    </Button>
  );
};

export default ReturnToHome;
