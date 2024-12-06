'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

export default function DarkModeButton({ className }: { className: string }) {
  const { setTheme, theme, systemTheme } = useTheme();

  const handleSelectTheme = useCallback(() => {
    let newTheme;

    if (theme === 'system') {
      newTheme = systemTheme === 'dark' ? 'light' : 'dark';
    } else {
      newTheme = theme === 'dark' ? 'light' : 'dark';
    }

    setTheme(newTheme);
  }, [theme, setTheme, systemTheme]);

  return (
    <Button variant="outline" size="icon" onClick={handleSelectTheme} className={cn('ml-2', className)}>
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
