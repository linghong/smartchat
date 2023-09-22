import { useState } from 'react'

interface FormSubmissionResponse {
  success: boolean | null;
  message: string | null;
  error: string | null;
}

const useFormSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (url: string, formData: FormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      const data: FormSubmissionResponse = await res.json() as FormSubmissionResponse;

      if (data.success) {
        setSuccessMessage(data.message);
      } else {
        setError(data.error);
      }
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






