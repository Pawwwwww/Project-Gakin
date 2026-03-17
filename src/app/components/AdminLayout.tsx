import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LogOut, Shield, Menu,
  ChevronRight, LayoutDashboard, Database, BarChart3,
  Users, UserCog, Eye, AlertCircle, X, ClipboardList, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
}

/* ── Sidebar Menu Config ── */
interface SubMenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface MenuSection {
  title: string;
  icon: React.ElementType;
  items: SubMenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Overview",
    icon: Eye,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    ],
  },
  {
    title: "Data Management",
    icon: Database,
    items: [
      { label: "Data", icon: Database, path: "/admin/data" },
      { label: "Status Kuesioner", icon: ClipboardList, path: "/admin/status-kuesioner" },
      { label: "Respondent", icon: Users, path: "/admin/respondent-management" },
    ],
  },
  {
    title: "Access Control",
    icon: Shield,
    items: [
      { label: "Admin Account", icon: UserCog, path: "/admin/admin-account" },
      { label: "User Account", icon: Users, path: "/admin/user-account" },
    ],
  },
];

export function AdminLayout({ children, title, subtitle, headerIcon }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Administrator");
  const [adminRole, setAdminRole] = useState("admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarOpen");
      return saved !== "false"; // Default to true if not "false"
    } catch {
      return true;
    }
  });
  const [showPasswordAlert, setShowPasswordAlert] = useState(() => {
    return sessionStorage.getItem("showPasswordAlert") === "true";
  });

  // Restricted access alert for Camat
  const [showRestrictedAlert, setShowRestrictedAlert] = useState(false);
  const [isRestrictedExiting, setIsRestrictedExiting] = useState(false);

  const CAMAT_ALLOWED_PATHS = new Set(["/admin", "/admin/status-kuesioner"]);
  const isCamatRestricted = (path: string) => adminRole === "camat" && !CAMAT_ALLOWED_PATHS.has(path);

  const handleRestrictedClick = () => {
    setShowRestrictedAlert(true);
    setIsRestrictedExiting(false);
    setTimeout(() => setIsRestrictedExiting(true), 3000);
    setTimeout(() => { setShowRestrictedAlert(false); setIsRestrictedExiting(false); }, 3500);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem("sidebarOpen", String(next));
      return next;
    });
  };

  // Track which sections are open — persist in localStorage
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("sidebarSections");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    const initial: Record<string, boolean> = {};
    MENU_SECTIONS.forEach(s => { initial[s.title] = true; });
    return initial;
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (!isLoggedIn || !role) {
      navigate("/");
      return;
    }

    const name = localStorage.getItem("adminName");
    if (name) setAdminName(name);
    setAdminRole(role);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("sidebarSections");
    navigate("/");
  };

  const toggleSection = (title: string) => {
    setOpenSections(prev => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem("sidebarSections", JSON.stringify(next));
      return next;
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex font-sans selection:bg-red-500/30">
      
      {/* ── FLOATING ALERT CARD (Password Warning) ── */}
      <AnimatePresence>
        {showPasswordAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="backdrop-blur-xl border border-orange-500/40 shadow-2xl shadow-orange-900/20 rounded-2xl p-4 flex items-start gap-4 bg-orange-900/30">
              <div className="p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-inner flex-shrink-0 bg-orange-500/30">
                <AlertCircle className="w-6 h-6 text-orange-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">
                  Peringatan Keamanan
                </h3>
                <p className="text-white/80 text-xs font-medium leading-relaxed mb-3">
                  Sistem mendeteksi bahwa password Anda mungkin rentan. Kami merekomendasikan untuk segera mengganti password Anda demi keamanan akun.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordAlert(false);
                      sessionStorage.setItem("showPasswordAlert", "false");
                      navigate("/admin/profile");
                    }}
                    className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Ganti Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordAlert(false);
                      sessionStorage.setItem("showPasswordAlert", "false");
                    }}
                    className="text-xs font-bold text-white/60 hover:text-white px-3 py-1.5 transition-colors"
                  >
                    Lewati
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordAlert(false);
                  sessionStorage.setItem("showPasswordAlert", "false");
                }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BACKGROUND GLOWS (RED THEME) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${isSidebarOpen ? "w-64 border-r border-white/5" : "w-0 overflow-hidden"
          } bg-[#111111]/80 backdrop-blur-xl transition-all duration-300 flex-shrink-0 flex flex-col relative z-10 sticky top-0 h-screen`}
      >
        {/* ── SIDEBAR HEADER (pinned) ── */}
        <div className="h-16 flex items-center justify-center gap-2 border-b border-white/5 px-4 shrink-0">
          <span className="text-sm font-bold text-white leading-tight">
            BRIDA Surabaya
          </span>
        </div>

        {/* ── SCROLLABLE MENU AREA ── */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-5 sidebar-scroll">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {/* Section Toggle Button */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 text-gray-500 hover:text-gray-300 group"
              >
                <span>{section.title}</span>
                <ChevronRight 
                  className={`w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-all duration-200 ${
                    openSections[section.title] ? "rotate-90" : "rotate-0"
                  }`} 
                />
              </button>
              
              
              {/* Sub-items */}
              {openSections[section.title] && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const restricted = isCamatRestricted(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => restricted ? handleRestrictedClick() : navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          restricted
                            ? "text-gray-600 hover:bg-white/[0.02] border border-transparent cursor-not-allowed opacity-50"
                            : isActive(item.path)
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <item.icon className={`w-4.5 h-4.5 ${restricted ? "text-gray-600" : isActive(item.path) ? "text-red-400" : "text-gray-500"}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {restricted && <Lock className="w-3.5 h-3.5 text-gray-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── RESTRICTED ACCESS ALERT (floating inside sidebar) ── */}
        <AnimatePresence>
          {showRestrictedAlert && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute bottom-28 left-4 right-4 z-50 transition-all duration-300 ${isRestrictedExiting ? "opacity-0 translate-y-2" : ""}`}
            >
              <div className="backdrop-blur-xl border border-orange-500/30 shadow-2xl rounded-2xl p-3.5 flex items-start gap-3 bg-orange-900/40">
                <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 shrink-0">
                  <Lock className="w-4 h-4 text-orange-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs mb-0.5">Akses Terbatas</h3>
                  <p className="text-white/70 text-[11px] leading-relaxed">Halaman ini tidak tersedia untuk akun Camat.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PINNED PROFILE & LOGOUT (always visible, never scrolls) ── */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-[#0a0a0a]/50">
          <div 
            onClick={() => navigate("/admin/profile")}
            className="bg-white/5 rounded-lg p-3 flex items-center gap-3 mb-3 border border-white/5 cursor-pointer hover:bg-white/10 hover:border-red-500/20 transition-all group"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 border border-red-500/30">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{adminName}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{adminRole.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-gray-300 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT W/ HEADER ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full">
        
        {/* ── HEADER ── */}
        <header className="h-16 bg-[#111111]/50 backdrop-blur-xl border-b border-white/5 shadow-sm shrink-0 sticky top-0 z-20">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Panel Administrator</p>
                  <p className="text-gray-400 text-xs">Pemerintah Kota Surabaya</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
               {headerIcon && (
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-medium tracking-wider">
                   {headerIcon}
                   <span>{title}</span>
                 </div>
               )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
