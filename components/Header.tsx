import React, { useState } from 'react';
import { FunctionSquare, Menu, X, Home, Upload, ListTodo, RotateCcw } from 'lucide-react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  hasAnalyzed: boolean;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, hasAnalyzed, onReset }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'UPLOAD', label: 'Upload Materials', icon: Upload },
    { id: 'ACTION_PLAN', label: 'Action Plan & Technicalities', icon: ListTodo },
  ] as const;

  return (
    <header className="w-full bg-slate-900 text-white p-4 md:p-6 shadow-md relative z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => handleNav('HOME')}
        >
          <FunctionSquare className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CalcFin</h1>
            <p className="text-xs md:text-sm text-slate-400 hidden md:block">Calculus 1 Weakness Analyzer</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${currentPage === item.id 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          
          {hasAnalyzed && (
            <div className="w-px h-6 bg-slate-700 mx-2" />
          )}

          {hasAnalyzed && (
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
              title="Reset Analysis"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 w-64 bg-slate-900 shadow-xl border-t border-slate-800 rounded-bl-xl overflow-hidden md:hidden">
          <div className="flex flex-col p-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-3 rounded-lg text-left text-sm font-medium flex items-center gap-3
                  ${currentPage === item.id 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            
            {hasAnalyzed && (
              <>
                <div className="h-px bg-slate-800 my-1 mx-2" />
                <button
                  onClick={() => {
                    onReset();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-left text-sm font-medium flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-slate-800"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset Analysis
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
