import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, User, Home, BookOpen, Briefcase, Edit3, X, CheckCircle, Save, AlertTriangle, AlertCircle, ChevronDown } from "lucide-react";
import { findUserByNIK, updateUser, saveUser } from "../../../../services/StorageService";
import { MOCK_USERS } from "../../../../data/mockData";

function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function InfoRow({ label, value, emptyLabel = "-" }: { label: string; value?: string; emptyLabel?: string }) {
  const display = value?.trim() ? value.trim() : emptyLabel;
  const isEmpty = display === emptyLabel && !value?.trim();
  return (
    <div className="flex justify-between items-center py-3 border-b last:border-0 border-gray-200">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-medium text-sm text-right max-w-[60%] ${isEmpty ? "text-orange-400 italic text-xs" : "text-gray-900"}`}>{display}</span>
    </div>
  );
}

function GlassSelect({ value, onChange, options, placeholder = "Pilih", direction = "down" }: { value: string, onChange: (v: string) => void, options: string[], placeholder?: string, direction?: "up" | "down" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm flex items-center justify-between shadow-inner">
        <span className={value ? "text-white" : "text-white/40"}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${open ? (direction === "up" ? "" : "rotate-180") : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
           <motion.div
             initial={{ opacity: 0, y: direction === "up" ? 5 : -5 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: direction === "up" ? 5 : -5 }}
             transition={{ duration: 0.15 }}
             className={`absolute z-[200] w-full ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"} bg-[#1a202c] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-3xl py-1`}
           >
            <div className="max-h-56 overflow-y-auto dark-scrollbar">
               {options.map(opt => (
                 <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${value === opt ? "bg-blue-500/20 text-blue-300 font-semibold" : "text-white/80"}`}>
                   {opt}
                 </button>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper: deep compare two objects (shallow fields only)
function hasChanges(a: Record<string, any>, b: Record<string, any>, fields: string[]): boolean {
  return fields.some(f => (a[f] ?? "") !== (b[f] ?? ""));
}

const EDIT_FIELDS = [
  "fullName", "jenisKelamin", "phone", "tempatLahir", "tanggalLahir",
  "alamatKtp", "rtKtp", "rwKtp", "kecamatanKtp", "kelurahanKtp",
  "kotaKtp", "provinsiKtp", "kodePosKtp",
  "pendidikan", "agama", "suku",
  "punyaUsaha", "bidangUsaha", "bidangUsahaLainnya", "penghasilanPerHari", "lamaBerusaha", "gantiUsaha",
];

export default function RespondentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role") || "";

  // ── Load respondent data (refreshable) ──
  const loadRespondent = useCallback(() => {
    const storageUser = findUserByNIK(id || "");
    const mockUser = !storageUser ? MOCK_USERS.find(u => u.nik === id) : null;
    const raw = storageUser
      ? { ...storageUser, type: (storageUser.gakinStatus || "GAKIN") as string }
      : mockUser
        ? { ...mockUser, type: (mockUser.gakinStatus || "GAKIN") as string }
        : {
            nik: id || "", fullName: "Responden Tidak Dikenal",
            jenisKelamin: "-", tempatLahir: "-", tanggalLahir: "",
            phone: "-", alamatKtp: "-", rtKtp: "-", rwKtp: "-",
            kelurahanKtp: "-", kecamatanKtp: "-", kotaKtp: "-",
            provinsiKtp: "-", kodePosKtp: "-",
            pendidikan: "-", agama: "-", suku: "-",
            punyaUsaha: "tidak", bidangUsaha: "", penghasilanPerHari: "",
            lamaBerusaha: "", gantiUsaha: "", type: "GAKIN" as string,
          };
    return { ...raw, fullName: toTitleCase(raw.fullName) };
  }, [id]);

  const [respondent, setRespondent] = useState(() => loadRespondent());

  // Real-time sync: listen for localStorage changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "users") setRespondent(loadRespondent());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadRespondent]);

  const calcAge = (): string | number => {
    if (!respondent.tanggalLahir) return "-";
    const birth = new Date(respondent.tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };
  const usia = calcAge();

  // ── Modal states ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editOriginal, setEditOriginal] = useState<Record<string, any>>({});
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidationExiting, setIsValidationExiting] = useState(false);

  // ── Alerts ──
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isAlertExiting, setIsAlertExiting] = useState(false);

  // Auto-hide validation error
  useEffect(() => {
    if (validationError) {
      setIsValidationExiting(false);
      const t1 = setTimeout(() => setIsValidationExiting(true), 3500);
      const t2 = setTimeout(() => { setValidationError(null); setIsValidationExiting(false); }, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [validationError]);

  const initials = respondent.fullName
    .split(" ").slice(0, 2).map((w: string) => w.charAt(0).toUpperCase()).join("");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const STANDARD_USAHA = ["Makanan/Minuman", "Perdagangan Kecil", "Jasa", "Tukang/Teknik", "Lainnya", ""];

  // ── Open edit modal ──
  const openEditModal = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    
    let buMain = respondent.bidangUsaha || "";
    let buLainnya = "";
    if (buMain && !STANDARD_USAHA.includes(buMain)) {
      buLainnya = buMain;
      buMain = "Lainnya";
    }

    const formSnapshot = { 
      ...respondent,
      bidangUsaha: buMain,
      bidangUsahaLainnya: buLainnya
    };
    
    setEditForm(formSnapshot);
    setEditOriginal(formSnapshot);
    setValidationError(null);
    setShowEditModal(true);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => {
      const next = { ...prev, [field]: value };
      // If switching to "tidak punya usaha", clear usaha fields
      if (field === "punyaUsaha" && value === "tidak") {
        next.bidangUsaha = "";
        next.bidangUsahaLainnya = "";
        next.penghasilanPerHari = "";
        next.lamaBerusaha = "";
        next.gantiUsaha = "";
      }
      return next;
    });
  };

  // ── Close with unsaved changes check ──
  const attemptCloseModal = () => {
    if (hasChanges(editForm, editOriginal, EDIT_FIELDS)) {
      setShowUnsavedDialog(true);
    } else {
      setShowEditModal(false);
    }
  };

  const confirmDiscard = () => {
    setShowUnsavedDialog(false);
    setShowEditModal(false);
  };

  // ── Validation & Submit ──
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!editForm.fullName?.trim()) return setValidationError("Nama Lengkap wajib diisi!");
    if (!editForm.jenisKelamin || editForm.jenisKelamin === "-") return setValidationError("Jenis Kelamin wajib dipilih!");
    if (!editForm.tempatLahir?.trim() || editForm.tempatLahir === "-") return setValidationError("Tempat Lahir wajib diisi!");
    if (!editForm.tanggalLahir) return setValidationError("Tanggal Lahir wajib diisi!");

    let finalBidangUsaha = editForm.bidangUsaha;

    // Usaha validation
    if (editForm.punyaUsaha === "ya") {
      if (!editForm.bidangUsaha) return setValidationError("Bidang Usaha wajib dipilih jika memiliki usaha!");
      if (editForm.bidangUsaha === "Lainnya") {
        if (!editForm.bidangUsahaLainnya?.trim()) return setValidationError("Spesifikasi bidang usaha lainnya wajib diisi!");
        finalBidangUsaha = editForm.bidangUsahaLainnya;
      }
      if (!editForm.penghasilanPerHari) return setValidationError("Penghasilan/Hari wajib dipilih jika memiliki usaha!");
      if (!editForm.lamaBerusaha) return setValidationError("Lama Berusaha wajib dipilih jika memiliki usaha!");
      if (!editForm.gantiUsaha) return setValidationError("Ganti Usaha wajib dipilih jika memiliki usaha!");
    }

    // Save to localStorage
    const payload = {
      fullName: editForm.fullName,
      jenisKelamin: editForm.jenisKelamin,
      phone: editForm.phone,
      tempatLahir: editForm.tempatLahir,
      tanggalLahir: editForm.tanggalLahir,
      alamatKtp: editForm.alamatKtp,
      rtKtp: editForm.rtKtp,
      rwKtp: editForm.rwKtp,
      kecamatanKtp: editForm.kecamatanKtp,
      kelurahanKtp: editForm.kelurahanKtp,
      kotaKtp: editForm.kotaKtp,
      provinsiKtp: editForm.provinsiKtp,
      kodePosKtp: editForm.kodePosKtp,
      pendidikan: editForm.pendidikan,
      agama: editForm.agama,
      suku: editForm.suku,
      punyaUsaha: editForm.punyaUsaha || "tidak",
      bidangUsaha: finalBidangUsaha,
      penghasilanPerHari: editForm.penghasilanPerHari,
      lamaBerusaha: editForm.lamaBerusaha,
      gantiUsaha: editForm.gantiUsaha,
    };

    const existingUser = findUserByNIK(respondent.nik);
    if (existingUser) {
      updateUser(respondent.nik, payload);
    } else {
      const mockUser = MOCK_USERS.find(u => u.nik === respondent.nik);
      if (mockUser) {
        saveUser({ ...mockUser, ...payload });
      }
    }

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent("storage", { key: "users" }));

    // Re-read fresh data
    setRespondent(loadRespondent());

    setShowEditModal(false);
    setShowSuccessAlert(true);
    setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowSuccessAlert(false); setIsAlertExiting(false); }, 4000);
  };

  // ── THEME CLASSES ──
  const textPrimary   = "text-gray-900";
  const textSecondary = "text-gray-600";
  const bgCard        = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const glowLight     = "bg-blue-600/5";

  const inputClass = "w-full bg-black/20 border border-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";
  const selectClass = `${inputClass} appearance-none cursor-pointer custom-select`;
  const labelClass = "block text-xs font-medium mb-1.5 text-white/70";

  return (
    <AdminLayout title={`Profil Responden`} headerIcon={<User className="w-4 h-4" />}>
      
      {/* ── SUCCESS ALERT ── */}
      {showSuccessAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ease-in-out ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'animate-bounce-in opacity-100 translate-y-0 blur-none scale-100'}`}>
          <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
            <div className="p-2 rounded-xl backdrop-blur-md border shadow-inner flex-shrink-0 bg-emerald-100 border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm mb-1">Berhasil</h3>
              <p className="text-xs font-medium leading-relaxed text-emerald-900">
                Data responden berhasil diperbarui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {typeof document !== "undefined" ? createPortal(
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 perspective-[1000px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={attemptCloseModal} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: -45 }}
              transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
              className="w-full max-w-lg md:max-w-xl relative z-10 origin-center rounded-3xl overflow-hidden"
            >
              <div className="shadow-2xl border backdrop-blur-[20px] relative flex flex-col bg-white/5 border-white/20" style={{ maxHeight: "85vh" }}>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 relative z-10 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
                      <Edit3 className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Edit Data Responden</h2>
                      <p className="text-xs text-white/50">{respondent.fullName} — {respondent.nik}</p>
                    </div>
                  </div>
                  <button onClick={attemptCloseModal} className="text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {/* Validation Error Inside Modal */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-3 bg-red-500/20 border-red-500/30 transition-all duration-500 ${isValidationExiting ? 'opacity-0 scale-95' : ''}`}>
                      <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                      <p className="text-xs text-red-200 font-medium">{validationError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4 dark-scrollbar" style={{ maxHeight: "calc(85vh - 140px)" }}>
                  <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6 relative z-10">
                    
                    {/* Data Diri */}
                    <div>
                      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Data Diri</h3>
                      <div className="space-y-3">
                        <div><label className={labelClass}>NIK</label><input type="text" value={editForm.nik || ""} className={`${inputClass} opacity-50 cursor-not-allowed`} disabled /></div>
                        <div><label className={labelClass}>Nama Lengkap <span className="text-red-400">*</span></label><input type="text" value={editForm.fullName || ""} onChange={e => handleEditChange("fullName", e.target.value)} className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Jenis Kelamin <span className="text-red-400">*</span></label>
                            <select value={editForm.jenisKelamin || ""} onChange={e => handleEditChange("jenisKelamin", e.target.value)} className={inputClass} >
                              <option value="" className="bg-gray-900">Pilih</option>
                              {["Laki-laki", "Perempuan"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                            </select>
                          </div>
                          <div><label className={labelClass}>No. Telepon</label><input type="tel" value={editForm.phone || ""} onChange={e => handleEditChange("phone", e.target.value)} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelClass}>Tempat Lahir <span className="text-red-400">*</span></label><input type="text" value={editForm.tempatLahir || ""} onChange={e => handleEditChange("tempatLahir", e.target.value)} className={inputClass} /></div>
                          <div><label className={labelClass}>Tanggal Lahir <span className="text-red-400">*</span></label><input type="date" value={editForm.tanggalLahir || ""} onChange={e => handleEditChange("tanggalLahir", e.target.value)} className={inputClass} /></div>
                        </div>
                      </div>
                    </div>

                    {/* Alamat KTP */}
                    <div>
                      <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Home className="w-3.5 h-3.5" /> Alamat KTP</h3>
                      <div className="space-y-3">
                        <div><label className={labelClass}>Alamat Lengkap</label><input type="text" value={editForm.alamatKtp || ""} onChange={e => handleEditChange("alamatKtp", e.target.value)} className={inputClass} /></div>
                        <div className="grid grid-cols-4 gap-3">
                          <div><label className={labelClass}>RT</label><input type="text" value={editForm.rtKtp || ""} onChange={e => handleEditChange("rtKtp", e.target.value)} className={inputClass} maxLength={3} /></div>
                          <div><label className={labelClass}>RW</label><input type="text" value={editForm.rwKtp || ""} onChange={e => handleEditChange("rwKtp", e.target.value)} className={inputClass} maxLength={3} /></div>
                          <div><label className={labelClass}>Kecamatan</label><input type="text" value={editForm.kecamatanKtp || ""} onChange={e => handleEditChange("kecamatanKtp", e.target.value)} className={inputClass} /></div>
                          <div><label className={labelClass}>Kelurahan</label><input type="text" value={editForm.kelurahanKtp || ""} onChange={e => handleEditChange("kelurahanKtp", e.target.value)} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div><label className={labelClass}>Kota/Kab</label><input type="text" value={editForm.kotaKtp || ""} onChange={e => handleEditChange("kotaKtp", e.target.value)} className={inputClass} /></div>
                          <div><label className={labelClass}>Provinsi</label><input type="text" value={editForm.provinsiKtp || ""} onChange={e => handleEditChange("provinsiKtp", e.target.value)} className={inputClass} /></div>
                          <div><label className={labelClass}>Kode Pos</label><input type="text" value={editForm.kodePosKtp || ""} onChange={e => handleEditChange("kodePosKtp", e.target.value)} className={inputClass} maxLength={5} /></div>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Tambahan */}
                    <div>
                      <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Informasi Tambahan</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={labelClass}>Pendidikan</label>
                          <select value={editForm.pendidikan || ""} onChange={e => handleEditChange("pendidikan", e.target.value)} className={inputClass} >
                            <option value="" className="bg-gray-900">Pilih</option>
                            {["SD", "SMP", "SMA / SMK", "D3", "S1", "S2", "S3"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Agama</label>
                          <select value={editForm.agama || ""} onChange={e => handleEditChange("agama", e.target.value)} className={inputClass} >
                            <option value="" className="bg-gray-900">Pilih</option>
                            {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                          </select>
                        </div>
                        <div><label className={labelClass}>Suku</label><input type="text" value={editForm.suku || ""} onChange={e => handleEditChange("suku", e.target.value)} className={inputClass} placeholder="Contoh: Jawa" /></div>
                      </div>
                    </div>

                    {/* Bidang Usaha */}
                    <div>
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Bidang Usaha</h3>
                      <div className="space-y-3">
                        {/* Punya Usaha Toggle */}
                        <div>
                          <label className={labelClass}>Apakah memiliki usaha?</label>
                          <div className="flex items-center gap-4 mt-1">
                            {[{ val: "ya", label: "Ya, Punya" }, { val: "tidak", label: "Tidak Punya" }].map(opt => (
                              <label key={opt.val} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm
                                ${editForm.punyaUsaha === opt.val 
                                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold" 
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>
                                <input type="radio" name="punyaUsaha" value={opt.val} checked={editForm.punyaUsaha === opt.val}
                                  onChange={() => handleEditChange("punyaUsaha", opt.val)} className="sr-only" />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Conditional Usaha Fields */}
                        <AnimatePresence>
                          {editForm.punyaUsaha === "ya" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }} className="space-y-3">
                              <div>
                                <label className={labelClass}>Bidang Usaha <span className="text-red-400">*</span></label>
                                <select value={editForm.bidangUsaha || ""} onChange={e => handleEditChange("bidangUsaha", e.target.value)} className={inputClass} >
                                  <option value="" className="bg-gray-900">Pilih Bidang Usaha</option>
                                  {["Makanan/Minuman", "Perdagangan Kecil", "Jasa", "Tukang/Teknik", "Lainnya"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                </select>
                                <AnimatePresence>
                                  {editForm.bidangUsaha === "Lainnya" && (
                                    <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 8 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                      <input type="text" placeholder="Sebutkan bidang usaha lainnya..." value={editForm.bidangUsahaLainnya || ""} onChange={e => handleEditChange("bidangUsahaLainnya", e.target.value)} className={inputClass} />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                  <label className={labelClass}>Penghasilan/Hari <span className="text-red-400">*</span></label>
                                  <select value={editForm.penghasilanPerHari || ""} onChange={e => handleEditChange("penghasilanPerHari", e.target.value)} className={inputClass} >
                                    <option value="" className="bg-gray-900">Pilih Penghasilan</option>
                                    {["< 100.000", "100.000 - 250.000", "251.000 - 500.000", "501.000 - 1.000.000", "> 1.000.000"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelClass}>Lama Berusaha <span className="text-red-400">*</span></label>
                                  <select value={editForm.lamaBerusaha || ""} onChange={e => handleEditChange("lamaBerusaha", e.target.value)} className={inputClass} >
                                    <option value="" className="bg-gray-900">Pilih</option>
                                    {["< 1 tahun", "1-2 tahun", "3-5 tahun", "> 5 tahun"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelClass}>Ganti Usaha <span className="text-red-400">*</span></label>
                                  <select value={editForm.gantiUsaha || ""} onChange={e => handleEditChange("gantiUsaha", e.target.value)} className={inputClass} >
                                    <option value="" className="bg-gray-900">Pilih</option>
                                    {["0", "1-2 kali", "3-4 kali", "> 4 kali"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                  </select>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                  </form>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-white/10 shrink-0 relative z-10 flex gap-3">
                  <button type="button" onClick={attemptCloseModal} className="flex-1 py-3 px-4 rounded-xl font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                    Batal
                  </button>
                  <button type="submit" form="editForm" className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/50 shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── UNSAVED CHANGES DIALOG ── */}
            <AnimatePresence>
              {showUnsavedDialog && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUnsavedDialog(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-10 w-full max-w-sm border shadow-2xl rounded-3xl p-6 text-center bg-white/5 backdrop-blur-md border-white/20 overflow-hidden"
                  >
                    <div className="absolute inset-x-0 -top-20 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <AlertTriangle className="w-8 h-8 text-orange-300" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white">Data Belum Tersimpan</h3>
                    <p className="text-[13px] text-blue-100/80 mb-5 leading-relaxed">
                      Perubahan yang Anda buat belum disimpan. Yakin ingin keluar?
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowUnsavedDialog(false)}
                        className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-medium text-sm transition-colors">
                        Kembali Edit
                      </button>
                      <button onClick={confirmDiscard}
                        className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm border border-orange-500/50 shadow-lg shadow-orange-500/20 transition-all">
                        Ya, Keluar
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>,
      document.body
      ) : null}
      
      {/* ── HEADER BREADCRUMB ── */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className={`${textSecondary} hover:${textPrimary} transition-colors group`}>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className={`text-sm font-medium flex items-center gap-2 ${textSecondary}`}>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/admin/data")}>Data Responden</span>
          <span>/</span>
          <span className={textPrimary}>Profil</span>
        </div>
      </motion.div>

      {/* ── PROFILE HEADER (Liquid Glass) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 mb-6 relative overflow-hidden ${bgCard}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />
        
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-900/20 shrink-0">
            <span className="text-blue-500 font-black text-2xl">{initials}</span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{respondent.fullName}</h1>
            <p className={`text-sm mt-1 font-mono ${textSecondary}`}>{respondent.nik}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border backdrop-blur-sm shadow-sm ${respondent.type === "GAKIN" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                {respondent.type}
              </span>
              <span className="text-xs shadow-sm px-3 py-1 rounded-lg border font-medium bg-gray-50 border-gray-300 text-gray-700">
                {respondent.jenisKelamin || "-"} · {usia} tahun
              </span>
            </div>
          </div>
          {userRole !== "kepala_brida" && (
            <button onClick={openEditModal}
              className="flex items-center gap-2 px-5 py-2.5 shadow-sm border text-sm font-semibold rounded-xl shrink-0 transition-all bg-gray-900 border-gray-800 text-white hover:bg-black">
              <Edit3 className="w-4 h-4" /> Edit Data
            </button>
          )}
        </div>
      </motion.div>

      {/* ── PROFILE CARDS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: Data Diri */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><User className="w-5 h-5 text-blue-500" /></div>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>Data Diri</h3>
              <p className={`text-xs ${textSecondary}`}>Informasi identitas responden</p>
            </div>
          </div>
          <div className="space-y-0">
            <InfoRow label="Nama Lengkap" value={respondent.fullName} emptyLabel="Belum diisi" />
            <InfoRow label="NIK" value={respondent.nik} emptyLabel="Belum diisi" />
            <InfoRow label="Jenis Kelamin" value={respondent.jenisKelamin} emptyLabel="Belum diisi" />
            <InfoRow label="Tempat Lahir" value={toTitleCase(respondent.tempatLahir || "")} emptyLabel="Belum diisi" />
            <InfoRow label="Tanggal Lahir" value={formatDate(respondent.tanggalLahir)} emptyLabel="Belum diisi" />
            <InfoRow label="No. Telepon" value={respondent.phone} emptyLabel="Belum diisi" />
          </div>
        </motion.div>

        {/* Card 2: Alamat KTP */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20"><Home className="w-5 h-5 text-orange-500" /></div>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>Alamat KTP</h3>
              <p className={`text-xs ${textSecondary}`}>Alamat sesuai Kartu Tanda Penduduk</p>
            </div>
          </div>
          <div className="space-y-0">
            <InfoRow label="Alamat" value={toTitleCase(respondent.alamatKtp || "")} emptyLabel="Belum diisi" />
            <InfoRow label="RT / RW" value={respondent.rtKtp && respondent.rwKtp ? `${respondent.rtKtp} / ${respondent.rwKtp}` : ""} emptyLabel="Belum diisi" />
            <InfoRow label="Kelurahan" value={toTitleCase(respondent.kelurahanKtp || "")} emptyLabel="Belum diisi" />
            <InfoRow label="Kecamatan" value={toTitleCase(respondent.kecamatanKtp || "")} emptyLabel="Belum diisi" />
            <InfoRow label="Kota / Kab" value={toTitleCase(respondent.kotaKtp || "")} emptyLabel="Belum diisi" />
            <InfoRow label="Provinsi" value={toTitleCase(respondent.provinsiKtp || "")} emptyLabel="Belum diisi" />
            <InfoRow label="Kode Pos" value={respondent.kodePosKtp} emptyLabel="Belum diisi" />
          </div>
        </motion.div>

        {/* Card 3: Informasi Tambahan */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20"><BookOpen className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>Informasi Tambahan</h3>
              <p className={`text-xs ${textSecondary}`}>Data pendidikan, agama, dan suku</p>
            </div>
          </div>
          <div className="space-y-0">
            <InfoRow label="Pendidikan Terakhir" value={respondent.pendidikan} />
            <InfoRow label="Agama" value={respondent.agama} />
            <InfoRow label="Suku" value={respondent.suku} />
          </div>
        </motion.div>

        {/* Card 4: Bidang Usaha */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Briefcase className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>Bidang Usaha</h3>
              <p className={`text-xs ${textSecondary}`}>Informasi kewirausahaan responden</p>
            </div>
          </div>
          {respondent.punyaUsaha === "ya" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="backdrop-blur-sm rounded-xl p-4 border bg-gray-50 border-gray-200">
                <p className={`text-xs mb-1 ${textSecondary}`}>Bidang Usaha</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>{respondent.bidangUsaha || "-"}</p>
              </div>
              <div className="backdrop-blur-sm rounded-xl p-4 border bg-gray-50 border-gray-200">
                <p className={`text-xs mb-1 ${textSecondary}`}>Penghasilan / Hari</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>Rp {respondent.penghasilanPerHari || "-"}</p>
              </div>
              <div className="backdrop-blur-sm rounded-xl p-4 border bg-gray-50 border-gray-200">
                <p className={`text-xs mb-1 ${textSecondary}`}>Lama Berusaha</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>{respondent.lamaBerusaha || "-"}</p>
              </div>
              <div className="backdrop-blur-sm rounded-xl p-4 border bg-gray-50 border-gray-200">
                <p className={`text-xs mb-1 ${textSecondary}`}>Ganti Usaha</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>{respondent.gantiUsaha || "-"}</p>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-sm rounded-xl p-6 border flex items-center justify-center bg-gray-50 border-gray-200">
              <div className="text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className={`text-sm font-medium ${textSecondary}`}>Responden tidak memiliki bidang usaha</p>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </AdminLayout>
  );
}
