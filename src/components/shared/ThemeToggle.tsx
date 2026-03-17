import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-[60px] items-center rounded-full p-1 transition-all duration-300 ease-in-out
        ${isDark ? "bg-gray-800 border border-gray-600 shadow-inner" : "bg-white border border-gray-200 shadow-inner"}
      `}
      aria-label="Toggle Dark Mode"
    >
      <div
        className={`
          flex h-6 w-6 items-center justify-center rounded-full shadow-md transform transition-all duration-500 ease-in-out
          ${isDark ? "translate-x-7 bg-gray-900 border border-gray-700" : "translate-x-0 bg-yellow-50 border border-yellow-100"}
        `}
      >
        <span
          className={`absolute transition-all duration-500 ease-in-out ${
            isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
          }`}
        >
          <Sun className="h-4 w-4 text-orange-500" />
        </span>
        <span
          className={`absolute transition-all duration-500 ease-in-out ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`}
        >
          <Moon className="h-4 w-4 text-blue-200" />
        </span>
      </div>
    </button>
  );
}
