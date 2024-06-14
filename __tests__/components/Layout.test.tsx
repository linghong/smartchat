import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Layout from '@/src/components/Layout'
import Header from '@/src/components/Header'
import Sidebar from '@/src/components/Sidebar'
import Footer from '@/src/components/Footer'

// Mock Header component with a display name
const HeaderMock = () => <div>Header Mock</div>;
HeaderMock.displayName = 'HeaderMock';
jest.mock('@/src/components/Header', () => () => HeaderMock);

// Mock Sidebar component with a display name
const SidebarMock = () => <div>Sidebar Mock</div>;
SidebarMock.displayName = 'SidebarMock';
jest.mock('@/src/components/Sidebar', () => () => SidebarMock);

// Mock Footer component with a display name
const FooterMock = () => <div>Footer Mock</div>;
FooterMock.displayName = 'FooterMock';
jest.mock('@/src/components/Footer', () => () => FooterMock);

describe('Layout Component', () => {
  it('renders Header, Sidebar (conditionally), and Footer correctly on initial load', () => {
    const messageSubjectList = ['Test Subject'];
    const { getByText } = render(
      <Layout messageSubjectList={messageSubjectList}>
        <div>Child Content</div>
      </Layout>
    );

    // Check for Header and Footer
    expect(getByText('Header Mock')).toBeInTheDocument();
    expect(getByText('Footer Mock')).toBeInTheDocument();

    // Sidebar should be visible by default in desktop mode (mock as desktop initially if not specified)
    expect(getByText('Sidebar Mock')).toBeInTheDocument();

    // Check that child content is rendered
    expect(getByText('Child Sound that thiover with validance itMock')).toBeInTheDocument();
  });
});