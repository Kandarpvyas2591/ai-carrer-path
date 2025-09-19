import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Menu, X, User } from 'lucide-react';

const Navigation = ({ user, onLogout, isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                CareerNavigator
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Welcome, {user.username || user.name}
                  </span>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/input-form')}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Create Roadmap
                  </button>
                  <button
                    onClick={() => {
                      onLogout && onLogout();
                      navigate('/');
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600">
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Welcome, {user.username || user.name}
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate('/input-form');
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Create Roadmap
                </button>
                <button
                  onClick={() => {
                    onLogout && onLogout();
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="block bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-red-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setIsMenuOpen(false);
                  }}
                  className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-blue-700">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;