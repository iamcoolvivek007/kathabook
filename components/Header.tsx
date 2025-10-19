import React, { useState } from 'react';
import type { View } from '../types';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavLink: React.FC<{
  viewName: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ viewName, currentView, setCurrentView, children, className = '', onClick }) => {
  const isActive = currentView === viewName;

  const handleClick = () => {
    setCurrentView(viewName);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'loads', label: 'Loads' },
    { view: 'fleet', label: 'Fleet' },
    { view: 'trips', label: 'Trips' },
    { view: 'transactions', label: 'Transactions' },
    { view: 'reports', label: 'Reports' },
  ] as const;

  return (
    <header className="bg-dark shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white font-bold text-xl">LogiDash</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map(({ view, label }) => (
                <NavLink
                  key={view}
                  viewName={view}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  className="px-3 py-2 text-sm"
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-dark z-50" id="mobile-menu">
            <div className="pt-20 px-2 space-y-2 flex flex-col items-center">
                 {navLinks.map(({ view, label }) => (
                    <NavLink
                        key={view}
                        viewName={view}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        className="block w-full text-center py-4 text-xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {label}
                    </NavLink>
                ))}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;