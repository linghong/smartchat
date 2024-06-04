import React, { FC } from 'react'

import { InputErrors, UploadErrors } from '@/src/types/common'
import Notification from '@/src/components/Notification'

interface Notifications {
  isLoading: boolean;
  loadingMessage: string; 
  successMessage: string | null;
  errorMessage: string | null; 
  uploadErrors?: UploadErrors; 
  inputErrors?: InputErrors;
}

const Notifications: FC<Notifications> = ({isLoading, loadingMessage="Uploading your data...", successMessage, errorMessage,  uploadErrors, inputErrors}) => {
  const notifications = []

  if (isLoading) {
    notifications.push(<Notification key="loading" type="loading" message={loadingMessage} />)
  }

  if (successMessage) {
    notifications.push(<Notification key="success" type="success" message={successMessage} />)
  }

  if (errorMessage) {
    notifications.push(<Notification key="error" type="error" message={errorMessage} />)
  }

  if(uploadErrors) Object.keys(uploadErrors).forEach((key) => {
    notifications.push(<Notification key={`uploaderror-${key}`} type="error" message={uploadErrors[key]} />)
  })

  if(inputErrors) Object.keys(inputErrors).forEach((key) => {
    notifications.push(<Notification key={`inputerror-${key}`} type="error" message={inputErrors[key]} />)
  })

  return notifications
}

export default Notifications