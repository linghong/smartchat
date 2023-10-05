import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Notifications from '@/src/components/Notifications'

describe('Notifications Component', () => {
  it('renders loading notification when isLoading is true', () => {
    const { getByText } = render(<Notifications isLoading successMessage={null} errorMessage={null} />)
    expect(getByText('Uploading your data...')).toBeInTheDocument()
  })

  it('renders success message when provided', () => {
    const { getByText } = render(<Notifications isLoading={false} successMessage="Success" errorMessage={null} />)
    expect(getByText('Success')).toBeInTheDocument();
  })

  it('renders error message when provided', () => {
    const { getByText } = render(<Notifications isLoading={false} successMessage={null} errorMessage="Error" />)
    expect(getByText('Error')).toBeInTheDocument()
  })

  it('renders upload errors when provided', () => {
    const uploadErrors = { file: 'File is too large' }
    const { getByText } = render(<Notifications isLoading={false} successMessage={null} errorMessage={null} uploadErrors={uploadErrors} />)
    expect(getByText('File is too large')).toBeInTheDocument()
  })

  it('renders input errors when provided', () => {
    const inputErrors = { name: 'Name is required' }
    const { getByText } = render(<Notifications isLoading={false} successMessage={null} errorMessage={null} inputErrors={inputErrors} />)
    expect(getByText('Name is required')).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const tree = renderer
      .create(<Notifications isLoading={false} successMessage="Success" errorMessage="Error" />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

})