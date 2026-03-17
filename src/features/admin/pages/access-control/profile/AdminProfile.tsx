import { AdminLayout } from "../../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { Shield, User, Mail, Phone, MapPin, Building, Calendar, Edit3, Save, X, Key, CheckCircle, Eye, EyeOff, AlertCircle, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminTheme } from "../../../hooks/AdminThemeContext";

export default function AdminProfile() {
  const { isDark, toggleTheme } = useAdminTheme();
  
  const [adminName, setAdminName] = useState("Administrator");
  const [adminRole, setAdminRole] = useState("admin");
  const [isEditing, setIsEditing] = useState(false);
  
  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isAlertExiting, setIsAlertExiting] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    const name = localStorage.getItem("adminName");
    const role = localStorage.getItem("role");
    if (name) setAdminName(name);
    if (role) setAdminRole(role);
  }, []);

  // Mock profile data
  const profileData = {
    nip: "19850312 201001 1 005",
    email: "kepala.brida@surabaya.go.id",
    phone: "031-5472xxx",
    unit: "Badan Riset dan Inovasi Daerah",
    jabatan: adminRole.replace(/_/g, " "),
    alamat: "Jl. Jimerto No.25-27, Surabaya",
    bergabung: "1 Januari 2024",
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setShowErrorAlert(false);

    const showError = (msg: string) => {
      setPasswordError(msg);
      setShowErrorAlert(true);
      setIsAlertExiting(false);
      setTimeout(() => setIsAlertExiting(true), 3500);
      setTimeout(() => {
        setShowErrorAlert(false);
        setIsAlertExiting(false);
      }, 4000);
    };

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Semua field wajib diisi!");
      return;
    }
    
    // Mock validation
    if (currentPassword !== "admin") {
      showError("Password lama yang Anda masukkan tidak sesuai.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Konfirmasi password baru tidak cocok!");
      return;
    }
    if (newPassword.length < 8) {
      showError("Password baru minimal 8 karakter.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showError("Password baru wajib memiliki minimal satu huruf kapital.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      showError("Password baru wajib memiliki minimal satu angka.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showError("Password baru wajib memiliki minimal satu karakter khusus.");
      return;
    }

    // Success
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    
    setShowSuccessAlert(true);
    setIsAlertExiting(false);

    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => {
      setShowSuccessAlert(false);
      setIsAlertExiting(false);
    }, 4000);
  };

  // ── Theme Classes ──
  const textPrimary   = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg        = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const inputBg       = isDark ? "bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-500 shadow-inner";
  const modalBg       = isDark ? "bg-white/5 border-white/20" : "bg-white border-gray-300 shadow-2xl";
  const modalIconBg   = isDark ? "bg-red-500/20 border-red-500/30" : "bg-red-50 border-red-200";
  const glowLight     = isDark ? "bg-red-600/10" : "bg-red-600/5";

  return (
    <AdminLayout title="Profil Admin" headerIcon={<User className="w-4 h-4" />}>
      
      {/* ── ALERTS CONTAINER ── */}
      {(showSuccessAlert || showErrorAlert) && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ease-in-out ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'animate-bounce-in opacity-100 translate-y-0 blur-none scale-100'}`}>
          {showSuccessAlert && (
            <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
              <div className="p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-inner flex-shrink-0 bg-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Berhasil</h3>
                <p className="text-emerald-100/80 text-xs font-medium leading-relaxed">Password admin berhasil diperbarui.</p>
              </div>
            </div>
          )}
          {showErrorAlert && (
            <div className="backdrop-blur-xl border border-red-500/40 shadow-2xl shadow-red-900/20 rounded-2xl p-4 flex items-start gap-4 bg-red-900/30">
              <div className="p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-inner flex-shrink-0 bg-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Gagal Memperbarui</h3>
                <p className="text-red-100/80 text-xs font-medium leading-relaxed">{passwordError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL OVERLAY ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 perspective-[1000px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" 
              onClick={() => {
                setShowPasswordModal(false);
                setTimeout(() => {
                  setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
                  setPasswordError(""); setShowPwd({ current: false, new: false, confirm: false });
                }, 300);
              }} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: -45 }}
              transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
              className="w-full max-w-lg md:max-w-xl relative z-10 origin-center rounded-2xl overflow-hidden"
            >
              <div className={`shadow-2xl border ${modalBg} p-8 relative`}>
                <div className={`absolute -top-24 -right-24 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${modalIconBg} border flex items-center justify-center shadow-inner`}>
                      <Key className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-500"}`} />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${textPrimary}`}>Ganti Password</h2>
                      <p className={`text-xs ${textSecondary}`}>Pastikan password baru Anda aman.</p>
                    </div>
                  </div>
                  <button onClick={() => {
                      setShowPasswordModal(false);
                      setTimeout(() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); setShowPwd({ current: false, new: false, confirm: false }); }, 300);
                    }} 
                    className={`${textSecondary} hover:${textPrimary} transition-colors`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5 relative z-10">
                  {/* Current PW */}
                  <div>
                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Password Lama</label>
                    <div className="relative">
                      <input type={showPwd.current ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Masukkan password lama"
                        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-10 shadow-inner transition-all ${inputBg}`} />
                      <button type="button" onClick={() => setShowPwd(p => ({...p, current: !p.current}))} className={`absolute right-3 top-2.5 ${textSecondary} hover:text-gray-400`}>
                        {showPwd.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New PW */}
                  <div>
                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Password Baru</label>
                    <div className="relative mb-1.5">
                      <input type={showPwd.new ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Masukkan password baru"
                        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-10 shadow-inner transition-all ${inputBg}`} />
                      <button type="button" onClick={() => setShowPwd(p => ({...p, new: !p.new}))} className={`absolute right-3 top-2.5 ${textSecondary} hover:text-gray-400`}>
                        {showPwd.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className={`text-[10px] ${textSecondary} leading-tight p-2 rounded border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-300"}`}>
                      Wajib kombinasi minimal 8 karakter yang terdiri dari huruf kapital, angka, dan karakter khusus (!@#$%^&* dll).
                    </p>
                  </div>

                  {/* Confirm PW */}
                  <div>
                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input type={showPwd.confirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ketik ulang password baru"
                        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-10 shadow-inner transition-all ${inputBg}`} />
                      <button type="button" onClick={() => setShowPwd(p => ({...p, confirm: !p.confirm}))} className={`absolute right-3 top-2.5 ${textSecondary} hover:text-gray-400`}>
                        {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-900/20 transition-colors">
                      Perbarui Password
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary} mb-2 flex items-center gap-3`}>
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
                <User className="w-6 h-6" />
              </div>
              Profil Administrator
            </h1>
            <p className={textSecondary}>Informasi profil dan pengaturan akun admin.</p>
          </div>
          
          {/* THEME TOGGLE (NEW) */}
          <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border backdrop-blur-md shadow-sm relative ${cardBg}`}>
            <button
              onClick={() => { if (!isDark) toggleTheme(); }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
                isDark ? "text-red-400" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {isDark && (
                <motion.div layoutId="activeThemeBg" className="absolute inset-0 bg-red-500/20 border border-red-500/30 shadow-inner rounded-lg z-[-1]" transition={{ type: "spring", stiffness: 400, damping: 25 }} />
              )}
              <motion.div animate={{ rotate: isDark ? [ -20, 0 ] : 0, scale: isDark ? [ 0.8, 1 ] : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Moon className="w-4 h-4" />
              </motion.div>
              Gelap
            </button>
            <button
              onClick={() => { if (isDark) toggleTheme(); }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
                !isDark ? "text-red-700" : "text-gray-400 hover:text-white"
              }`}
            >
              {!isDark && (
                <motion.div layoutId="activeThemeBg" className="absolute inset-0 bg-red-50 border border-red-300 shadow-inner rounded-lg z-[-1]" transition={{ type: "spring", stiffness: 400, damping: 25 }} />
              )}
              <motion.div animate={{ rotate: !isDark ? [ 90, 0 ] : 0, scale: !isDark ? [ 0.8, 1 ] : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Sun className="w-4 h-4" />
              </motion.div>
              Terang
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── PROFILE CARD ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`backdrop-blur-xl rounded-2xl border p-8 flex flex-col items-center text-center shadow-sm ${cardBg}`}>
          <div className="w-24 h-24 bg-gradient-to-br from-red-600/20 to-red-900/30 rounded-full flex items-center justify-center border-2 border-red-500/20 mb-4 shadow-lg shadow-red-500/5">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h2 className={`text-xl font-bold ${textPrimary} mb-1`}>{adminName}</h2>
          <p className="text-red-500 text-sm font-medium capitalize mb-4">{profileData.jabatan}</p>
          
          <div className={`w-full space-y-3 text-left mt-4 pt-4 border-t ${isDark ? "border-white/10" : "border-gray-300"}`}>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-500 shrink-0" />
              <span className={`${textPrimary} truncate`}>{profileData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-500 shrink-0" />
              <span className={textPrimary}>{profileData.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-gray-500 shrink-0" />
              <span className={textPrimary}>{profileData.unit}</span>
            </div>
          </div>

          <div className={`w-full mt-6 pt-4 border-t ${isDark ? "border-white/10" : "border-gray-300"}`}>
            <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
              <Calendar className="w-3.5 h-3.5" /> Bergabung sejak {profileData.bergabung}
            </div>
          </div>
        </motion.div>

        {/* ── DETAIL INFO ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`lg:col-span-2 backdrop-blur-xl rounded-2xl border p-6 flex flex-col shadow-sm ${cardBg}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${textSecondary}`} />
              <div>
                <h3 className={`font-bold ${textPrimary}`}>Detail Informasi</h3>
                <p className={`text-xs ${textSecondary}`}>Data diri administrator</p>
              </div>
            </div>
            {!isEditing ? (
              <div className="flex items-center gap-2">
                <button onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                    setShowPasswordModal(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-orange-500/20 hover:text-orange-400" : "bg-gray-900 border-gray-800 text-white hover:bg-gray-800 shadow-sm"}`}>
                  <Key className="w-4 h-4" /> Ganti Password
                </button>
                <button onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400" : "bg-red-600 border-red-700 text-white hover:bg-red-700 shadow-sm"}`}>
                  <Edit3 className="w-4 h-4" /> Edit Profil
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium text-white shadow-sm ${isDark ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700 border border-red-700"}`}>
                  <Save className="w-4 h-4" /> Simpan
                </button>
                <button onClick={() => setIsEditing(false)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                  <X className="w-4 h-4" /> Batal
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5 flex-1">
            {[
              { label: "Nama Lengkap", value: adminName, icon: User },
              { label: "NIP", value: profileData.nip, icon: Shield },
              { label: "Jabatan", value: profileData.jabatan, icon: Building },
              { label: "Email", value: profileData.email, icon: Mail },
              { label: "Telepon", value: profileData.phone, icon: Phone },
              { label: "Alamat Kantor", value: profileData.alamat, icon: MapPin },
            ].map((item) => (
              <div key={item.label} className={`flex flex-col sm:flex-row sm:items-center gap-2 pb-4 border-b ${isDark ? "border-white/5" : "border-gray-200"}`}>
                <div className="flex items-center gap-2 sm:w-40 shrink-0">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${textSecondary}`}>{item.label}</span>
                </div>
                {isEditing ? (
                  <input defaultValue={item.value} className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all capitalize ${inputBg}`} />
                ) : (
                  <span className={`${textPrimary} font-medium capitalize`}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
