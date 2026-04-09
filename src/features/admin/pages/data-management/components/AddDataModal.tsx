import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, User, Briefcase, Loader2, CheckCircle2, AlertCircle, Search, LogOut } from "lucide-react";
import { fetchDispendukData, type DispendukRecord } from "../../../../../data/dispendukcapil";
import { checkDinsosData } from "../../../../../data/dinsos";
import { saveUser, findUserByNIK, updateUser } from "../../../../../services/StorageService";
import type { UserRecord } from "../../../../../services/StorageService";

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataAdded: (msg: string) => void;
  origin?: { x: number; y: number };
}

export function AddDataModal({ isOpen, onClose, onDataAdded, origin }: AddDataModalProps) {
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [punyaUsaha, setPunyaUsaha] = useState("");
  const [bidangUsaha, setBidangUsaha] = useState("");
  const [bidangUsahaLainnya, setBidangUsahaLainnya] = useState("");
  const [penghasilan, setPenghasilan] = useState("");
  const [lamaUsaha, setLamaUsaha] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [agama, setAgama] = useState("");
  const [suku, setSuku] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [nikVerified, setNikVerified] = useState(false);
  const [dispendukData, setDispendukData] = useState<DispendukRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyGakin, setIsAlreadyGakin] = useState(false);
  const [existingNonGakin, setExistingNonGakin] = useState<UserRecord | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Check if user has entered any data (dirty form)
  const isDirty = nik.length > 0 || phone.length > 0 || nikVerified || existingNonGakin !== null;

  const handleSafeClose = useCallback(() => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNik(""); setPhone(""); setPunyaUsaha(""); setBidangUsaha(""); setBidangUsahaLainnya("");
      setPenghasilan(""); setLamaUsaha("");
      setPendidikan(""); setAgama(""); setSuku("");
      setNikVerified(false); setDispendukData(null); setError(null);
      setIsAlreadyGakin(false); setExistingNonGakin(null); setShowExitConfirm(false);
    }
  }, [isOpen]);

  const handleCheckNIK = async () => {
    if (!nik || nik.length !== 16) { setError("NIK wajib 16 digit angka."); return; }
    if (!/^\d+$/.test(nik)) { setError("NIK wajib berisi angka saja."); return; }
    setIsLoading(true); setError(null); setExistingNonGakin(null);

    // Check if already registered in localStorage
    const existingUser = findUserByNIK(nik);
    if (existingUser) {
      setIsLoading(false);
      if (existingUser.gakinStatus === "GAKIN") {
        setIsAlreadyGakin(true);
        setError("NIK ini sudah terdaftar sebagai GAKIN.");
      } else {
        // Non-GAKIN → offer to convert
        setExistingNonGakin(existingUser);
      }
      return;
    }

    // Check if already GAKIN in Dinsos
    const dinsosData = await checkDinsosData(nik);
    if (dinsosData) {
      setIsLoading(false);
      setIsAlreadyGakin(true);
      setError("NIK ini sudah terdaftar sebagai GAKIN di Dinas Sosial.");
      return;
    }

    // Lookup in Dispendukcapil
    const data = await fetchDispendukData(nik);
    setIsLoading(false);
    if (!data) {
      setError("NIK tidak ditemukan di data kependudukan Surabaya.");
      return;
    }

    setDispendukData(data);
    setNikVerified(true);
    setError(null);
  };

  const handleConvertToGakin = () => {
    if (!existingNonGakin) return;
    updateUser(existingNonGakin.nik, { gakinStatus: "GAKIN" });
    window.dispatchEvent(new StorageEvent("storage", { key: "users" }));
    onDataAdded(`${existingNonGakin.fullName} berhasil dipindahkan dari Non-GAKIN ke GAKIN.`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispendukData) return;
    if (!phone) { setError("No. Telepon wajib diisi."); return; }
    if (phone.length > 14) { setError("No. Telepon maksimal 14 digit."); return; }
    if (!/^\d+$/.test(phone)) { setError("No. Telepon hanya boleh berisi angka."); return; }

    // Save as GAKIN user to localStorage so they can login immediately
    const newUser: UserRecord = {
      nik: dispendukData.nik,
      fullName: dispendukData.fullName,
      jenisKelamin: dispendukData.jenisKelamin,
      tempatLahir: dispendukData.tempatLahir,
      tanggalLahir: dispendukData.tanggalLahir,
      phone,
      alamatKtp: dispendukData.alamatKtp,
      rtKtp: dispendukData.rtKtp,
      rwKtp: dispendukData.rwKtp,
      kelurahanKtp: dispendukData.kelurahanKtp,
      kecamatanKtp: dispendukData.kecamatanKtp,
      kotaKtp: dispendukData.kotaKtp,
      provinsiKtp: dispendukData.provinsiKtp,
      kodePosKtp: dispendukData.kodePosKtp,
      isSurabaya: true,
      pendidikan: pendidikan || "-",
      agama: agama || "-",
      suku: suku || "-",
      punyaUsaha: punyaUsaha || "Tidak",
      bidangUsaha: bidangUsaha === "Lainnya" ? (bidangUsahaLainnya || "Lainnya") : (bidangUsaha || "-"),
      penghasilanPerHari: penghasilan || "-",
      lamaBerusaha: lamaUsaha || "-",
      gantiUsaha: "-",
      gakinStatus: "GAKIN",
    };

    saveUser(newUser);
    onDataAdded(`${dispendukData.fullName} berhasil ditambahkan sebagai GAKIN.`);
    onClose();
  };

  // Dark glass input style (matching Ganti Password theme)
  const inputClass = "w-full bg-black/20 border border-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";
  const readonlyClass = "w-full bg-white/5 border border-white/5 text-blue-100/60 rounded-xl px-4 py-3 text-sm cursor-not-allowed";
  const labelClass = "block text-xs font-semibold text-blue-100 mb-1.5 ml-0.5";

  // Genie effect: calculate initial position offset
  const ox = origin ? origin.x - window.innerWidth / 2 : 0;
  const oy = origin ? origin.y - window.innerHeight / 2 : 40;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={handleSafeClose} />

          {/* Modal Card - Genie effect from button origin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.1, x: ox, y: oy, filter: "blur(10px)", rotateX: 45 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.1, x: ox, y: oy, filter: "blur(10px)", rotateX: -45 }}
            transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
            className="w-full max-w-md relative z-10 origin-center"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl overflow-hidden" style={{ maxHeight: "85vh" }}>
              {/* Glass decorative glow */}
              <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
                    <Plus className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Tambah Data GAKIN</h2>
                    <p className="text-xs text-blue-100/60">Cukup masukkan NIK, data terisi otomatis.</p>
                  </div>
                </div>
                <button onClick={handleSafeClose} className="text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto px-6 py-5 relative z-10 custom-scrollbar" style={{ maxHeight: "calc(85vh - 160px)" }}>
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                  {/* Error/Info Alert */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${isAlreadyGakin ? "bg-orange-900/30 border-orange-500/30 text-orange-200" : "bg-red-900/30 border-red-500/30 text-red-200"}`}>
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Non-GAKIN Convert Confirmation ── */}
                  <AnimatePresence>
                    {existingNonGakin && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-4 rounded-xl border bg-amber-900/30 border-amber-500/30 space-y-3">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-amber-100">NIK ini sudah terdaftar sebagai Non-GAKIN</p>
                              <p className="text-xs text-amber-200/70 mt-1">
                                <strong>{existingNonGakin.fullName}</strong> sudah terdaftar di sistem sebagai Non-GAKIN.
                                Apakah Anda ingin memindahkan ke status GAKIN?
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pl-8">
                            <button type="button" onClick={() => { setExistingNonGakin(null); setNik(""); }}
                              className="px-4 py-2 rounded-lg text-xs font-semibold text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">Batal</button>
                            <button type="button" onClick={handleConvertToGakin}
                              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 border border-blue-400/50 transition-all flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Pindahkan ke GAKIN
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── NIK Input + Verify ── */}
                  <div>
                    <label className={labelClass}>NIK (16 Digit) <span className="text-blue-400">*</span></label>
                    <div className="flex gap-2">
                      <input type="text" value={nik} onChange={e => { setNik(e.target.value); setNikVerified(false); setError(null); setIsAlreadyGakin(false); }}
                        placeholder="Masukkan NIK warga Surabaya" className={`flex-1 ${inputClass}`} maxLength={16} disabled={nikVerified} />
                      {!nikVerified ? (
                        <button type="button" onClick={handleCheckNIK} disabled={isLoading || nik.length !== 16}
                          className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/30 border border-blue-500/50 shrink-0">
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          {isLoading ? "Cari..." : "Cari"}
                        </button>
                      ) : (
                        <button type="button" onClick={() => { setNikVerified(false); setNik(""); setDispendukData(null); setError(null); }}
                          className="px-4 py-3 bg-white/10 text-white/80 rounded-xl font-semibold text-sm hover:bg-white/20 border border-white/10 transition-all shrink-0">
                          Ganti
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Auto-filled Data ── */}
                  <AnimatePresence>
                    {nikVerified && dispendukData && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">

                        {/* Success indicator */}
                        <div className="flex items-center gap-2.5 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300" />
                          <span className="text-sm text-emerald-200 font-semibold">Data ditemukan! Terisi otomatis dari Dispendukcapil.</span>
                        </div>

                        {/* Auto-filled fields (readonly) */}
                        <div>
                          <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Data Kependudukan
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className={labelClass}>Nama Lengkap</label>
                              <input value={dispendukData.fullName} readOnly className={readonlyClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelClass}>Jenis Kelamin</label>
                                <input value={dispendukData.jenisKelamin} readOnly className={readonlyClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Tanggal Lahir</label>
                                <input value={dispendukData.tanggalLahir} readOnly className={readonlyClass} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelClass}>Kecamatan</label>
                                <input value={dispendukData.kecamatanKtp} readOnly className={readonlyClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Kelurahan</label>
                                <input value={dispendukData.kelurahanKtp} readOnly className={readonlyClass} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Editable: Data Tambahan */}
                        <div>
                          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Data Tambahan
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className={labelClass}>No. Telepon <span className="text-blue-400">*</span> <span className="text-[10px] text-blue-200/40 ml-1">(maks. 14 digit)</span></label>
                              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 14))}
                                placeholder="08xxxxxxxxxx" className={inputClass} maxLength={14} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className={labelClass}>Pendidikan</label>
                                <select value={pendidikan} onChange={e => setPendidikan(e.target.value)} className={inputClass}>
                                  <option value="" className="bg-gray-900">Pilih</option>
                                  {["SD", "SMP", "SMA / SMK", "D3", "S1", "S2", "S3"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelClass}>Agama</label>
                                <select value={agama} onChange={e => setAgama(e.target.value)} className={inputClass}>
                                  <option value="" className="bg-gray-900">Pilih</option>
                                  {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelClass}>Suku</label>
                                <input type="text" value={suku} onChange={e => setSuku(e.target.value)} placeholder="Contoh: Jawa" className={inputClass} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Editable: Business */}
                        <div>
                          <h3 className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5" /> Bidang Usaha
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className={labelClass}>Apakah memiliki usaha?</label>
                              <div className="flex gap-3">
                                {["Ya", "Tidak"].map(opt => (
                                  <button key={opt} type="button" onClick={() => { setPunyaUsaha(opt); if (opt === "Tidak") { setBidangUsaha("-"); setPenghasilan("-"); setLamaUsaha("-"); } }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${punyaUsaha === opt ? "bg-blue-500/20 border-blue-400/30 text-blue-200" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}>
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {punyaUsaha === "Ya" && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                <div>
                                  <label className={labelClass}>Bidang Usaha</label>
                                  <select value={bidangUsaha} onChange={e => { setBidangUsaha(e.target.value); if (e.target.value !== "Lainnya") setBidangUsahaLainnya(""); }} className={inputClass}>
                                    <option value="" className="bg-gray-900">Pilih</option>
                                    <option value="Makanan/Minuman" className="bg-gray-900">Makanan/Minuman</option>
                                    <option value="Perdagangan Kecil" className="bg-gray-900">Perdagangan Kecil</option>
                                    <option value="Jasa" className="bg-gray-900">Jasa</option>
                                    <option value="Tukang/Teknis" className="bg-gray-900">Tukang/Teknis</option>
                                    <option value="Lainnya" className="bg-gray-900">Lainnya</option>
                                  </select>
                                </div>
                                {bidangUsaha === "Lainnya" && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                                    <label className={labelClass}>Sebutkan Bidang Usaha <span className="text-blue-400">*</span></label>
                                    <input type="text" value={bidangUsahaLainnya} onChange={e => setBidangUsahaLainnya(e.target.value)}
                                      placeholder="Ketik bidang usaha Anda" className={inputClass} />
                                  </motion.div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>Penghasilan / Hari</label>
                                    <select value={penghasilan} onChange={e => setPenghasilan(e.target.value)} className={inputClass}>
                                      <option value="" className="bg-gray-900">Pilih</option>
                                      <option value="< Rp 50.000" className="bg-gray-900">{"< Rp 50.000"}</option>
                                      <option value="Rp 50.000 - Rp 100.000" className="bg-gray-900">Rp 50.000 - Rp 100.000</option>
                                      <option value="Rp 100.000 - Rp 250.000" className="bg-gray-900">Rp 100.000 - Rp 250.000</option>
                                      <option value="> Rp 250.000" className="bg-gray-900">{"> Rp 250.000"}</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>Lama Berusaha</label>
                                    <select value={lamaUsaha} onChange={e => setLamaUsaha(e.target.value)} className={inputClass}>
                                      <option value="" className="bg-gray-900">Pilih</option>
                                      <option value="< 1 Tahun" className="bg-gray-900">{"< 1 Tahun"}</option>
                                      <option value="1-3 Tahun" className="bg-gray-900">1-3 Tahun</option>
                                      <option value="3-5 Tahun" className="bg-gray-900">3-5 Tahun</option>
                                      <option value="> 5 Tahun" className="bg-gray-900">{"> 5 Tahun"}</option>
                                    </select>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* ── Submit + Cancel ── */}
                        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                          <button type="button" onClick={handleSafeClose}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                            Batal
                          </button>
                          <button type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 border border-blue-400/50 transition-all text-sm flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Tambahkan
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ── Exit Confirmation — Liquid Glass Blue ──
  const exitConfirmContent = (
    <AnimatePresence>
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Semi-transparent overlay — NO blur on background */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50" onClick={() => setShowExitConfirm(false)} />

          {/* Liquid Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 320, mass: 0.6 }}
            className="relative z-10 w-full max-w-xs"
          >
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-blue-600/30 rounded-[22px] blur-md opacity-60 pointer-events-none" />

            {/* Card body */}
            <div className="relative bg-white/[0.07] backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(59,130,246,0.15)]">
              {/* Decorative top glow */}
              <div className="absolute inset-x-0 -top-12 h-24 bg-gradient-to-b from-blue-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />
              {/* Decorative shimmer line */}
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              <div className="relative p-6 space-y-5">
                {/* Icon + Text */}
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-500/15 border border-blue-400/25 flex items-center justify-center shadow-inner shrink-0">
                    <LogOut className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white leading-tight">Keluar tanpa menyimpan?</h3>
                    <p className="text-[13px] text-blue-200/60 mt-1 leading-relaxed">Data yang sudah Anda isi belum tersimpan dan akan hilang.</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5">
                  <button onClick={() => setShowExitConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all duration-200">Kembali</button>
                  <button onClick={() => { setShowExitConfirm(false); onClose(); }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 border border-blue-400/40 transition-all duration-200">Ya, Keluar</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return <>{createPortal(modalContent, document.body)}{createPortal(exitConfirmContent, document.body)}</>;
}
