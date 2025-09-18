// Temporary mock authentication for Vercel demo
// Replace the apiRequest function in useAuth.tsx with this:

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Mock responses for Vercel demo
  if (endpoint === '/api/auth/check_session') {
    return { user: null } as T;
  }
  
  if (endpoint === '/api/auth/login') {
    const body = JSON.parse(options.body as string);
    const mockUsers = {
      'demo@example.com': { password: 'demo123', user: { id: '1', email: 'demo@example.com', user_type: 'employer', first_name: 'Demo', last_name: 'User' }},
      'employer@example.com': { password: 'password123', user: { id: '2', email: 'employer@example.com', user_type: 'employer', first_name: 'John', last_name: 'Employer' }}
    };
    
    const userData = mockUsers[body.email];
    if (userData && userData.password === body.password) {
      return { message: 'Login successful', user: userData.user } as T;
    } else {
      throw new Error('Invalid credentials');
    }
  }
  
  if (endpoint === '/api/auth/signup') {
    const body = JSON.parse(options.body as string);
    return { 
      message: 'User created successfully', 
      user: { 
        id: Date.now().toString(), 
        email: body.email, 
        user_type: body.user_type, 
        first_name: body.first_name, 
        last_name: body.last_name 
      } 
    } as T;
  }
  
  if (endpoint === '/api/auth/logout') {
    return { message: 'Logged out successfully' } as T;
  }
  
  throw new Error('Mock endpoint not implemented');
}
