import React from 'react';
import { Route, Plus, Sparkles, LogOut, User as UserIcon, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNewRoadmap: () => void;
  onOpenTemplates: () => void;
  onOpenAuth: () => void;
  currentView: 'dashboard' | 'detail';
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewRoadmap,
  onOpenTemplates,
  onOpenAuth,
  currentView,
  onNavigateHome
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer select-none group"
          id="brand-logo-button"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm group-hover:bg-zinc-800 transition-colors">
            <Route className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 text-lg tracking-tight">DevRoadmap</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium border border-zinc-200">
                SWE
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">Software Engineer Learning Paths</p>
          </div>
        </div>

        {/* Center / Quick navigation if in detail view */}
        {currentView === 'detail' && (
          <button
            onClick={onNavigateHome}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            id="nav-back-dashboard-btn"
          >
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>All Roadmaps</span>
          </button>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenTemplates}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-lg transition-colors"
                id="navbar-templates-btn"
                title="Browse ready-to-use software engineering templates"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Templates</span>
              </button>

              <button
                onClick={onOpenNewRoadmap}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-lg shadow-sm transition-all"
                id="navbar-new-roadmap-btn"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Roadmap</span>
                <span className="sm:hidden">New</span>
              </button>

              {/* User profile dropdown / info */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <div 
                  className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-semibold text-xs"
                  title={`${user?.name} (${user?.email})`}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left max-w-[130px]">
                  <p className="text-xs font-semibold text-zinc-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                  title="Sign out"
                  id="navbar-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg shadow-sm transition-colors"
              id="navbar-login-btn"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
