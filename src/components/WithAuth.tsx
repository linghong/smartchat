import { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Assume token is expired if it can't be parsed
  }
}

// Higher-Order Component (HOC) for authentication
const WithAuth = <P extends object>(Component: FC<P>): FC<P> => {
  const AuthenticatedComponent: FC<P> = props => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
      null
    );
    const router = useRouter();

    useEffect(() => {
      const checkAuth = () => {
        if (typeof window !== 'undefined') {
          const token = window.localStorage.getItem('token');

          if (!token || isTokenExpired(token)) {
            setIsAuthenticated(false);
            router.push('/login');
          } else {
            setIsAuthenticated(true);
          }
        }
      };
      checkAuth();

      // Set up interval to periodically check token expiration
      const interval = setInterval(checkAuth, 10 * 60 * 1000); // Check every 10 minutes

      return () => clearInterval(interval);
    }, [router]);

    if (isAuthenticated === null) {
      return <div>Loading...</div>; // Show loading while checking authentication
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
  return AuthenticatedComponent;
};
export default WithAuth;
