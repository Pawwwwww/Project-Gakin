import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User, Phone, BookOpen, Heart, Users, Calendar, MapPin, Home, Briefcase, Loader2, CheckCircle2, ChevronLeft
} from "lucide-react";
import { SearchableSelect } from "../../../components/shared/SearchableSelect";
import { KOTA_KABUPATEN_INDONESIA } from "../../../data/indonesiaData";
import { AGAMA_OPTIONS, PENDIDIKAN_OPTIONS, SUKU_OPTIONS } from "../../../entities/common";
import { saveUser, findUserByNIK } from "../../../services/StorageService";
import type { UserRecord } from "../../../services/StorageService";
import { fetchDispendukData } from "../../../data/dispendukcapil";
import { checkDinsosData } from "../../../data/dinsos";

// ── Components ────────────────────────────────────────────────────────
import { AuthBackground }        from "../components/AuthBackground";
import { AuthFormAlert }         from "../components/AuthFormAlert";
import { RegisterSuccessModal }  from "../components/register/RegisterSuccessModal";
import { RegisterAddressFields } from "../components/register/RegisterAddressFields";
import { RegisterBidangUsaha }   from "../components/register/RegisterBidangUsaha";

// ── Shared Styles ────────────────────────────────────────────────────
const inputClass    = "block w-full pl-10 pr-3 py-3 border border-white/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-gray-400";
const labelClass    = "block text-sm font-medium text-gray-700 mb-1.5";
const iconWrap      = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";
const sectionTitle  = "text-base font-semibold text-blue-700 border-b border-blue-100 pb-2 mb-4 flex items-center gap-2";

// ── Page ─────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    nik: "", fullName: "", jenisKelamin: "", tempatLahir: "", tanggalLahir: "", phone: "",
    alamatKtp: "", rtKtp: "", rwKtp: "", kelurahanKtp: "", kecamatanKtp: "",
    kotaKtp: "", provinsiKtp: "", kodePosKtp: "",
    isSurabaya: false,
    pendidikan: "", agama: "", suku: "",
    punyaUsaha: "", bidangUsaha: "", penghasilanPerHari: "",
    lamaBerusaha: "", gantiUsaha: "", bidangUsahaLainnya: "",
  };

  const [formData, setFormData] = useState({ ...emptyForm });

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setIsNikValid(false);
    setIsSurabayaFlow(null);
  };

  const [isSurabayaFlow, setIsSurabayaFlow]   = useState<boolean | null>(null);
  const [isNikValid, setIsNikValid]           = useState(false);
  const [isLocatingData, setIsLocatingData]   = useState(false);
  
  const [showSuccess, setShowSuccess]         = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert]       = useState<string | null>(null);
  const [isAlertExiting, setIsAlertExiting]   = useState(false);

  // Auto-hide error alert
  useEffect(() => {
    if (validationError || successAlert) {
      setIsAlertExiting(false);
      const timerHide   = setTimeout(() => setIsAlertExiting(true), 3500);
      const timerRemove = setTimeout(() => { setValidationError(null); setSuccessAlert(null); setIsAlertExiting(false); }, 4000);
      return () => { clearTimeout(timerHide); clearTimeout(timerRemove); };
    }
  }, [validationError, successAlert]);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const showError = (msg: string) => { setValidationError(msg); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleCheckNIK = async () => {
    if (!formData.nik) return showError("Harap isi NIK terlebih dahulu");
    if (!/^\d+$/.test(formData.nik)) return showError("NIK wajib berisi angka saja");
    if (formData.nik.length !== 16) return showError("NIK wajib 16 digit angka");
    
    if (findUserByNIK(formData.nik)) return showError("NIK yang Anda masukkan sudah terdaftar di sistem kami.");

    setIsLocatingData(true);
    const dinsosData = await checkDinsosData(formData.nik);
    if (dinsosData) {
      setIsLocatingData(false);
      return showError("NIK Anda terdaftar sebagai GAKIN di Dinas Sosial. Silakan langsung Login dengan NIK Anda.");
    }

    const data = await fetchDispendukData(formData.nik);
    setIsLocatingData(false);

    if (!data) return showError("NIK tidak ditemukan. Silakan mendaftar terlebih dahulu.");

    setFormData(prev => ({
      ...prev,
      fullName: data.fullName,
      tempatLahir: data.tempatLahir,
      tanggalLahir: data.tanggalLahir,
      jenisKelamin: data.jenisKelamin,
      alamatKtp: data.alamatKtp,
      rtKtp: data.rtKtp,
      rwKtp: data.rwKtp,
      kelurahanKtp: data.kelurahanKtp,
      kecamatanKtp: data.kecamatanKtp,
      kotaKtp: data.kotaKtp,
      provinsiKtp: data.provinsiKtp,
      kodePosKtp: data.kodePosKtp,
      isSurabaya: true
    }));
    setIsNikValid(true);
    setValidationError(null);
    setSuccessAlert("Telah diisi otomatis berdasarkan NIK Anda.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = (msg: string) => { setValidationError(msg); window.scrollTo({ top: 0, behavior: "smooth" }); };

    if (!formData.nik)                          return err("Harap isi NIK!");
    if (!/^\d+$/.test(formData.nik))            return err("NIK wajib berisi angka saja!");
    if (formData.nik.length !== 16)             return err("NIK wajib 16 digit angka!");
    
    if (isSurabayaFlow && !isNikValid)          return err("NIK Yang Anda Masukkan tidak terdaftar");

    if (!formData.fullName.trim())              return err("Harap isi Nama Lengkap!");
    if (!formData.tempatLahir)                  return err("Harap pilih Tempat Lahir!");
    if (!formData.tanggalLahir)                 return err("Harap isi Tanggal Lahir!");
    if (!formData.jenisKelamin)                 return err("Harap pilih Jenis Kelamin!");
    if (!formData.phone.trim())                 return err("Harap isi Nomor Telepon!");
    if (!/^\d{10,}$/.test(formData.phone))      return err("Nomor Telepon minimal 10 digit angka!");
    if (!formData.alamatKtp.trim())             return err("Harap isi Alamat Lengkap (KTP)!");
    if (!formData.rtKtp.trim())                 return err("Harap isi RT (KTP)!");
    if (!/^\d{1,3}$/.test(formData.rtKtp))      return err("RT KTP maksimal 3 digit angka!");
    if (!formData.rwKtp.trim())                 return err("Harap isi RW (KTP)!");
    if (!/^\d{1,3}$/.test(formData.rwKtp))      return err("RW KTP maksimal 3 digit angka!");
    if (!formData.kelurahanKtp)                 return err("Harap pilih Kelurahan (Alamat KTP)!");
    if (!formData.kecamatanKtp)                 return err("Harap pilih Kecamatan (Alamat KTP)!");
    if (!formData.kotaKtp)                      return err("Harap pilih Kota / Kabupaten (Alamat KTP)!");
    if (!formData.provinsiKtp)                  return err("Harap pilih Provinsi (Alamat KTP)!");
    if (!formData.kodePosKtp.trim())            return err("Harap isi Kode Pos (KTP)!");
    if (!/^\d{1,5}$/.test(formData.kodePosKtp)) return err("Kode Pos KTP maksimal 5 digit angka!");

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

    // Final safety check against Dinas Sosial (blocks GAKIN trying to bypass via Luar Surabaya)
    const dinsosData = await checkDinsosData(formData.nik);
    if (dinsosData) {
      return err("NIK Anda telah terdaftar otomatis oleh Dinas Sosial. Silakan langsung Login.");
    }

    const newUser: UserRecord = { ...formData, isSurabaya: isSurabayaFlow === true, gakinStatus: "Non-GAKIN" };
    saveUser(newUser);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 py-10 relative overflow-y-auto">

      <AuthBackground />

      <div className="w-full max-w-2xl animate-fadeIn relative z-10">
        <div className="rounded-2xl shadow-2xl p-8 border border-white/40 bg-white/30 backdrop-blur-xl">

          {/* ── Header ── */}
          <div className="text-center mb-8 relative">
            {isSurabayaFlow !== null && (
               <button type="button" onClick={resetForm}
                 className="absolute left-0 top-0 p-2 text-gray-500 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100/50 rounded-full transition-colors"
                 title="Kembali ke Pilihan Jalur">
                 <ChevronLeft className="w-5 h-5" />
               </button>
            )}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 backdrop-blur-md border border-white/60 rounded-full mb-4 shadow-lg">
              <User className="w-8 h-8 text-blue-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrasi Akun</h1>
            <p className="text-gray-600">Lengkapi data diri Anda untuk mendaftar</p>
          </div>

          {isSurabayaFlow === null ? (
            <div className="space-y-6">
              <h3 className="text-center text-lg font-medium text-gray-800 mb-2">Silakan pilih jalur pendaftaran Anda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" onClick={() => setIsSurabayaFlow(true)}
                  className="flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-md border-2 border-white/60 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 transition-all group">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-900">Warga Surabaya</span>
                  <span className="text-xs text-center text-gray-600 mt-2">Memiliki KTP Surabaya</span>
                </button>
                <button type="button" onClick={() => { setIsSurabayaFlow(false); setIsNikValid(true); }}
                  className="flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-md border-2 border-white/60 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 transition-all group">
                  <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-900">Luar Surabaya</span>
                  <span className="text-xs text-center text-gray-600 mt-2">Bukan KTP Surabaya</span>
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn" noValidate>

            {/* ── Data Diri ── */}
            <div>
              <h2 className={sectionTitle}><User className="w-4 h-4" /> Data Diri</h2>
              <div className="space-y-4">

                {/* NIK */}
                <div>
                  <label className={labelClass}>NIK (Nomor Induk Kependudukan) <span className="text-blue-500">*</span></label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <div className={iconWrap}><User className="h-5 w-5 text-gray-400" /></div>
                      <input type="text" value={formData.nik} onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 16) {
                            update("nik", val);
                            if (isSurabayaFlow) setIsNikValid(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (isSurabayaFlow && !isNikValid) handleCheckNIK();
                          }
                        }}
                        className={inputClass + (isSurabayaFlow && isNikValid ? " bg-slate-50/70 text-gray-500 font-semibold cursor-not-allowed" : "")} 
                        placeholder="Masukkan NIK (16 digit)" required maxLength={16}
                        pattern="[0-9]{16}" title="NIK harus 16 digit angka" disabled={isSurabayaFlow && isNikValid} />
                    </div>
                    {isSurabayaFlow && !isNikValid && (
                      <button type="button" onClick={handleCheckNIK} disabled={isLocatingData}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-70">
                        {isLocatingData ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cek NIK"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Show the rest only if Not Surabaya Flow OR if NIK is valid */}
                {(!isSurabayaFlow || isNikValid) && (
                  <>
                    {/* Nama Lengkap */}
                <div>
                  <label className={labelClass}>Nama Lengkap <span className="text-blue-500">*</span></label>
                  <div className="relative">
                    <div className={iconWrap}><User className="h-5 w-5 text-gray-400" /></div>
                    <input type="text" value={formData.fullName} onChange={(e) => update("fullName", e.target.value)}
                      className={inputClass + (isSurabayaFlow ? " bg-slate-50/70 text-gray-500 cursor-not-allowed" : "")} 
                      placeholder="Masukkan Nama Lengkap" required disabled={isSurabayaFlow} />
                  </div>
                </div>

                {/* Tempat & Tanggal Lahir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tempat Lahir <span className="text-blue-500">*</span></label>
                    {isSurabayaFlow ? (
                      <input type="text" value={formData.tempatLahir} className={inputClass + " bg-slate-50/70 text-gray-500 cursor-not-allowed pl-4"} disabled />
                    ) : (
                      <SearchableSelect options={KOTA_KABUPATEN_INDONESIA} value={formData.tempatLahir}
                        onChange={(v) => update("tempatLahir", v)} placeholder="Pilih kota/kabupaten"
                        icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Tanggal Lahir <span className="text-blue-500">*</span></label>
                    <div className={`relative ${isSurabayaFlow ? '' : 'cursor-pointer'}`} onClick={() => {
                      if (isSurabayaFlow) return;
                      try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.focus(); }
                    }}>
                      <div className={iconWrap}><Calendar className="h-5 w-5 text-gray-400" /></div>
                      <input ref={dateInputRef} type="date" value={formData.tanggalLahir}
                        onChange={(e) => update("tanggalLahir", e.target.value)}
                        className={inputClass + (isSurabayaFlow ? " bg-slate-50/70 text-gray-500 cursor-not-allowed" : " cursor-pointer")} 
                        max={new Date().toISOString().split("T")[0]} required disabled={isSurabayaFlow} />
                    </div>
                  </div>
                </div>

                {/* Nomor Telepon & Jenis Kelamin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nomor Telepon <span className="text-blue-500">*</span></label>
                    <div className="relative">
                      <div className={iconWrap}><Phone className="h-5 w-5 text-gray-400" /></div>
                      <input type="tel" value={formData.phone} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 13) update("phone", val);
                        }}
                        className={inputClass} placeholder="08xxxxxxxxxx" required minLength={10} maxLength={13} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Jenis Kelamin <span className="text-blue-500">*</span></label>
                    {isSurabayaFlow ? (
                      <input type="text" value={formData.jenisKelamin} className={inputClass + " bg-slate-50/70 text-gray-500 cursor-not-allowed pl-4"} disabled />
                    ) : (
                      <SearchableSelect
                        options={["Laki-laki", "Perempuan"]}
                        value={formData.jenisKelamin}
                        onChange={(v) => update("jenisKelamin", v)}
                        placeholder="Pilih Jenis Kelamin"
                        icon={<Users className="h-5 w-5 text-gray-400" />}
                        showSearch={false} required
                      />
                    )}
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>

            {/* Only show the rest if they selected Luar Surabaya OR if NIK checked in Surabaya flow */}
            {(!isSurabayaFlow || isNikValid) && (
              <>
                {/* ── Alamat KTP ── */}
                <div>
                  <h2 className={sectionTitle}><Home className="w-4 h-4" /> Alamat Sesuai KTP</h2>
                  <RegisterAddressFields prefix="Ktp" disabled={isSurabayaFlow} formData={formData} onChange={update} />
                </div>

                {/* Alamat Domisili Removed Entirely */}

                {/* ── Informasi Tambahan ── */}
            <div>
              <h2 className={sectionTitle}><BookOpen className="w-4 h-4" /> Informasi Tambahan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Pendidikan Terakhir <span className="text-blue-500">*</span></label>
                  <SearchableSelect options={PENDIDIKAN_OPTIONS} value={formData.pendidikan}
                    onChange={(v) => update("pendidikan", v)} placeholder="Pilih Pendidikan"
                    icon={<BookOpen className="h-5 w-5 text-gray-400" />} showSearch={false} required />
                </div>
                <div>
                  <label className={labelClass}>Agama <span className="text-blue-500">*</span></label>
                  <SearchableSelect options={AGAMA_OPTIONS} value={formData.agama}
                    onChange={(v) => update("agama", v)} placeholder="Pilih Agama"
                    icon={<Heart className="h-5 w-5 text-gray-400" />} showSearch={false} required />
                </div>
                <div>
                  <label className={labelClass}>Suku <span className="text-blue-500">*</span></label>
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
                <label className={labelClass}>Apakah Anda memiliki bidang usaha? <span className="text-blue-500">*</span></label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="punyaUsaha" value="ya"
                      checked={formData.punyaUsaha === "ya"} onChange={(e) => update("punyaUsaha", e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Ya, saya punya</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="punyaUsaha" value="tidak"
                      checked={formData.punyaUsaha === "tidak"}
                      onChange={() => setFormData((prev) => ({
                        ...prev, punyaUsaha: "tidak",
                        bidangUsaha: "", penghasilanPerHari: "", lamaBerusaha: "", gantiUsaha: "", bidangUsahaLainnya: "",
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
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
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Daftar Sekarang
                </button>
              </>
            )}
          </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?{" "}
          <button type="button" onClick={() => navigate("/")}
            className="text-blue-700 hover:text-blue-800 font-semibold underline-offset-2 hover:underline transition-colors">
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
      {successAlert && (
        <AuthFormAlert
          type="success"
          title="Data Ditemukan"
          message={successAlert}
          isExiting={isAlertExiting}
          onClose={() => setIsAlertExiting(true)}
        />
      )}
    </div>
  );
}
