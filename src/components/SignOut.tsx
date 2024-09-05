import React from 'react';
import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';

const SignOut: React.FC = () => {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center justify-center p-1 text-white text-sm rounded-full hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
      aria-label="Sign out"
    >
      <LogOut size={16} aria-label="logout" />
      <span className="ml-1">Log out</span>
    </button>
  );
};

export default SignOut;
