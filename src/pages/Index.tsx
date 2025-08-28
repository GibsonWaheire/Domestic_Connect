import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();

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
          </div>
        ) : (
          <p className="text-muted-foreground">
            Please sign in to access your dashboard
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
