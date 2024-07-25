import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from '@/src/components/Notifications';

describe('Notifications Component', () => {
  it('renders loading notification when isLoading is true', () => {
    render(
      <Notifications
        isLoading={true}
        loadingMessage=""
        successMessage={null}
        errorMessage={null}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders loading notification with custom message when provided', () => {
    const { getByText } = render(
      <Notifications
        isLoading={true}
        loadingMessage="Custom loading message"
        successMessage={null}
        errorMessage={null}
      />
    );
    expect(getByText('Custom loading message')).toBeInTheDocument();
  });

  it('renders success message when provided', () => {
    const { getByText } = render(
      <Notifications
        isLoading={false}
        loadingMessage=""
        successMessage="Success"
        errorMessage={null}
      />
    );
    expect(getByText('Success')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    const { getByText } = render(
      <Notifications
        isLoading={false}
        loadingMessage=""
        successMessage={null}
        errorMessage="Error"
      />
    );
    expect(getByText('Error')).toBeInTheDocument();
  });

  it('renders upload errors when provided', () => {
    const uploadErrors = { file: 'File is too large' };
    const { getByText } = render(
      <Notifications
        isLoading={false}
        loadingMessage=""
        successMessage={null}
        errorMessage={null}
        uploadErrors={uploadErrors}
      />
    );
    expect(getByText('File is too large')).toBeInTheDocument();
  });

  it('renders input errors when provided', () => {
    const inputErrors = { name: 'Name is required' };
    const { getByText } = render(
      <Notifications
        isLoading={false}
        loadingMessage=""
        successMessage={null}
        errorMessage={null}
        inputErrors={inputErrors}
      />
    );
    expect(getByText('Name is required')).toBeInTheDocument();
  });

  it('renders multiple notifications when multiple props are provided', () => {
    const uploadErrors = { file: 'File is too large' };
    const inputErrors = { name: 'Name is required' };
    const { getByText } = render(
      <Notifications
        isLoading={true}
        loadingMessage="Loading..."
        successMessage="Success"
        errorMessage="Error"
        uploadErrors={uploadErrors}
        inputErrors={inputErrors}
      />
    );
    expect(getByText('Loading...')).toBeInTheDocument();
    expect(getByText('Success')).toBeInTheDocument();
    expect(getByText('Error')).toBeInTheDocument();
    expect(getByText('File is too large')).toBeInTheDocument();
    expect(getByText('Name is required')).toBeInTheDocument();
  });

  it('matches snapshot with multiple notifications', () => {
    const uploadErrors = { file: 'File is too large' };
    const inputErrors = { name: 'Name is required' };
    const { asFragment } = render(
      <Notifications
        isLoading={true}
        loadingMessage="Loading..."
        successMessage="Success"
        errorMessage="Error"
        uploadErrors={uploadErrors}
        inputErrors={inputErrors}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
