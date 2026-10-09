import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'light' | 'dark';
interface Ctx { theme: Theme; toggleTheme(): void; isDark: boolean }
const ThemeCtx = createContext<Ctx | null>(null);

function getInitialTheme(): Theme {
  // Read from the html class set by the anti-flash script in index.html
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  try {
    const saved = localStorage.getItem('ef_theme') as Theme;
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch { /* noop */ }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try { localStorage.setItem('ef_theme', theme); } catch { /* noop */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error('useTheme must be inside ThemeProvider');
  return c;
};

/** Drop-in toggle button — shows moon icon in light mode, sun icon in dark mode */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'relative p-2 rounded-xl transition-all duration-200 overflow-hidden',
        isDark
          ? 'bg-gray-700 text-amber-300 hover:bg-gray-600 hover:text-amber-200'
          : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-600',
        className,
      ].join(' ')}
    >
      {/* Moon — visible in light mode to hint "switch to dark" */}
      <Moon
        className={[
          'w-5 h-5 transition-all duration-300 absolute inset-0 m-auto',
          isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0',
        ].join(' ')}
      />
      {/* Sun — visible in dark mode to hint "switch to light" */}
      <Sun
        className={[
          'w-5 h-5 transition-all duration-300 absolute inset-0 m-auto',
          isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90',
        ].join(' ')}
      />
      {/* invisible spacer to keep button size */}
      <span className="w-5 h-5 inline-block opacity-0 pointer-events-none" aria-hidden />
    </button>
  );
}
