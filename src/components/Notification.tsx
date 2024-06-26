import React, { FC } from 'react';

interface Notification {
  type?: 'error' | 'loading' | 'success' | 'status';
  message: string | null;
}

const Notification: FC<Notification> = ({ type, message }) => {
  if (message === null) return null;
  let className = '';
  let role = '';
  let ariaLive: 'off' | 'assertive' | 'polite' = 'off';

  switch (type) {
    case 'error':
      className = 'bold text-red-600';
      role = 'alert';
      ariaLive = 'assertive';
      break;
    case 'loading':
      className = 'bold text-gray-600';
      role = 'status';
      ariaLive = 'assertive';
      break;
    case 'success':
      className = 'bold text-green-600';
      role = 'status';
      ariaLive = 'polite';
      break;
    case 'status':
      className = 'bold text-yellow-600';
      role = 'status';
      ariaLive = 'polite';
      break;
    default:
      role = '';
      className = '';
      ariaLive = 'off';
  }

  return (
    <div className="p-4">
      <p className={className} role={role} aria-live={ariaLive}>
        {message}
      </p>
    </div>
  );
};

export default Notification;
