import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Menu, X, LayoutDashboard, FileText, User, LogOut,
  Users, BarChart3, Database, Shield, Layers, AlertCircle, ChevronRight, Lock, Key, Check, ClipboardCheck, TestTube2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentUserName, getCurrentRole, isLoggedIn, logout, isOPDRole, getCurrentOPDName } from "../../../services/StorageService";
import { changeAdminPassword, getCurrentAdminUsername, loginAdmin } from "../../../services/AuthService";

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
      { label: "Tindak Lanjut", icon: ClipboardCheck, path: "/admin/tindak-lanjut" },
      { label: "Kelola Dummy", icon: TestTube2, path: "/admin/dummy-manager" },
    ],
  },
];

// ─── Inner Layout (consumes theme context) ─────────────────────────────────
function AdminLayoutInner({ children, title, headerIcon }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState(() => getCurrentUserName() || "Administrator");
  const [adminRole, setAdminRole] = useState(() => getCurrentRole() || "admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try { return localStorage.getItem("sidebarOpen") !== "false"; } catch { return true; }
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("sidebarWidth");
    return saved ? parseInt(saved, 10) : 256; // Default to 256px (w-64)
  });
  const [isResizing, setIsResizing] = useState(false);
  const [showPasswordAlert, setShowPasswordAlert] = useState(() =>
    sessionStorage.getItem("showPasswordAlert") === "true"
  );
  const [showRestrictedAlert, setShowRestrictedAlert] = useState(false);
  const [isRestrictedExiting, setIsRestrictedExiting] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

  // Restore Sidebar Scroll Position (Synchronous to prevent flicker)
  useLayoutEffect(() => {
    if (sidebarScrollRef.current) {
      const savedScroll = sessionStorage.getItem("sidebarScrollPos");
      if (savedScroll) {
        sidebarScrollRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, []);

  // Isolate user accessibility settings from Admin panel
  useLayoutEffect(() => {
    // Force standard 16px font-size for Admin
    document.documentElement.style.fontSize = '16px';
    
    // Cleanup: restore user setting if leaving admin
    return () => {
      const saved = localStorage.getItem("app_font_size");
      if (saved) {
        document.documentElement.style.fontSize = `${saved}px`;
      } else {
        document.documentElement.style.fontSize = ''; 
      }
    };
  }, []);

  // Sidebar Resizing Logic
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Limit sidebar width between 200px and 480px
      const newWidth = Math.min(Math.max(e.clientX, 200), 480);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    // Prevent highlight text while dragging
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem("sidebarWidth", sidebarWidth.toString());
    }
  }, [isResizing, sidebarWidth]);

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    sessionStorage.setItem("sidebarScrollPos", e.currentTarget.scrollTop.toString());
  };

  // Auto-hide error alert
  useEffect(() => {
    if (passwordError) {
      const t = setTimeout(() => setPasswordError(""), 3500);
      return () => clearTimeout(t);
    }
  }, [passwordError]);

  const handleLogout = () => { logout(); navigate("/"); };
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => { const next = !prev; localStorage.setItem("sidebarOpen", String(next)); return next; });
  };
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua kolom harus diisi!");
      return;
    }

    const username = getCurrentAdminUsername();
    const res = loginAdmin(username, oldPassword);
    if (!res.success) {
      setPasswordError("Password lama yang Anda masukkan salah!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    const minLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!minLength || !hasUpper || !hasNumber || !hasSpecial) {
      setPasswordError("Password baru harus minimal 8 karakter, mengandung huruf besar, angka, dan karakter khusus.");
      return;
    }

    changeAdminPassword(username, newPassword);
    setPasswordSuccess("Password berhasil diubah!");
    
    setTimeout(() => {
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("");
      // Hide global warning if any
      setShowPasswordAlert(false);
      sessionStorage.setItem("showPasswordAlert", "false");
    }, 2000);
  };

  const forceClosePasswordModal = () => {
    setShowPasswordModal(false);
    setShowCancelConfirm(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleClosePasswordModal = () => {
    if (oldPassword || newPassword || confirmPassword) {
      setShowCancelConfirm(true);
    } else {
      forceClosePasswordModal();
    }
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
  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  // ── Theme-aware class tokens (Forced Light Navy Theme) ─────────────────────
  const bg         = "bg-slate-50";
  const sidebarBg  = "bg-[#020617] border-r border-white/5 shadow-2xl"; // Vey dark slate/black (Screenshot 3 vibe)
  const sidebarBdr = "border-slate-800/50";
  const headerBg   = "bg-[#1e3a8a] shadow-md border-b-0"; // Navy header
  const headerText = "text-white";
  const subText    = "text-blue-100";
  const sectionLbl = "text-slate-500 hover:text-slate-300";
  const menuItem   = "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent rounded-xl";
  const activeItem = "bg-blue-600/90 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold rounded-xl border border-white/40";
  const glowColor  = "bg-blue-100";

  return (
    <div className={`h-screen overflow-hidden ${bg} text-current flex font-sans selection:bg-blue-500/30 transition-colors duration-300`}>

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
                  <button onClick={() => { setShowPasswordAlert(false); sessionStorage.setItem("showPasswordAlert","false"); setShowPasswordModal(true); }}
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

      {/* ── ERROR/SUCCESS FLOATING ALERT (PASSWORD MODAL) ── */}
      <AnimatePresence>
        {(passwordError || passwordSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md"
          >
            {passwordError ? (
              <div className="backdrop-blur-xl border border-red-500/40 shadow-2xl shadow-red-900/20 rounded-2xl p-4 flex items-start gap-4 bg-red-900/30">
                <div className="p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-inner flex-shrink-0 bg-red-500/30">
                  <AlertCircle className="w-6 h-6 text-red-200" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm mb-1">Peringatan Validasi</h3>
                  <p className="text-white/80 text-xs font-medium leading-relaxed mb-1">
                    {passwordError}
                  </p>
                </div>
                <button onClick={() => setPasswordError("")}
                  className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
                <div className="p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-inner flex-shrink-0 bg-emerald-500/30">
                  <Check className="w-6 h-6 text-emerald-200" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm mb-1">Berhasil</h3>
                  <p className="text-white/80 text-xs font-medium leading-relaxed mb-1">
                    {passwordSuccess}
                  </p>
                </div>
                <button onClick={() => setPasswordSuccess("")}
                  className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${glowColor} blur-[120px] rounded-full mix-blend-multiply`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${glowColor} blur-[120px] rounded-full mix-blend-multiply`} />
      </div>

      {/* ── SIDEBAR ── */}
      <aside 
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
        className={`${isSidebarOpen ? `border-r ${sidebarBdr}` : "overflow-hidden"} ${sidebarBg} backdrop-blur-xl ${isResizing ? '' : 'transition-all duration-300'} flex-shrink-0 flex flex-col relative z-20 h-full`}
      >
        {/* DRAG HANDLE */}
        {isSidebarOpen && (
          <div 
            onMouseDown={startResizing}
            className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-blue-500/50' : 'hover:bg-blue-500/30'}`}
          />
        )}
        
        {/* SIDEBAR HEADER */}
        <div className={`h-[72px] flex flex-col justify-center px-5 shrink-0 relative flex-nowrap overflow-hidden bg-black/20 border-b ${sidebarBdr} z-10`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center">
                <img src="/assets/images/Pemkot Logo.png" alt="Pemkot" className="h-6 w-auto object-contain" />
              </div>
              <div className="bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center">
                <img src="/assets/images/brida-logo-watermark.png" alt="BRIDA" className={`h-6 w-auto object-contain`} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-[14px] font-extrabold text-white leading-tight tracking-wide`}>BRIDA STEP</span>
              <span className={`text-[10px] text-blue-200 font-medium leading-none`}>Admin Portal</span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE MENU */}
        <div 
          ref={sidebarScrollRef}
          onScroll={handleSidebarScroll}
          className="flex-1 overflow-y-auto pt-6 pb-[200px] px-4 space-y-5 sidebar-scroll relative z-0"
        >
          {MENU_SECTIONS.map((section) => {
            // OPD role: filter sidebar. Dinsos gets full access like admin.
            const isOPD = isOPDRole();
            const isDinsos = getCurrentOPDName() === "Dinas Sosial";
            const filteredItems = (isOPD && !isDinsos && section.title === "Data Management")
              ? section.items.filter(item => item.label === "Tindak Lanjut")
              : section.items;
            if (filteredItems.length === 0) return null;
            return (
            <div key={section.title} className="space-y-1">
              <button onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${sectionLbl} group`}>
                <span>{section.title}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-all duration-200 ${openSections[section.title] ? "rotate-90" : "rotate-0"}`} />
              </button>

              {openSections[section.title] && (
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const restricted = isCamatRestricted(item.path);
                    return (
                      <button key={item.path}
                        onClick={() => restricted ? handleRestrictedClick() : navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          restricted ? "text-gray-600 border-transparent cursor-not-allowed opacity-50"
                          : isActive(item.path) ? activeItem
                          : menuItem
                        }`}>
                        <item.icon className={`w-4.5 h-4.5 ${restricted ? "text-gray-500" : isActive(item.path) ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {restricted && <Lock className="w-3.5 h-3.5 text-gray-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
          })}
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

        {/* PINNED PROFILE & LOGOUT (Liquid Glass Overlap) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 shrink-0 pointer-events-none z-30">
          <div className="rounded-2xl p-4 backdrop-blur-md bg-white/5 border border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{isOPDRole() ? getCurrentOPDName()?.split(',')[0] || adminName : adminName}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{isOPDRole() ? 'OPD' : adminRole.replace("_", " ")}</p>
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              <button onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-xs font-semibold text-white shadow-sm">
                <Key className="w-4 h-4" />
                Ganti Password
              </button>
              <button onClick={() => setIsLogoutOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-xs font-semibold text-white shadow-sm">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full">
        {/* HEADER */}
        <header className={`h-16 ${headerBg} backdrop-blur-xl border-b ${sidebarBdr} shadow-sm shrink-0 sticky top-0 z-20`}>
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
            
            {/* NO PATTERN ON HEADER FOR CLEAN WHITE LOOK */}

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
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-800/50 border border-blue-700/50 rounded-lg text-xs font-semibold tracking-wide text-blue-100 shadow-sm`}>
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
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-5 border border-blue-500/30 shadow-inner">
                <LogOut className="w-8 h-8 text-blue-200" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Keluar Portal Admin?</h2>
              <p className="text-sm text-blue-100/80 mb-8 leading-relaxed">
                Anda akan mengakhiri sesi administrator. Apakah Anda yakin ingin keluar dari panel ini?
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button onClick={() => setIsLogoutOpen(false)}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  Batal
                </button>
                <button onClick={handleLogout}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600/90 hover:bg-blue-500 shadow-lg shadow-blue-600/30 border border-blue-500/50 transition-all hover:scale-[1.03] active:scale-[0.97]">
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60" onClick={handleClosePasswordModal} />
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.8, y: 30, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
              className="relative w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 overflow-hidden z-10"
            >
              {/* Glass decorative elements */}
              <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-5 border border-blue-500/30 shadow-inner">
                <Key className="w-8 h-8 text-blue-200" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 text-center">Ganti Password</h2>
              <p className="text-sm text-blue-100/80 mb-6 leading-relaxed text-center">
                Perbarui kata sandi akun admin.
              </p>

              <form onSubmit={handlePasswordChange} className="space-y-4 relative z-10 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-blue-100 ml-1">Password Lama</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="Masukkan password lama" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-blue-100 ml-1">Password Baru</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="Min. 8 char, angka, huruf besar & simbol" />
                </div>
                <div className="space-y-1.5 mb-2">
                  <label className="text-xs font-semibold text-blue-100 ml-1">Konfirmasi Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="Ulangi password baru" />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                  <button type="button" onClick={handleClosePasswordModal}
                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                    Batal
                  </button>
                  <button type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 border border-blue-400/50 transition-all text-sm">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CANCEL CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 text-center z-10"
            >
              <div className="mx-auto w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
                <AlertCircle className="w-7 h-7 text-orange-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Batalkan Perubahan?</h3>
              <p className="text-[13px] text-blue-100/80 mb-6 leading-relaxed">
                Data kata sandi yang sudah Anda ketik tidak akan disimpan.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                  Tidak
                </button>
                <button onClick={forceClosePasswordModal}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-500/30 border border-orange-400/50 transition-colors text-sm">
                  Ya, Batalkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { AdminLayoutInner as AdminLayout };
