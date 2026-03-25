import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, User, Home, BookOpen, Briefcase, Edit3, X, CheckCircle, Save } from "lucide-react";
import { findUserByNIK } from "../../../../services/StorageService";
import { MOCK_DISPENDUK_DB } from "../../../../data/dispendukcapil";
import { HARDCODED_USERS } from "../../../../data/hardcodedData";

// Capitalize each word
function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function InfoRow({ label, value, emptyLabel = "-" }: { label: string; value?: string; emptyLabel?: string }) {
  const display = value?.trim() ? value.trim() : emptyLabel;
  const isEmpty = display === emptyLabel && !value?.trim();
  return (
    <div className={`flex justify-between items-center py-3 border-b last:border-0 ${"border-gray-200"}`}>
      <span className={`text-sm ${"text-gray-500"}`}>{label}</span>
      <span className={`font-medium text-sm text-right max-w-[60%] ${isEmpty ? "text-orange-400 italic text-xs" : "text-gray-900"}`}>{display}</span>
    </div>
  );
}

export default function RespondentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role") || "";

  // Priority 1: localStorage (handles registered/updated users)
  const storageUser = findUserByNIK(id || "");
  // Priority 2: Hardcoded Excel GAKIN data — guaranteed, no localStorage dependency
  const hardcodedUser = !storageUser ? HARDCODED_USERS.find(u => u.nik === id) : null;
  // Priority 3: Mock Dispendukcapil Non-GAKIN
  const dispendukUser = !storageUser && !hardcodedUser ? MOCK_DISPENDUK_DB.find(d => d.nik === id) : null;

  const rawRespondent = storageUser
    ? { ...storageUser, type: (storageUser.gakinStatus || "GAKIN") as string }
    : hardcodedUser
      ? { ...hardcodedUser, type: (hardcodedUser.gakinStatus || "GAKIN") as string }
      : dispendukUser
      ? {
          nik: dispendukUser.nik,
          fullName: dispendukUser.fullName,
          jenisKelamin: dispendukUser.jenisKelamin,
          tempatLahir: dispendukUser.tempatLahir,
          tanggalLahir: dispendukUser.tanggalLahir,
          phone: "-",
          alamatKtp: dispendukUser.alamatKtp,
          rtKtp: dispendukUser.rtKtp,
          rwKtp: dispendukUser.rwKtp,
          kelurahanKtp: dispendukUser.kelurahanKtp,
          kecamatanKtp: dispendukUser.kecamatanKtp,
          kotaKtp: dispendukUser.kotaKtp,
          provinsiKtp: dispendukUser.provinsiKtp,
          kodePosKtp: dispendukUser.kodePosKtp,
          pendidikan: "-", agama: "-", suku: "-",
          punyaUsaha: "tidak", bidangUsaha: "", penghasilanPerHari: "",
          lamaBerusaha: "", gantiUsaha: "", type: "Non-GAKIN" as string,
        }
      : {
          nik: id || "",
          fullName: "Responden Tidak Dikenal",
          jenisKelamin: "-", tempatLahir: "-", tanggalLahir: "",
          phone: "-", alamatKtp: "-", rtKtp: "-", rwKtp: "-",
          kelurahanKtp: "-", kecamatanKtp: "-", kotaKtp: "-",
          provinsiKtp: "-", kodePosKtp: "-",
          pendidikan: "-", agama: "-", suku: "-",
          punyaUsaha: "tidak", bidangUsaha: "", penghasilanPerHari: "",
          lamaBerusaha: "", gantiUsaha: "", type: "GAKIN" as string,
        };

  // Apply title case to name
  const respondent = { ...rawRespondent, fullName: toTitleCase(rawRespondent.fullName) };

  const calcAge = (): string | number => {
    if (!respondent.tanggalLahir) return "-";
    const birth = new Date(respondent.tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const usia = calcAge();

  const [showEditModal, setShowEditModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isAlertExiting, setIsAlertExiting] = useState(false);

  const initials = respondent.fullName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join("");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditModal(false);

    setShowSuccessAlert(true);
    setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowSuccessAlert(false); setIsAlertExiting(false); }, 4000);
  };

  const closeModal = () => setShowEditModal(false);

  // ── THEME CLASSES ──
  const textPrimary   = "text-gray-900";
  const textSecondary = "text-gray-600";
  const bgCard        = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const borderCol     = "border-gray-300";
  const inputBg       = "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 hover:border-gray-400";
  const glowLight     = "bg-blue-600/5";

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500/50 outline-none shadow-inner transition-all ${inputBg}`;
  const selectClass = `${inputClass} appearance-none`;

  return (
    <AdminLayout title={`Profil Responden`} headerIcon={<User className="w-4 h-4" />}>
      
      {/* ── SUCCESS ALERT ── */}
      {showSuccessAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ease-in-out ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'animate-bounce-in opacity-100 translate-y-0 blur-none scale-100'}`}>
          <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
            <div className={`p-2 rounded-xl backdrop-blur-md border shadow-inner flex-shrink-0 ${"bg-emerald-100 border-emerald-200"}`}>
              <CheckCircle className={`w-6 h-6 ${"text-emerald-600"}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm mb-1">Berhasil</h3>
              <p className={`text-xs font-medium leading-relaxed ${"text-emerald-900"}`}>
                Data responden berhasil diperbarui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL (Genie Effect) ── */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 perspective-[1000px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={closeModal} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: -45 }}
              transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
              className="w-full max-w-lg md:max-w-xl relative z-10 origin-center rounded-2xl overflow-hidden"
            >
              <div className={`shadow-2xl border backdrop-blur-2xl relative flex flex-col ${"bg-white/95 border-gray-200"}`} style={{ maxHeight: "85vh" }}>
                <div className={`absolute -top-24 -right-24 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />

                <div className={`flex items-center justify-between p-6 pb-4 relative z-10 border-b shrink-0 ${borderCol}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
                      <Edit3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${textPrimary}`}>Edit Data Responden</h2>
                      <p className={`text-xs ${textSecondary}`}>{respondent.fullName} — {respondent.nik}</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className={`${textSecondary} hover:${textPrimary} transition-colors`}><X className="w-5 h-5" /></button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar" style={{ maxHeight: "calc(85vh - 140px)" }}>
                  <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6 relative z-10">
                    
                    <div>
                      <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Data Diri</h3>
                      <div className="space-y-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>NIK</label><input type="text" defaultValue={respondent.nik} className={inputClass} maxLength={16} /></div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Nama Lengkap</label><input type="text" defaultValue={respondent.fullName} className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Jenis Kelamin</label>
                            <select defaultValue={respondent.jenisKelamin} className={selectClass}>
                              <option value="Laki-laki" className={"bg-white"}>Laki-laki</option>
                              <option value="Perempuan" className={"bg-white"}>Perempuan</option>
                            </select>
                          </div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>No. Telepon</label><input type="tel" defaultValue={respondent.phone} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Tempat Lahir</label><input type="text" defaultValue={respondent.tempatLahir} className={inputClass} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Tanggal Lahir</label><input type="date" defaultValue={respondent.tanggalLahir} className={inputClass} /></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Home className="w-3.5 h-3.5" /> Alamat KTP</h3>
                      <div className="space-y-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Alamat Lengkap</label><input type="text" defaultValue={respondent.alamatKtp} className={inputClass} /></div>
                        <div className="grid grid-cols-4 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>RT</label><input type="text" defaultValue={respondent.rtKtp} className={inputClass} maxLength={3} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>RW</label><input type="text" defaultValue={respondent.rwKtp} className={inputClass} maxLength={3} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kecamatan</label><input type="text" defaultValue={respondent.kecamatanKtp} className={inputClass} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kelurahan</label><input type="text" defaultValue={respondent.kelurahanKtp} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kota/Kab</label><input type="text" defaultValue={respondent.kotaKtp} className={inputClass} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Provinsi</label><input type="text" defaultValue={respondent.provinsiKtp} className={inputClass} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kode Pos</label><input type="text" defaultValue={respondent.kodePosKtp} className={inputClass} maxLength={5} /></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Informasi Tambahan</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Pendidikan</label>
                          <select defaultValue={respondent.pendidikan} className={selectClass}>
                            {["SD", "SMP", "SMA / SMK", "D3", "S1", "S2", "S3"].map(v => <option key={v} value={v} className={"bg-white"}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Agama</label>
                          <select defaultValue={respondent.agama} className={selectClass}>
                            {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map(v => <option key={v} value={v} className={"bg-white"}>{v}</option>)}
                          </select>
                        </div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Suku</label><input type="text" defaultValue={respondent.suku} className={inputClass} /></div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Bidang Usaha</h3>
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Bidang Usaha</label>
                          <select defaultValue={respondent.bidangUsaha || ""} className={selectClass}>
                            <option value="" className={"bg-white"}>Tidak Punya</option>
                            {["Makanan/Minuman", "Perdagangan Kecil", "Jasa", "Tukang/Teknik", "Lainnya"].map(v => <option key={v} value={v} className={"bg-white"}>{v}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Penghasilan/Hari</label>
                            <select defaultValue={respondent.penghasilanPerHari || ""} className={selectClass}>
                              <option value="" className={"bg-white"}>Pilih</option>
                              {["< 100.000", "100.000 - 250.000", "251.000 - 500.000", "501.000 - 1.000.000", "> 1.000.000"].map(v => <option key={v} value={v} className={"bg-white"}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Lama Berusaha</label>
                            <select defaultValue={respondent.lamaBerusaha || ""} className={selectClass}>
                              <option value="" className={"bg-white"}>Pilih</option>
                              {["< 1 tahun", "1-2 tahun", "3-5 tahun", "> 5 tahun"].map(v => <option key={v} value={v} className={"bg-white"}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Ganti Usaha</label>
                            <select defaultValue={respondent.gantiUsaha || ""} className={selectClass}>
                              <option value="" className={"bg-white"}>Pilih</option>
                              {["0", "1-2 kali", "3-4 kali", "> 4 kali"].map(v => <option key={v} value={v} className={"bg-white"}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                  </form>
                </div>

                <div className={`px-6 py-4 border-t shrink-0 relative z-10 ${borderCol}`}>
                  <button type="submit" form="editForm" className={`w-full py-2.5 text-sm font-bold rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 ${"bg-gray-900 hover:bg-black text-white shadow-gray-400/20"}`}>
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
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
              <span className={`text-xs shadow-sm px-3 py-1 rounded-lg border font-medium ${"bg-gray-50 border-gray-300 text-gray-700"}`}>
                {respondent.jenisKelamin || "-"} · {usia} tahun
              </span>
            </div>
          </div>
          {userRole !== "kepala_brida" && (
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                setShowEditModal(true);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 shadow-sm border text-sm font-semibold rounded-xl shrink-0 transition-all ${"bg-gray-900 border-gray-800 text-white hover:bg-black"}`}
            >
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


        {/* Card 4: Informasi Tambahan */}
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

        {/* Card 5: Bidang Usaha */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 lg:col-span-2 ${bgCard}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Briefcase className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>Bidang Usaha</h3>
              <p className={`text-xs ${textSecondary}`}>Informasi kewirausahaan responden</p>
            </div>
          </div>
          {respondent.punyaUsaha === "ya" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`backdrop-blur-sm rounded-xl p-4 border ${"bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs mb-1 ${textSecondary}`}>Bidang Usaha</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>{respondent.bidangUsaha}</p>
              </div>
              <div className={`backdrop-blur-sm rounded-xl p-4 border ${"bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs mb-1 ${textSecondary}`}>Penghasilan / Hari</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>Rp {respondent.penghasilanPerHari}</p>
              </div>
              <div className={`backdrop-blur-sm rounded-xl p-4 border ${"bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs mb-1 ${textSecondary}`}>Lama Berusaha</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>{respondent.lamaBerusaha}</p>
              </div>
              <div className={`backdrop-blur-sm rounded-xl p-4 border ${"bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs mb-1 ${textSecondary}`}>Ganti Usaha</p>
                <p className={`font-semibold text-sm ${textPrimary}`}>{respondent.gantiUsaha}</p>
              </div>
            </div>
          ) : (
            <div className={`backdrop-blur-sm rounded-xl p-6 border flex items-center justify-center ${"bg-gray-50 border-gray-200"}`}>
              <div className="text-center">
                <Briefcase className={`w-8 h-8 mx-auto mb-2 ${"text-gray-400"}`} />
                <p className={`text-sm font-medium ${textSecondary}`}>Responden tidak memiliki bidang usaha</p>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </AdminLayout>
  );
}
