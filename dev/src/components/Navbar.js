import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import texts from '../i18n';

const Navbar = ({ lang, setLang, texts }) => {
  if (!texts || !texts.navbar) {
    return null;
  }
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            <span className="font-bold text-2xl tracking-tight text-gray-900">CLOC</span>
          </Link>
          {/* Botón hamburguesa para móviles */}
          <button
            className="md:hidden flex items-center px-3 py-2 border rounded text-gray-600 border-gray-400 hover:text-blue-500 hover:border-blue-500"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="fill-current h-5 w-5" viewBox="0 0 20 20"><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
          </button>
          {/* Enlaces de navegación */}
          <div
            className={
              (menuOpen ? 'block ' : 'hidden ') +
              'md:flex md:items-center md:space-x-4 w-full md:w-auto absolute md:static top-16 left-0 bg-white md:bg-transparent z-50 md:z-auto shadow md:shadow-none'
            }
          >
            <Link
              to="/"
              className={`block md:inline px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {texts.navbar.home}
            </Link>
            <Link
              to="/test-suite"
              className={`block md:inline px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/test-suite')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {texts.navbar.testSuite}
            </Link>
            <Link
              to="/react-demo"
              className={`block md:inline px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/react-demo')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {texts.navbar.reactDemo}
            </Link>
            {/* Desktop */}
            <div className="hidden md:block ml-4">
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                aria-label={texts.navbar.language}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            {/* Mobile (dentro del menú hamburguesa) */}
            <div className="block md:hidden mt-2">
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none"
                aria-label={texts.navbar.language}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 