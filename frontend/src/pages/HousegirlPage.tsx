import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';

/**
 * HousegirlPage — redirects to the worker registration page.
 * Worker registration is handled by ForHousegirlsPage at /for-housegirls.
 */
const HousegirlPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.user_type === 'housegirl') {
      navigate('/housegirl-dashboard', { replace: true });
    } else {
      navigate('/for-housegirls', { replace: true });
    }
  }, [user, navigate]);

  return null;
};

export default HousegirlPage;
