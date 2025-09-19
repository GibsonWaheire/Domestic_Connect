import { useAuth } from '@/hooks/useAuthEnhanced';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Domestic Connect</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Connecting employers with domestic workers and agencies
        </p>
        {user ? (
          <div className="space-y-4">
            <p className="text-lg">Hello, {user.first_name}!</p>
            <p className="text-muted-foreground">
              You are logged in as a {user.user_type}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please sign in to access your dashboard
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
