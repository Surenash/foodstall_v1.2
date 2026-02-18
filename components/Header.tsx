
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15.21a2 2 0 0 0-1.83-2.62l-3.32-.42a1 1 0 0 1-.81-1.12l.66-3.2A2 2 0 0 0 13.82 6H10.2a2 2 0 0 0-1.89 1.45l-.67 3.2a1 1 0 0 1-.8.7l-3.32.42a2 2 0 0 0-1.13 3.73l2.5 2.22a1 1 0 0 1 .3.94l-.8 3.54a2 2 0 0 0 3 2.24l2.94-1.8a1 1 0 0 1 1.1 0l2.94 1.8a2 2 0 0 0 3-2.24l-.8-3.54a1 1 0 0 1 .3-.94l2.5-2.22A2 2 0 0 0 21 15.21ZM12 10a1 1 0 1 1-1-1 1 1 0 0 1 1 1Zm3 2a1 1 0 1 1-1-1 1 1 0 0 1 1 1Zm-6 2a1 1 0 1 1-1-1 1 1 0 0 1 1 1Z"/>
                <path d="M12 4a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1Z"/><path d="M6.34 6.34a1 1 0 0 0-1.41 1.41l.7.7a1 1 0 0 0 1.42-1.41Z"/><path d="M17.66 6.34l-.7.7a1 1 0 0 0 1.41 1.41l.71-.7a1 1 0 0 0-1.42-1.41Z"/>
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                Street<span className="text-orange-500">Eats</span>
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
