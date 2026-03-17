import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User, Phone, BookOpen, Heart, Users, Calendar, MapPin, Home, Briefcase,
} from "lucide-react";
import { SearchableSelect } from "../../../components/shared/SearchableSelect";
import { KOTA_KABUPATEN_INDONESIA } from "../../../data/indonesiaData";
import { AGAMA_OPTIONS, PENDIDIKAN_OPTIONS, SUKU_OPTIONS } from "../../../entities/common";
import { saveUser, findUserByNIK } from "../../../services/StorageService";
import type { UserRecord } from "../../../services/StorageService";

// ── Components ────────────────────────────────────────────────────────
import { AuthBackground }        from "../components/AuthBackground";
import { AuthFormAlert }         from "../components/AuthFormAlert";
import { RegisterSuccessModal }  from "../components/register/RegisterSuccessModal";
import { RegisterAddressFields } from "../components/register/RegisterAddressFields";
import { RegisterBidangUsaha }   from "../components/register/RegisterBidangUsaha";

// ── Shared Styles ────────────────────────────────────────────────────
const inputClass    = "block w-full pl-10 pr-3 py-3 border border-white/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm shadow-sm placeholder:text-gray-400";
const labelClass    = "block text-sm font-medium text-gray-700 mb-1.5";
const iconWrap      = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";
const sectionTitle  = "text-base font-semibold text-red-700 border-b border-red-100 pb-2 mb-4 flex items-center gap-2";

// ── Page ─────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "", nik: "", jenisKelamin: "", tempatLahir: "", tanggalLahir: "", phone: "",
    // Alamat KTP
    alamatKtp: "", rtKtp: "", rwKtp: "", kelurahanKtp: "", kecamatanKtp: "",
    kotaKtp: "", provinsiKtp: "", kodePosKtp: "",
    // Alamat Domisili
    alamatDomisili: "", rtDomisili: "", rwDomisili: "", kelurahanDomisili: "",
    kecamatanDomisili: "", kotaDomisili: "", provinsiDomisili: "", kodePosDomisili: "",
    // Informasi Tambahan
    pendidikan: "", agama: "", suku: "",
    // Bidang Usaha
    punyaUsaha: "", bidangUsaha: "", penghasilanPerHari: "",
    lamaBerusaha: "", gantiUsaha: "", bidangUsahaLainnya: "",
  });

  const [domisiliSama, setDomisiliSama]       = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAlertExiting, setIsAlertExiting]   = useState(false);

  // Auto-hide error alert
  useEffect(() => {
    if (validationError) {
      setIsAlertExiting(false);
      const timerHide   = setTimeout(() => setIsAlertExiting(true), 3500);
      const timerRemove = setTimeout(() => { setValidationError(null); setIsAlertExiting(false); }, 4000);
      return () => { clearTimeout(timerHide); clearTimeout(timerRemove); };
    }
  }, [validationError]);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDomisiliToggle = (checked: boolean) => {
    setDomisiliSama(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        alamatDomisili: prev.alamatKtp, rtDomisili: prev.rtKtp, rwDomisili: prev.rwKtp,
        kelurahanDomisili: prev.kelurahanKtp, kecamatanDomisili: prev.kecamatanKtp,
        kotaDomisili: prev.kotaKtp, provinsiDomisili: prev.provinsiKtp,
        kodePosDomisili: prev.kodePosKtp,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = (msg: string) => { setValidationError(msg); window.scrollTo({ top: 0, behavior: "smooth" }); };

    if (!formData.nik)                          return err("Harap isi NIK!");
    if (!/^\d+$/.test(formData.nik))            return err("NIK wajib berisi angka saja!");
    if (formData.nik.length !== 16)             return err("NIK wajib 16 digit angka!");
    if (!formData.fullName.trim())              return err("Harap isi Nama Lengkap!");
    if (!formData.tempatLahir)                  return err("Harap pilih Tempat Lahir!");
    if (!formData.tanggalLahir)                 return err("Harap isi Tanggal Lahir!");
    if (!formData.jenisKelamin)                 return err("Harap pilih Jenis Kelamin!");
    if (!formData.phone.trim())                 return err("Harap isi Nomor Telepon!");
    if (!formData.alamatKtp.trim())             return err("Harap isi Alamat Lengkap (KTP)!");
    if (!formData.rtKtp.trim())                 return err("Harap isi RT (KTP)!");
    if (!formData.rwKtp.trim())                 return err("Harap isi RW (KTP)!");
    if (!formData.kelurahanKtp)                 return err("Harap pilih Kelurahan (Alamat KTP)!");
    if (!formData.kecamatanKtp)                 return err("Harap pilih Kecamatan (Alamat KTP)!");
    if (!formData.kotaKtp)                      return err("Harap pilih Kota / Kabupaten (Alamat KTP)!");
    if (!formData.provinsiKtp)                  return err("Harap pilih Provinsi (Alamat KTP)!");
    if (!formData.kodePosKtp.trim())            return err("Harap isi Kode Pos (KTP)!");
    if (!/^\d{5}$/.test(formData.kodePosKtp))  return err("Kode Pos KTP harus 5 digit angka!");

    if (!domisiliSama) {
      if (!formData.alamatDomisili.trim())           return err("Harap isi Alamat Lengkap (Domisili)!");
      if (!formData.rtDomisili.trim())               return err("Harap isi RT (Domisili)!");
      if (!formData.rwDomisili.trim())               return err("Harap isi RW (Domisili)!");
      if (!formData.kelurahanDomisili)               return err("Harap pilih Kelurahan (Alamat Domisili)!");
      if (!formData.kecamatanDomisili)               return err("Harap pilih Kecamatan (Alamat Domisili)!");
      if (!formData.kotaDomisili)                    return err("Harap pilih Kota / Kabupaten (Alamat Domisili)!");
      if (!formData.provinsiDomisili)                return err("Harap pilih Provinsi (Alamat Domisili)!");
      if (!formData.kodePosDomisili.trim())          return err("Harap isi Kode Pos (Domisili)!");
      if (!/^\d{5}$/.test(formData.kodePosDomisili)) return err("Kode Pos Domisili harus 5 digit angka!");
    }

    if (!formData.pendidikan) return err("Harap pilih Pendidikan Terakhir!");
    if (!formData.agama)      return err("Harap pilih Agama!");
    if (!formData.suku)       return err("Harap pilih Suku!");
    if (!formData.punyaUsaha) return err("Harap pilih Punya Usaha!");

    if (formData.punyaUsaha === "ya") {
      if (!formData.bidangUsaha)                                     return err("Harap pilih Bidang Usaha!");
      if (formData.bidangUsaha === "Lainnya" && !formData.bidangUsahaLainnya?.trim()) return err("Harap sebutkan bidang usaha Anda!");
      if (!formData.penghasilanPerHari)                              return err("Harap pilih Penghasilan!");
      if (!formData.lamaBerusaha)                                    return err("Harap pilih Lama Berusaha!");
      if (!formData.gantiUsaha)                                      return err("Harap pilih Berapa Kali Ganti Usaha!");
    }

    if (findUserByNIK(formData.nik)) return err("NIK yang Anda masukkan sudah terdaftar di sistem kami.");

    const newUser: UserRecord = { ...formData, domisiliSama };
    saveUser(newUser);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 p-4 py-10 relative overflow-hidden">

      <AuthBackground />

      <div className="w-full max-w-2xl animate-fadeIn relative z-10">
        <div className="rounded-2xl shadow-2xl p-8 border border-white/40 bg-white/30 backdrop-blur-xl">

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 backdrop-blur-md border border-white/60 rounded-full mb-4 shadow-lg">
              <User className="w-8 h-8 text-red-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrasi Akun</h1>
            <p className="text-gray-600">Lengkapi data diri Anda untuk mendaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* ── Data Diri ── */}
            <div>
              <h2 className={sectionTitle}><User className="w-4 h-4" /> Data Diri</h2>
              <div className="space-y-4">

                {/* NIK */}
                <div>
                  <label className={labelClass}>NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className={iconWrap}><User className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" value={formData.nik} onChange={(e) => update("nik", e.target.value)}
                      className={inputClass} placeholder="Masukkan NIK (16 digit)" required maxLength={16}
                      pattern="[0-9]{16}" title="NIK harus 16 digit angka" />
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className={iconWrap}><User className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" value={formData.fullName} onChange={(e) => update("fullName", e.target.value)}
                      className={inputClass} placeholder="Masukkan Nama Lengkap" required />
                  </div>
                </div>

                {/* Tempat & Tanggal Lahir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tempat Lahir <span className="text-red-500">*</span></label>
                    <SearchableSelect options={KOTA_KABUPATEN_INDONESIA} value={formData.tempatLahir}
                      onChange={(v) => update("tempatLahir", v)} placeholder="Pilih kota/kabupaten"
                      icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
                  </div>
                  <div>
                    <label className={labelClass}>Tanggal Lahir <span className="text-red-500">*</span></label>
                    <div className="relative cursor-pointer" onClick={() => {
                      try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.focus(); }
                    }}>
                      <div className={iconWrap}><Calendar className="h-5 w-5 text-gray-400" /></div>
                      <input ref={dateInputRef} type="date" value={formData.tanggalLahir}
                        onChange={(e) => update("tanggalLahir", e.target.value)}
                        className={inputClass + " cursor-pointer"} max={new Date().toISOString().split("T")[0]} required />
                    </div>
                  </div>
                </div>

                {/* Nomor Telepon & Jenis Kelamin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nomor Telepon <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className={iconWrap}><Phone className="h-5 w-5 text-gray-400" /></div>
                      <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)}
                        className={inputClass} placeholder="08xxxxxxxxxx" required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Jenis Kelamin <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      options={["Laki-laki", "Perempuan"]}
                      value={formData.jenisKelamin}
                      onChange={(v) => update("jenisKelamin", v)}
                      placeholder="Pilih Jenis Kelamin"
                      icon={<Users className="h-5 w-5 text-gray-400" />}
                      showSearch={false} required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Alamat KTP ── */}
            <div>
              <h2 className={sectionTitle}><Home className="w-4 h-4" /> Alamat Sesuai KTP</h2>
              <RegisterAddressFields prefix="Ktp" disabled={false} formData={formData} onChange={update} />
            </div>

            {/* ── Alamat Domisili ── */}
            <div>
              <div className="flex items-center justify-between border-b border-red-100 pb-2 mb-4">
                <h2 className={sectionTitle.replace("border-b border-red-100 pb-2 mb-4 ", "")}><MapPin className="w-4 h-4" /> Alamat Domisili</h2>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={domisiliSama}
                    onChange={(e) => handleDomisiliToggle(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="text-xs text-gray-600 font-medium">Sama dengan alamat KTP</span>
                </label>
              </div>
              <RegisterAddressFields prefix="Domisili" disabled={domisiliSama} formData={formData} onChange={update} />
            </div>

            {/* ── Informasi Tambahan ── */}
            <div>
              <h2 className={sectionTitle}><BookOpen className="w-4 h-4" /> Informasi Tambahan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Pendidikan Terakhir <span className="text-red-500">*</span></label>
                  <SearchableSelect options={PENDIDIKAN_OPTIONS} value={formData.pendidikan}
                    onChange={(v) => update("pendidikan", v)} placeholder="Pilih Pendidikan"
                    icon={<BookOpen className="h-5 w-5 text-gray-400" />} showSearch={false} required />
                </div>
                <div>
                  <label className={labelClass}>Agama <span className="text-red-500">*</span></label>
                  <SearchableSelect options={AGAMA_OPTIONS} value={formData.agama}
                    onChange={(v) => update("agama", v)} placeholder="Pilih Agama"
                    icon={<Heart className="h-5 w-5 text-gray-400" />} showSearch={false} required />
                </div>
                <div>
                  <label className={labelClass}>Suku <span className="text-red-500">*</span></label>
                  <SearchableSelect options={SUKU_OPTIONS} value={formData.suku}
                    onChange={(v) => update("suku", v)} placeholder="Pilih Suku"
                    icon={<Users className="h-5 w-5 text-gray-400" />} showSearch={false} required />
                </div>
              </div>
            </div>

            {/* ── Bidang Usaha ── */}
            <div>
              <h2 className={sectionTitle}><Briefcase className="w-4 h-4" /> Bidang Usaha</h2>
              <div className="mb-4">
                <label className={labelClass}>Apakah Anda memiliki bidang usaha? <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="punyaUsaha" value="ya"
                      checked={formData.punyaUsaha === "ya"} onChange={(e) => update("punyaUsaha", e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Ya, saya punya</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="punyaUsaha" value="tidak"
                      checked={formData.punyaUsaha === "tidak"}
                      onChange={() => setFormData((prev) => ({
                        ...prev, punyaUsaha: "tidak",
                        bidangUsaha: "", penghasilanPerHari: "", lamaBerusaha: "", gantiUsaha: "", bidangUsahaLainnya: "",
                      }))}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Tidak</span>
                  </label>
                </div>
              </div>
              {formData.punyaUsaha === "ya" && (
                <RegisterBidangUsaha
                  bidangUsaha={formData.bidangUsaha}
                  bidangUsahaLainnya={formData.bidangUsahaLainnya}
                  penghasilanPerHari={formData.penghasilanPerHari}
                  lamaBerusaha={formData.lamaBerusaha}
                  gantiUsaha={formData.gantiUsaha}
                  onChange={update}
                />
              )}
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
              Daftar Sekarang
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?{" "}
          <button type="button" onClick={() => navigate("/")}
            className="text-red-700 hover:text-red-900 font-semibold underline-offset-2 hover:underline transition-colors">
            Login di sini
          </button>
        </p>
      </div>

      {/* Overlays */}
      {showSuccess && <RegisterSuccessModal onLogin={() => navigate("/")} />}
      {validationError && (
        <AuthFormAlert
          message={validationError}
          isExiting={isAlertExiting}
          onClose={() => setIsAlertExiting(true)}
        />
      )}
    </div>
  );
}
