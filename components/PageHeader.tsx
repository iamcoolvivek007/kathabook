import React from 'react';

interface PageHeaderProps {
  title: string;
  actionButton?: React.ReactElement;
  children?: React.ReactNode; // For filters and search bars
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actionButton, children }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-dark">{title}</h1>
        {actionButton}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default PageHeader;