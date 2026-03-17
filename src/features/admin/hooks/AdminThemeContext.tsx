import { createContext, useContext, useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("adminTheme") as Theme) ?? "dark";
    } catch {
      return "dark";
    }
  });

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("adminTheme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
