import React, { ReactNode, FC } from 'react';

interface FullPageLayoutProps {
  children: ReactNode;
}

const FullPageLayout: FC<FullPageLayoutProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};

export default FullPageLayout;
