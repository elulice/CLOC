import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Chunk - Suite de Pruebas
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/test-suite"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/test-suite')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Suite de Pruebas
            </Link>
            <Link
              to="/react-demo"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/react-demo')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Demo React
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 