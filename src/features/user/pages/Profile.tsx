import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, CheckCircle2, X, AlertCircle,
  MapPin, BookOpen, Heart, Users, Calendar, Home, Briefcase,
} from "lucide-react";
import { SearchableSelect } from "../../../components/shared/SearchableSelect";
import {
  KOTA_KABUPATEN_INDONESIA,
  KECAMATAN_SURABAYA,
  KELURAHAN_SURABAYA,
} from "../../../data/indonesiaData";
import {
  AGAMA_OPTIONS, PENDIDIKAN_OPTIONS, SUKU_OPTIONS, PROVINSI_OPTIONS,
  BIDANG_USAHA_OPTIONS, BIDANG_USAHA_DESKRIPSI,
  PENGHASILAN_OPTIONS, LAMA_BERUSAHA_OPTIONS, GANTI_USAHA_OPTIONS,
} from "../../../entities/common";
import {
  isLoggedIn, getCurrentRole, getCurrentUserNIK,
  findUserByNIK, updateUser,
} from "../../../services/StorageService";
import type { UserRecord } from "../../../services/StorageService";

// ── Empty form default ────────────────────────────────────────────────
const emptyForm = (): Omit<UserRecord, "nik" | "fullName"> => ({
  jenisKelamin: "", tempatLahir: "", tanggalLahir: "", phone: "",
  alamatKtp: "", rtKtp: "", rwKtp: "", kelurahanKtp: "", kecamatanKtp: "",
  kotaKtp: "", provinsiKtp: "", kodePosKtp: "",
  alamatDomisili: "", rtDomisili: "", rwDomisili: "", kelurahanDomisili: "",
  kecamatanDomisili: "", kotaDomisili: "", provinsiDomisili: "", kodePosDomisili: "",
  domisiliSama: false,
  pendidikan: "", agama: "", suku: "",
  punyaUsaha: "", bidangUsaha: "", bidangUsahaLainnya: "",
  penghasilanPerHari: "", lamaBerusaha: "", gantiUsaha: "",
});

// ── Component ─────────────────────────────────────────────────────────
interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Profile({ isOpen, onClose }: ProfileProps) {
  const navigate   = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserRecord>({ nik: "", fullName: "", ...emptyForm() });
  const [domisiliSama, setDomisiliSama]       = useState(false);
  const [isEditing, setIsEditing]             = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);
  const [isExiting, setIsExiting]             = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAlertExiting, setIsAlertExiting]   = useState(false);

  // Auto-hide alerts
  useEffect(() => {
    if (validationError) {
      setIsAlertExiting(false);
      const t1 = setTimeout(() => setIsAlertExiting(true), 3500);
      const t2 = setTimeout(() => { setValidationError(null); setIsAlertExiting(false); }, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [validationError]);

  useEffect(() => {
    if (showSuccess) {
      setIsExiting(false);
      const t1 = setTimeout(() => setIsExiting(true), 3500);
      const t2 = setTimeout(() => { setShowSuccess(false); setIsExiting(false); }, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [showSuccess]);

  // Load user data
  useEffect(() => {
    if (!isLoggedIn() || getCurrentRole() !== "user") { navigate("/"); return; }

    const nik  = getCurrentUserNIK();
    const user = findUserByNIK(nik);

    if (user) {
      setFormData(user);
      setDomisiliSama(Boolean(user.domisiliSama));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDomisiliToggle = (checked: boolean) => {
    setDomisiliSama(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        alamatDomisili:   prev.alamatKtp,
        rtDomisili:       prev.rtKtp,
        rwDomisili:       prev.rwKtp,
        kelurahanDomisili: prev.kelurahanKtp,
        kecamatanDomisili: prev.kecamatanKtp,
        kotaDomisili:     prev.kotaKtp,
        provinsiDomisili: prev.provinsiKtp,
        kodePosDomisili:  prev.kodePosKtp,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const showErr = (msg: string) => setValidationError(msg);

    if (!formData.tempatLahir)                  return showErr("Harap pilih Tempat Lahir!");
    if (!formData.tanggalLahir)                 return showErr("Harap isi Tanggal Lahir!");
    if (!formData.jenisKelamin)                 return showErr("Harap pilih Jenis Kelamin!");
    if (!formData.phone.trim())                 return showErr("Harap isi Nomor Telepon!");
    if (!formData.alamatKtp.trim())             return showErr("Harap isi Alamat Lengkap (KTP)!");
    if (!formData.rtKtp.trim())                 return showErr("Harap isi RT (KTP)!");
    if (!formData.rwKtp.trim())                 return showErr("Harap isi RW (KTP)!");
    if (!formData.kelurahanKtp)                 return showErr("Harap pilih Kelurahan (Alamat KTP)!");
    if (!formData.kecamatanKtp)                 return showErr("Harap pilih Kecamatan (Alamat KTP)!");
    if (!formData.kotaKtp)                      return showErr("Harap pilih Kota / Kabupaten (Alamat KTP)!");
    if (!formData.provinsiKtp)                  return showErr("Harap pilih Provinsi (Alamat KTP)!");
    if (!formData.kodePosKtp.trim())            return showErr("Harap isi Kode Pos (KTP)!");
    if (!/^\d{5}$/.test(formData.kodePosKtp))  return showErr("Kode Pos KTP harus 5 digit angka!");

    if (!domisiliSama) {
      if (!formData.alamatDomisili.trim())           return showErr("Harap isi Alamat Lengkap (Domisili)!");
      if (!formData.rtDomisili.trim())               return showErr("Harap isi RT (Domisili)!");
      if (!formData.rwDomisili.trim())               return showErr("Harap isi RW (Domisili)!");
      if (!formData.kelurahanDomisili)               return showErr("Harap pilih Kelurahan (Alamat Domisili)!");
      if (!formData.kecamatanDomisili)               return showErr("Harap pilih Kecamatan (Alamat Domisili)!");
      if (!formData.kotaDomisili)                    return showErr("Harap pilih Kota / Kabupaten (Alamat Domisili)!");
      if (!formData.provinsiDomisili)                return showErr("Harap pilih Provinsi (Alamat Domisili)!");
      if (!formData.kodePosDomisili.trim())          return showErr("Harap isi Kode Pos (Domisili)!");
      if (!/^\d{5}$/.test(formData.kodePosDomisili))return showErr("Kode Pos Domisili harus 5 digit angka!");
    }

    if (!formData.pendidikan)   return showErr("Harap pilih Pendidikan Terakhir!");
    if (!formData.agama)        return showErr("Harap pilih Agama!");
    if (!formData.suku)         return showErr("Harap pilih Suku!");
    if (!formData.punyaUsaha)   return showErr("Harap pilih Punya Usaha!");
    if (formData.punyaUsaha === "ya") {
      if (!formData.bidangUsaha)                                      return showErr("Harap pilih Bidang Usaha!");
      if (formData.bidangUsaha === "Lainnya" && !formData.bidangUsahaLainnya?.trim())
                                                                      return showErr("Harap sebutkan bidang usaha Anda!");
      if (!formData.penghasilanPerHari)                               return showErr("Harap pilih Penghasilan!");
      if (!formData.lamaBerusaha)                                     return showErr("Harap pilih Lama Berusaha!");
      if (!formData.gantiUsaha)                                       return showErr("Harap pilih Berapa Kali Ganti Usaha!");
    }

    updateUser(formData.nik, { ...formData, domisiliSama });
    setIsEditing(false);
    setShowSuccess(true);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Reset ke data tersimpan jika batal
      const user = findUserByNIK(formData.nik);
      if (user) { setFormData(user); setDomisiliSama(Boolean(user.domisiliSama)); }
    }
    setIsEditing(!isEditing);
  };

  // ── Styles ────────────────────────────────────────────────────────────
  const inputClass = isEditing
    ? "block w-full pl-10 pr-3 py-3 border border-red-200/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm shadow-sm placeholder:text-gray-400"
    : "block w-full pl-10 pr-3 py-3 border border-transparent bg-white/30 backdrop-blur-sm rounded-lg text-gray-700 font-medium text-sm shadow-sm cursor-default";
  const inputNoIconClass = isEditing
    ? "block w-full px-3 py-3 border border-red-200/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm shadow-sm placeholder:text-gray-400"
    : "block w-full px-3 py-3 border border-transparent bg-white/30 backdrop-blur-sm rounded-lg text-gray-700 font-medium text-sm shadow-sm cursor-default";
  const selectClass = isEditing
    ? "block w-full pl-10 pr-3 py-3 border border-red-200/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm appearance-none shadow-sm"
    : "block w-full pl-10 pr-3 py-3 border border-transparent bg-white/30 backdrop-blur-sm rounded-lg text-gray-700 font-medium text-sm appearance-none shadow-sm cursor-default";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const iconWrap   = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";

  // ── Address Block ─────────────────────────────────────────────────────
  const renderAddressFields = (prefix: "Ktp" | "Domisili", disabledSection: boolean) => {
    const alamatKey = `alamat${prefix}` as keyof UserRecord;
    const rtKey     = `rt${prefix}` as keyof UserRecord;
    const rwKey     = `rw${prefix}` as keyof UserRecord;
    const kelKey    = `kelurahan${prefix}` as keyof UserRecord;
    const kecKey    = `kecamatan${prefix}` as keyof UserRecord;
    const kotaKey   = `kota${prefix}` as keyof UserRecord;
    const provKey   = `provinsi${prefix}` as keyof UserRecord;
    const posKey    = `kodePos${prefix}` as keyof UserRecord;
    const isDisabled = disabledSection || !isEditing;
    const disabledStyle = disabledSection && isEditing ? " bg-red-50/50 text-gray-400 cursor-not-allowed border-red-100" : "";

    return (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Alamat Lengkap {isEditing && <span className="text-red-500">*</span>}</label>
          <div className="relative">
            <div className={iconWrap}><Home className="h-5 w-5 text-gray-400" /></div>
            <input type="text" value={(formData[alamatKey] as string) || ""}
              onChange={(e) => update(alamatKey, e.target.value)}
              className={inputClass + disabledStyle} placeholder="Jl. Jimerto No.28"
              required={isEditing} disabled={isDisabled} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>RT {isEditing && <span className="text-red-500">*</span>}</label>
            <input type="text" value={(formData[rtKey] as string) || ""}
              onChange={(e) => update(rtKey, e.target.value)}
              className={inputNoIconClass + disabledStyle} placeholder="001" maxLength={3}
              required={isEditing} disabled={isDisabled} />
          </div>
          <div>
            <label className={labelClass}>RW {isEditing && <span className="text-red-500">*</span>}</label>
            <input type="text" value={(formData[rwKey] as string) || ""}
              onChange={(e) => update(rwKey, e.target.value)}
              className={inputNoIconClass + disabledStyle} placeholder="005" maxLength={3}
              required={isEditing} disabled={isDisabled} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Kelurahan / Desa {isEditing && <span className="text-red-500">*</span>}</label>
            {isDisabled ? (
              <input type="text" value={(formData[kelKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
            ) : (
              <SearchableSelect options={KELURAHAN_SURABAYA} value={(formData[kelKey] as string) || ""}
                onChange={(v) => update(kelKey, v)} placeholder="Pilih Kelurahan"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
            )}
          </div>
          <div>
            <label className={labelClass}>Kecamatan {isEditing && <span className="text-red-500">*</span>}</label>
            {isDisabled ? (
              <input type="text" value={(formData[kecKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
            ) : (
              <SearchableSelect options={KECAMATAN_SURABAYA} value={(formData[kecKey] as string) || ""}
                onChange={(v) => update(kecKey, v)} placeholder="Pilih Kecamatan"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Kota / Kabupaten {isEditing && <span className="text-red-500">*</span>}</label>
            {isDisabled ? (
              <input type="text" value={(formData[kotaKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
            ) : (
              <SearchableSelect options={KOTA_KABUPATEN_INDONESIA} value={(formData[kotaKey] as string) || ""}
                onChange={(v) => update(kotaKey, v)} placeholder="Pilih Kota/Kabupaten"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
            )}
          </div>
          <div>
            <label className={labelClass}>Provinsi {isEditing && <span className="text-red-500">*</span>}</label>
            {isDisabled ? (
              <input type="text" value={(formData[provKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
            ) : (
              <SearchableSelect options={PROVINSI_OPTIONS} value={(formData[provKey] as string) || ""}
                onChange={(v) => update(provKey, v)} placeholder="Pilih Provinsi"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
            )}
          </div>
        </div>

        <div className="sm:w-1/2">
          <label className={labelClass}>Kode Pos {isEditing && <span className="text-red-500">*</span>}</label>
          <input type="text" value={(formData[posKey] as string) || ""}
            onChange={(e) => update(posKey, e.target.value)}
            className={inputNoIconClass + disabledStyle} placeholder="60111" maxLength={5}
            pattern="[0-9]{5}" title="Kode Pos harus 5 digit angka"
            required={isEditing} disabled={isDisabled} />
        </div>
      </div>
    );
  };

  // ── Render (Modal) ──────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(5px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl overflow-hidden"
          >

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-white/40 bg-white/40 gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/50 backdrop-blur-md border border-white/60 shadow-sm rounded-full">
                <User className="w-7 h-7 text-red-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Profil Pengguna</h1>
                <p className="text-gray-600 text-xs">Informasi data diri Anda</p>
              </div>
            </div>
            <motion.div layout className="flex items-center gap-3 w-full sm:w-auto">
              <motion.button layout type="button" onClick={handleToggleEdit}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isEditing
                  ? 'bg-gray-100/80 text-gray-600 hover:bg-gray-200 border-gray-200/50 backdrop-blur-sm'
                  : 'bg-red-600/90 text-white hover:bg-red-700 border-red-500/50 backdrop-blur-sm shadow-red-600/20 hover:scale-[1.02]'}`}>
                {isEditing ? "Batal Edit" : "Edit Profil"}
              </motion.button>
              
              <AnimatePresence mode="popLayout">
                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.5, y: 20, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    type="submit" form="profile-form"
                    className="w-full sm:w-auto px-5 py-2 bg-green-600/90 backdrop-blur-sm shadow-md shadow-green-600/20 border border-green-500/50 text-white rounded-xl text-sm font-bold hover:bg-green-700 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                  >
                    Simpan
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button layout onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-200/50 hover:text-red-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-8 pb-4" noValidate>

              {/* Data Diri */}
              <div>
                <h2 className="text-base font-semibold text-red-700 border-b border-red-100 pb-2 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Data Diri
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>NIK (Tidak dapat diubah)</label>
                      <div className="relative">
                        <div className={iconWrap}><User className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" value={formData.nik}
                          className={inputClass + (isEditing ? " opacity-50 cursor-not-allowed bg-white/40" : "")} disabled />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Nama Lengkap (Tidak dapat diubah)</label>
                      <div className="relative">
                        <div className={iconWrap}><User className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" value={formData.fullName}
                          className={inputClass + (isEditing ? " opacity-50 cursor-not-allowed bg-white/40" : "")} disabled />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tempat Lahir {isEditing && <span className="text-red-500">*</span>}</label>
                      {!isEditing ? (
                        <input type="text" value={formData.tempatLahir} className={inputNoIconClass} disabled />
                      ) : (
                        <SearchableSelect options={KOTA_KABUPATEN_INDONESIA} value={formData.tempatLahir}
                          onChange={(v) => update("tempatLahir", v)} placeholder="Pilih kota/kabupaten"
                          icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Tanggal Lahir {isEditing && <span className="text-red-500">*</span>}</label>
                      <div className="relative cursor-pointer" onClick={() => {
                        if (!isEditing) return;
                        try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.focus(); }
                      }}>
                        <div className={iconWrap}><Calendar className="h-5 w-5 text-gray-400" /></div>
                        <input ref={dateInputRef} type="date" value={formData.tanggalLahir}
                          onChange={(e) => update("tanggalLahir", e.target.value)}
                          className={inputClass + (isEditing ? " cursor-pointer" : "")}
                          max={new Date().toISOString().split("T")[0]}
                          required={isEditing} disabled={!isEditing} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nomor Telepon {isEditing && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <div className={iconWrap}><Phone className="h-5 w-5 text-gray-400" /></div>
                        <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)}
                          className={inputClass} placeholder="08xxxxxxxxxx" required={isEditing} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Jenis Kelamin {isEditing && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <div className={iconWrap}><Users className="h-5 w-5 text-gray-400" /></div>
                        <select value={formData.jenisKelamin} onChange={(e) => update("jenisKelamin", e.target.value)}
                          className={selectClass} required={isEditing} disabled={!isEditing}>
                          <option value="">Pilih</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alamat KTP */}
              <div>
                <h2 className="text-base font-semibold text-red-700 border-b border-red-100 pb-2 mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4" /> Alamat Sesuai KTP
                </h2>
                {renderAddressFields("Ktp", false)}
              </div>

              {/* Alamat Domisili */}
              <div>
                <div className="flex items-center justify-between border-b border-red-100 pb-2 mb-4">
                  <h2 className="text-base font-semibold text-red-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Alamat Domisili
                  </h2>
                  <label className={`flex items-center gap-2 select-none ${!isEditing ? 'cursor-default opacity-80' : 'cursor-pointer'}`}>
                    <input type="checkbox" checked={domisiliSama} disabled={!isEditing}
                      onChange={(e) => handleDomisiliToggle(e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 bg-white disabled:opacity-70 disabled:cursor-not-allowed" />
                    <span className="text-xs text-gray-600 font-medium">Sama dengan alamat KTP</span>
                  </label>
                </div>
                {renderAddressFields("Domisili", domisiliSama)}
              </div>

              {/* Informasi Tambahan */}
              <div>
                <h2 className="text-base font-semibold text-red-700 border-b border-red-100 pb-2 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Informasi Tambahan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Pendidikan Terakhir {isEditing && <span className="text-red-500">*</span>}</label>
                    {!isEditing ? (
                      <input type="text" value={formData.pendidikan} className={inputNoIconClass} disabled />
                    ) : (
                      <SearchableSelect options={PENDIDIKAN_OPTIONS} value={formData.pendidikan}
                        onChange={(v) => update("pendidikan", v)} placeholder="Pilih Pendidikan"
                        icon={<BookOpen className="h-5 w-5 text-gray-400" />} required />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Agama {isEditing && <span className="text-red-500">*</span>}</label>
                    {!isEditing ? (
                      <input type="text" value={formData.agama} className={inputNoIconClass} disabled />
                    ) : (
                      <SearchableSelect options={AGAMA_OPTIONS} value={formData.agama}
                        onChange={(v) => update("agama", v)} placeholder="Pilih Agama"
                        icon={<Heart className="h-5 w-5 text-gray-400" />} required />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Suku {isEditing && <span className="text-red-500">*</span>}</label>
                    {!isEditing ? (
                      <input type="text" value={formData.suku} className={inputNoIconClass} disabled />
                    ) : (
                      <SearchableSelect options={SUKU_OPTIONS} value={formData.suku}
                        onChange={(v) => update("suku", v)} placeholder="Pilih Suku"
                        icon={<Users className="h-5 w-5 text-gray-400" />} required />
                    )}
                  </div>
                </div>
              </div>

              {/* Bidang Usaha */}
              <div>
                <h2 className="text-base font-semibold text-red-700 border-b border-red-100 pb-2 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Bidang Usaha
                </h2>
                <div className="mb-4">
                  <label className={labelClass}>Apakah Anda memiliki bidang usaha? {isEditing && <span className="text-red-500">*</span>}</label>
                  <div className="flex items-center gap-6 pt-1">
                    {["ya", "tidak"].map((v) => (
                      <label key={v} className={`flex items-center gap-2 group ${!isEditing ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}>
                        <input type="radio" name="punyaUsahaProfile" value={v}
                          checked={formData.punyaUsaha === v} disabled={!isEditing}
                          onChange={() => {
                            if (v === "tidak") {
                              setFormData((prev) => ({
                                ...prev, punyaUsaha: "tidak",
                                bidangUsaha: "", penghasilanPerHari: "", lamaBerusaha: "", gantiUsaha: "", bidangUsahaLainnya: "",
                              }));
                            } else { update("punyaUsaha", v); }
                          }}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 disabled:opacity-70 bg-white" />
                        <span className="text-sm text-gray-700">{v === "ya" ? "Ya, saya punya" : "Tidak"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.punyaUsaha === "ya" && (
                  <div className="space-y-4 bg-red-50/50 rounded-xl p-5 border border-red-100">
                    <div>
                      <label className={labelClass}>Bidang Usaha <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BIDANG_USAHA_OPTIONS.map((opt) => (
                          <label key={opt}
                            className={`flex flex-col items-center justify-center text-center p-3 rounded-xl border-2 transition-all text-sm ${formData.bidangUsaha === opt
                              ? (isEditing ? "border-red-500 bg-red-50 text-red-700 shadow-sm font-semibold" : "border-red-400/50 bg-white/40 text-red-700 shadow-sm font-semibold")
                              : (isEditing ? "border-white/50 bg-white hover:border-red-300 text-gray-600 cursor-pointer" : "border-transparent bg-white/20 text-gray-500 cursor-default")
                            }`}>
                            <input type="radio" name="bidangUsahaProfile" value={opt}
                              checked={formData.bidangUsaha === opt} disabled={!isEditing}
                              onChange={(e) => update("bidangUsaha", e.target.value)} className="sr-only" />
                            <span className="font-medium">{opt}</span>
                            <span className="text-[11px] text-gray-400 mt-0.5 leading-tight">{BIDANG_USAHA_DESKRIPSI[opt]}</span>
                          </label>
                        ))}
                      </div>
                      {formData.bidangUsaha === "Lainnya" && (
                        <div className="mt-3">
                          <label className={labelClass}>Sebutkan bidang usaha Anda {isEditing && <span className="text-red-500">*</span>}</label>
                          <input type="text" value={formData.bidangUsahaLainnya || ""}
                            onChange={(e) => update("bidangUsahaLainnya", e.target.value)}
                            className={inputNoIconClass} placeholder="Contoh: Fotografi, Percetakan, dll"
                            required={isEditing} disabled={!isEditing} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Penghasilan Bersih / Hari {isEditing && <span className="text-red-500">*</span>}</label>
                      {!isEditing ? (
                        <input type="text" value={formData.penghasilanPerHari} className={inputNoIconClass} disabled />
                      ) : (
                        <SearchableSelect options={PENGHASILAN_OPTIONS} value={formData.penghasilanPerHari}
                          onChange={(v) => update("penghasilanPerHari", v)} placeholder="Pilih rentang penghasilan"
                          showSearch={false} required />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Lama Berusaha {isEditing && <span className="text-red-500">*</span>}</label>
                        {!isEditing ? (
                          <input type="text" value={formData.lamaBerusaha} className={inputNoIconClass} disabled />
                        ) : (
                          <SearchableSelect options={LAMA_BERUSAHA_OPTIONS} value={formData.lamaBerusaha}
                            onChange={(v) => update("lamaBerusaha", v)} placeholder="Pilih" showSearch={false} required />
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>Berapa Kali Ganti Usaha {isEditing && <span className="text-red-500">*</span>}</label>
                        {!isEditing ? (
                          <input type="text" value={formData.gantiUsaha} className={inputNoIconClass} disabled />
                        ) : (
                          <SearchableSelect options={GANTI_USAHA_OPTIONS} value={formData.gantiUsaha}
                            onChange={(v) => update("gantiUsaha", v)} placeholder="Pilih" showSearch={false} required />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>

      {/* Success Alert */}
      <AnimatePresence>
        {showSuccess && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm transition-all duration-500 ${isExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'opacity-100'}`}>
            <div className="backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-green-500/20">
              <div className="p-2 rounded-xl bg-green-500/30 border border-white/30 flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-100" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Profil Diperbarui!</h3>
                <p className="text-white/80 text-xs font-medium">Data diri Anda berhasil disimpan.</p>
              </div>
              <button type="button" onClick={() => setIsExiting(true)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {validationError && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm transition-all duration-500 ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'opacity-100'}`}>
          <div className="backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-red-500/20">
            <div className="p-2 rounded-xl bg-red-500/30 border border-white/30 flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-100" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm mb-1">Validasi Gagal!</h3>
              <p className="text-white/80 text-xs font-medium">{validationError}</p>
            </div>
            <button type="button" onClick={() => setIsAlertExiting(true)} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
