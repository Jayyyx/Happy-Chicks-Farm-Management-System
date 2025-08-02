
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    // Check initial theme on mount
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.toggle("dark");
      setIsDarkMode(isDark);
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
