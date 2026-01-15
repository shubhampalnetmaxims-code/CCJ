
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onMobileClick?: () => void;
  onInventoryMobileClick?: () => void;
  onInstallerClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMobileClick, onInventoryMobileClick, onInstallerClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
            placeholder="Search..."
          />
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={onMobileClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95 text-[10px] whitespace-nowrap"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Warehouse
          </button>
          
          <button 
            onClick={onInventoryMobileClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 text-[10px] whitespace-nowrap"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Inventory
          </button>

          <button 
            onClick={onInstallerClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-bold border border-amber-100 hover:bg-amber-100 transition-all active:scale-95 text-[10px] whitespace-nowrap"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Installer
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-indigo-700 font-bold uppercase">{user.name.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
