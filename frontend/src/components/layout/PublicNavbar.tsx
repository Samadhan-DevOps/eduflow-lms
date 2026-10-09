import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../../contexts/ThemeContext';
import Logo from '../common/Logo';
import { initials } from '../../utils/helpers';

export default function PublicNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) nav(`/courses?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm dark:shadow-gray-900/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          <Link to="/"><Logo size={32} /></Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search courses, topics…"
                className="w-full h-10 pl-9 pr-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-700 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-1 ml-2">
            <Link to="/courses" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">Browse</Link>
            {isAuthenticated && <Link to="/my-learning" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">My Learning</Link>}
            {isAuthenticated && (user?.role==='instructor'||user?.role==='admin') && (
              <Link to="/instructor" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">Teach</Link>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{initials(user.first_name, user.last_name)}</div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.first_name}</span>
                </Link>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden md:block px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Sign in</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-full transition-colors shadow-sm shadow-violet-200 dark:shadow-violet-900/30">
                  Start Learning
                </Link>
              </>
            )}
            <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in border-t border-gray-100 dark:border-gray-800 pt-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </form>
            <Link to="/courses" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl" onClick={() => setMobileOpen(false)}><BookOpen className="w-4 h-4" /> Browse Courses</Link>
            {isAuthenticated && <Link to="/my-learning" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl" onClick={() => setMobileOpen(false)}><BookOpen className="w-4 h-4" /> My Learning</Link>}
          </div>
        )}
      </div>
    </nav>
  );
}
