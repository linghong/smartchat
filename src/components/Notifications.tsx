import React, { FC } from 'react'

import { InputErrors, UploadErrors } from '@/src/types/common'
import Notification from '@/src/components/Notification'

interface Notifications {
  isLoading: boolean; 
  successMessage: string | null;
  errorMessage: string | null; 
  uploadErrors?: UploadErrors; 
  inputErrors?: InputErrors;
}

const Notifications: FC<Notifications> = ({isLoading, successMessage, errorMessage, uploadErrors, inputErrors}: Notifications) => {
  const notifications = []

  if (isLoading) {
    notifications.push(<Notification type="loading" message="Uploading your data..." />)
  }

  if (successMessage) {
    notifications.push(<Notification type="success" message={successMessage} />)
  }

  if (errorMessage) {
    notifications.push(<Notification type="error" message={errorMessage} />)
  }

  if(uploadErrors) Object.keys(uploadErrors).forEach((key) => {
    notifications.push(<Notification key={`${key}-error`} type="error" message={uploadErrors[key]} />)
  });

  if(inputErrors) Object.keys(inputErrors).forEach((key) => {
    notifications.push(<Notification key={`${key}-error`} type="error" message={inputErrors[key]} />)
  });

  return <div>{notifications} </div>
};

export default Notifications