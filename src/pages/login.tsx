import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const isValidInput = () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    isValidInput();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.status === 429) {
        setError('Too many requests. Please try again later.');
        return;
      }

      if (!response.ok) {
        setError(data.error || 'An error occurred. Please try again.');
        return;
      }

      const token = data.token;
      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('token', token);

        router.push('/');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-md w-full h-160px p-10 space-y-8 ">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Your Account
        </h2>
      </div>
      <form
        className="space-y-6 w-full bg-gray-200 p-8"
        onSubmit={handleSubmit}
      >
        <div className="rounded-md shadow-sm space-y-4 py-2 ">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          className="group relative w-full flex justify-center py-3 px-3 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};
export default Login;
