import React, { FC } from 'react'

interface Props {
  type?: 'error' | 'loading' | 'success' | 'status';
  message: string | null;
}

const Notification: FC<Props> = ({ type = 'status', message }) => {
  if(message === null) return null
  let className = ''
  let role= ''
  let ariaLive: "off" | "assertive" | "polite" = 'off'

  switch (type) {
    case 'error':
      className = 'bold text-red-600'
      role = 'alert'
      break
    case 'loading':
      className = 'bold text-gray-600'
      role = 'status'
      ariaLive = 'assertive'
      break
    case 'success':
      className = 'bold text-green-600'
      role = 'status'
      ariaLive = 'polite'
      break
    case 'status':
      role = 'status'
      className = 'bold text-yellow-600'
      ariaLive = 'polite'
    default:
      role = ''
      className = ''
      ariaLive = 'off'
  }

  return (
    <div className="p-4">
      <p className={className} role={role} aria-live={ariaLive} >{message}</p>
    </div>
  )
}

export default Notification