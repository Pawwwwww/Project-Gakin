import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Menu, X, LayoutDashboard, FileText, User, LogOut,
  Users, BarChart3, Database, Shield, Layers, AlertCircle, ChevronRight, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentUserName, getCurrentRole, isLoggedIn, logout } from "../../../services/StorageService";
import { useAdminTheme } from "../hooks/AdminThemeContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
}

/* ── Sidebar Menu Config ── */
interface SubMenuItem { label: string; icon: React.ElementType; path: string; }
interface MenuSection { title: string; icon: React.ElementType; items: SubMenuItem[]; }

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Overview",
    icon: Layers,
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
      { label: "Status Kuesioner", icon: FileText, path: "/admin/status-kuesioner" },
      { label: "Data Responden", icon: Users, path: "/admin/respondent-management" },
    ],
  },
  {
    title: "Access Control",
    icon: Shield,
    items: [
      { label: "Admin Account", icon: Shield, path: "/admin/admin-account" },
      { label: "User Account", icon: User, path: "/admin/user-account" },
    ],
  },
];

// ─── Inner Layout (consumes theme context) ─────────────────────────────────
function AdminLayoutInner({ children, title, headerIcon }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAdminTheme();

  const [adminName, setAdminName] = useState("Administrator");
  const [adminRole, setAdminRole] = useState("admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try { return localStorage.getItem("sidebarOpen") !== "false"; } catch { return true; }
  });
  const [showPasswordAlert, setShowPasswordAlert] = useState(() =>
    sessionStorage.getItem("showPasswordAlert") === "true"
  );
  const [showRestrictedAlert, setShowRestrictedAlert] = useState(false);
  const [isRestrictedExiting, setIsRestrictedExiting] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
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
    if (!isLoggedIn() || !getCurrentRole()) { navigate("/"); return; }
    const name = getCurrentUserName();
    if (name) setAdminName(name);
    setAdminRole(getCurrentRole() || "admin");
  }, [navigate]);

  const handleLogout = () => { logout(); navigate("/"); };
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => { const next = !prev; localStorage.setItem("sidebarOpen", String(next)); return next; });
  };
  const toggleSection = (title: string) => {
    setOpenSections(prev => { const next = { ...prev, [title]: !prev[title] }; localStorage.setItem("sidebarSections", JSON.stringify(next)); return next; });
  };
  const handleRestrictedClick = () => {
    setShowRestrictedAlert(true); setIsRestrictedExiting(false);
    setTimeout(() => setIsRestrictedExiting(true), 3000);
    setTimeout(() => { setShowRestrictedAlert(false); setIsRestrictedExiting(false); }, 3500);
  };
  const isCamatRestricted = (path: string) => adminRole === "camat" && !new Set(["/admin", "/admin/status-kuesioner"]).has(path);
  const isActive = (path: string) => location.pathname === path;

  // ── Theme-aware class tokens ───────────────────────────────────────────────
  const bg         = isDark ? "bg-[#0a0a0a]"       : "bg-gray-50";
  const sidebarBg  = isDark ? "bg-[#111]/90"        : "bg-red-950/95 shadow-xl shadow-red-900/10";
  const sidebarBdr = isDark ? "border-white/5"       : "border-red-800/50";
  const headerBg   = isDark ? "bg-[#111]/80"         : "bg-red-900/90 shadow-md shadow-red-900/10";
  const headerText = isDark ? "text-white"           : "text-white";
  const subText    = isDark ? "text-gray-400"        : "text-red-200";
  const sectionLbl = isDark ? "text-gray-500 hover:text-gray-300"  : "text-red-300/80 hover:text-white";
  const menuItem   = isDark
    ? "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
    : "text-red-200/90 hover:text-white hover:bg-white/10 border-transparent";
  const activeItem = isDark
    ? "bg-red-500/10 text-red-400 border border-red-500/20"
    : "bg-white/10 text-white border border-white/20 shadow-inner";
  const pinnedBg   = isDark ? "bg-[#0a0a0a]/50 border-white/5"  : "bg-red-950/80 border-red-800/30";
  const profileCard = isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-red-500/20" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30";
  const profileName = isDark ? "text-white"  : "text-white";
  const logoutBtn   = isDark
    ? "bg-white/5 border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-gray-300"
    : "bg-white/5 border-white/10 hover:bg-red-500 hover:text-white hover:border-red-400 text-red-100 transition-all";
  const glowColor   = isDark ? "bg-red-600/10" : "bg-red-600/5";

  return (
    <div className={`h-screen overflow-hidden ${bg} text-current flex font-sans selection:bg-red-500/30 transition-colors duration-300`}>

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
                <h3 className="text-white font-bold text-sm mb-1">Peringatan Keamanan</h3>
                <p className="text-white/80 text-xs font-medium leading-relaxed mb-3">
                  Sistem mendeteksi bahwa password Anda mungkin rentan. Segera ganti password Anda demi keamanan akun.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowPasswordAlert(false); sessionStorage.setItem("showPasswordAlert","false"); navigate("/admin/profile"); }}
                    className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                    Ganti Password
                  </button>
                  <button onClick={() => { setShowPasswordAlert(false); sessionStorage.setItem("showPasswordAlert","false"); }}
                    className="text-xs font-bold text-white/60 hover:text-white px-3 py-1.5 transition-colors">
                    Lewati
                  </button>
                </div>
              </div>
              <button onClick={() => { setShowPasswordAlert(false); sessionStorage.setItem("showPasswordAlert","false"); }}
                className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${glowColor} blur-[120px] rounded-full mix-blend-screen`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${glowColor} blur-[120px] rounded-full mix-blend-screen`} />
      </div>

      {/* ── SIDEBAR ── */}
      <aside className={`${isSidebarOpen ? `w-64 border-r ${sidebarBdr}` : "w-0 overflow-hidden"} ${sidebarBg} backdrop-blur-xl transition-all duration-300 flex-shrink-0 flex flex-col relative z-10 sticky top-0 h-screen`}>
        
        {/* LIGHT MODE BATIK MOTIF OVERLAY */}
        {!isDark && (
          <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l1.373 1.373v57.254l-1.373 1.373H5.373L4 58.627V1.373L5.373 0h49.254zm-4.242 8.485H9.615v43.03h40.77V8.485zm-19.8 28.284l14.14-14.142-2.828-2.828-11.313 11.313-11.314-11.313-2.828 2.828 14.142 14.142z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />
        )}

        {/* SIDEBAR HEADER */}
        <div className={`h-16 flex items-center justify-center gap-2 border-b ${sidebarBdr} px-4 shrink-0 relative`}>
          <span className={`text-sm font-bold ${headerText} leading-tight`}>BRIDA Surabaya</span>
        </div>

        {/* SCROLLABLE MENU */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-5 sidebar-scroll">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <button onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${sectionLbl} group`}>
                <span>{section.title}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-all duration-200 ${openSections[section.title] ? "rotate-90" : "rotate-0"}`} />
              </button>

              {openSections[section.title] && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const restricted = isCamatRestricted(item.path);
                    return (
                      <button key={item.path}
                        onClick={() => restricted ? handleRestrictedClick() : navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          restricted ? "text-gray-600 border-transparent cursor-not-allowed opacity-50"
                          : isActive(item.path) ? activeItem
                          : menuItem
                        }`}>
                        <item.icon className={`w-4 h-4 ${restricted ? "text-gray-600" : isActive(item.path) ? (isDark ? "text-red-400" : "text-red-600") : (isDark ? "text-gray-500" : "text-gray-500")}`} />
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

        {/* RESTRICTED ACCESS ALERT */}
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

        {/* PINNED PROFILE & LOGOUT */}
        <div className={`p-4 border-t ${pinnedBg} shrink-0`}>
          <div onClick={() => navigate("/admin/profile")}
            className={`rounded-lg p-3 flex items-center gap-3 mb-3 border cursor-pointer transition-all group ${profileCard}`}>
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 border border-red-500/30">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div className="overflow-hidden">
              <p className={`text-sm font-semibold ${profileName} truncate`}>{adminName}</p>
              <p className={`text-xs ${subText} truncate capitalize`}>{adminRole.replace("_", " ")}</p>
            </div>
          </div>
          <button onClick={() => setIsLogoutOpen(true)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${logoutBtn}`}>
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full">
        {/* HEADER */}
        <header className={`h-16 ${headerBg} backdrop-blur-xl border-b ${sidebarBdr} shadow-sm shrink-0 sticky top-0 z-20`}>
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
            
            {/* LIGHT MODE MOTIF OVERLAY HEADER */}
            {!isDark && (
              <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l1.373 1.373v57.254l-1.373 1.373H5.373L4 58.627V1.373L5.373 0h49.254zm-4.242 8.485H9.615v43.03h40.77V8.485zm-19.8 28.284l14.14-14.142-2.828-2.828-11.313 11.313-11.314-11.313-2.828 2.828 14.142 14.142z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px'
              }} />
            )}

            <div className="flex items-center gap-4 relative z-10">
              <button onClick={toggleSidebar}
                className={`p-2 ${subText} hover:bg-white/10 rounded-lg transition-colors focus:outline-none`}>
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div>
                  <p className={`${headerText} font-bold text-sm leading-tight`}>Panel Administrator</p>
                  <p className={`${subText} text-xs`}>Pemerintah Kota Surabaya</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              {headerIcon && (
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-medium tracking-wider ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/10 border-white/20 text-white"}`}>
                  {headerIcon}
                  <span>{title}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 w-full`}>
          {children}
        </main>
      </div>

      {/* ── LOGOUT MODAL ── */}
      <AnimatePresence>
        {isLogoutOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsLogoutOpen(false)} />
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.8, y: 30, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
              className="relative w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 text-center overflow-hidden">
              <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-5 border border-red-500/30 shadow-inner">
                <LogOut className="w-8 h-8 text-red-200" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Keluar Portal Admin?</h2>
              <p className="text-sm text-red-100/80 mb-8 leading-relaxed">
                Anda akan mengakhiri sesi administrator. Apakah Anda yakin ingin keluar dari panel ini?
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button onClick={() => setIsLogoutOpen(false)}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  Batal
                </button>
                <button onClick={handleLogout}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-red-600/90 hover:bg-red-500 shadow-lg shadow-red-600/30 border border-red-500/50 transition-all hover:scale-[1.03] active:scale-[0.97]">
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { AdminLayoutInner as AdminLayout };
