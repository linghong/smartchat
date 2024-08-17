import React from 'react';
import { useRouter } from 'next/router';
import { AiOutlineLogout } from 'react-icons/ai';

const SignOut: React.FC = () => {
  const router = useRouter();

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center justify-center  p-1  text-white text-sm rounded-full hover:bg-stone-600"
    >
      <AiOutlineLogout size={16} />
      <span className="ml-1">Log out</span>
    </button>
  );
};

export default SignOut;
