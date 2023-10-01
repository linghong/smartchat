import { useState } from 'react'

interface FormSubmissionResponse {
  success: boolean | null;
  message?: string | null;
  error?: string | null;
  id: string;
}

const useFormSubmission = () => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (url: string, formData: FormData, serverSecretKey?: string) => {
    setIsLoading(true)
    setSuccessMessage(null)
    setError(null)

    const headers: HeadersInit = {};
    if (serverSecretKey) {
      headers['Authorization'] = 'Bearer ' + serverSecretKey;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
    
      const data: FormSubmissionResponse = await res.json() as FormSubmissionResponse;
      if(data.error) {
        setError(data.error)
      }
      setSuccessMessage(data.id)

    } catch (error) {
      console.log(error);
      setError('There was a network error when sending file.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleFormSubmit, isLoading, successMessage, error };
};

export default useFormSubmission;






