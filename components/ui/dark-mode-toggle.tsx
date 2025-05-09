'use client';
import { useTheme } from 'next-themes';
import { Button } from './button';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      className="px-2 py-1"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </Button>
  );
}
