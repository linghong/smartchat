import React, { FC } from 'react'

interface Props {
  type?: 'error' | 'loading' | 'success' | 'status';
  message: string | null;
}

const Notification: FC<Props> = ({ type = 'status', message }) => {
  if(message === null) return null
  let className = ''
  let role= ''

  switch (type) {
    case 'error':
      className = 'bold text-red-600'
      role = 'alert'
      break
    case 'loading':
      className = 'bold text-gray-600'
      role = 'status'
      break
    case 'success':
      className = 'bold text-green-600'
      role = 'status'
      break
    case 'status':
      role = 'status'
      className = 'bold text-yellow-600'
    default:
      role = ''
      className = ''
  }

  return <p className={className} role={role}>{message}</p>
}

export default Notification