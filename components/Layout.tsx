
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  cartCount: number;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  cartCount, 
  onLogout, 
  onNavigate, 
  activeView,
  searchQuery,
  onSearch
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8 flex-1">
              <button 
                onClick={() => onNavigate('home')}
                className="flex-shrink-0 flex items-center gap-2 font-bold text-2xl text-indigo-600"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">NM</div>
                <span className="hidden md:block">NexusMarket</span>
              </button>
              
              <div className="hidden sm:flex sm:space-x-4">
                <button
                  onClick={() => onNavigate('home')}
                  className={`${activeView === 'home' ? 'text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-700'} text-sm font-medium`}
                >
                  Shop
                </button>
                {user?.role === UserRole.SELLER && (
                  <button
                    onClick={() => onNavigate('seller-dashboard')}
                    className={`${activeView === 'seller-dashboard' ? 'text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-700'} text-sm font-medium`}
                  >
                    Seller Panel
                  </button>
                )}
                {user?.role === UserRole.ADMIN && (
                  <button
                    onClick={() => onNavigate('admin-dashboard')}
                    className={`${activeView === 'admin-dashboard' ? 'text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-700'} text-sm font-medium`}
                  >
                    Admin Hub
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search products, brands..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              {user ? (
                <>
                  <button 
                    onClick={() => onNavigate('cart')}
                    className="relative p-2 text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{user.role}</span>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => onNavigate('auth')}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition active:scale-95"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 NexusMarket. All rights reserved. Built with Gemini AI.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
