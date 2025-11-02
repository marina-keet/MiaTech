import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

const Header: React.FC = () => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-white text-lg font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-neutral-800 font-secondary">MiaTech</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              to="/"
              className="text-neutral-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium font-primary transition-all hover:bg-primary-50"
            >
              Accueil
            </Link>
            <Link
              to="/services"
              className="text-neutral-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium font-primary transition-all hover:bg-primary-50"
            >
              Services
            </Link>
            <Link
              to="/portfolio"
              className="text-neutral-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium font-primary transition-all hover:bg-primary-50"
            >
              Portfolio
            </Link>
            <Link
              to="/contact"
              className="text-neutral-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium font-primary transition-all hover:bg-primary-50"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                Connexion
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">
                S'inscrire
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;