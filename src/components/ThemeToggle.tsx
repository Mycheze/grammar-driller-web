'use client';

import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-border/50 glass-effect animate-pulse" />
    );
  }

  const toggleTheme = () => {
    if (theme === 'light' || theme === 'system') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    // If system theme, detect what it actually is for display
    if (theme === 'system') {
      const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkSystem ? '🌙' : '☀️';
    }
    return theme === 'light' ? '☀️' : '🌙';
  };

  const getTooltip = () => {
    if (theme === 'system') {
      const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkSystem ? 'Switch to light mode' : 'Switch to dark mode';
    }
    return theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg border border-border/50 glass-effect hover:bg-muted/50 transition-all duration-300 flex items-center justify-center group relative"
      title={getTooltip()}
    >
      <span className="text-lg transition-transform group-hover:scale-110">
        {getIcon()}
      </span>
    </button>
  );
}