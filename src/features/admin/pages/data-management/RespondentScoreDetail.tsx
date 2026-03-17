import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, User, Target, Zap, Brain, Award, ClipboardX, MapPin, Home, BookOpen, Briefcase, Trash2, RotateCcw, X, CheckCircle, AlertTriangle } from "lucide-react";
import {
  findUserByNIK, getKuesionerResult,
  getAllKuesionerResults, saveUser, getUsers,
} from "../../../../services/StorageService";
import {
  calcGritScore, getGritCategory, calcKwuScore, getKwuCategory,
  calcTIPIAspects, getTIPICategoryLabel, determineKluster,
} from "../../../../services/ScoringService";
import { KLUSTER_INFO, type TIPIAspect } from "../../../../entities/respondent";

// Constants that were in respondentScoreData — now inlined here
const TIPI_CAT_COLORS: Record<string, string> = {
  "Rendah":          "bg-red-500/10 text-red-400 border border-red-500/20",
  "Dibawah Rerata":  "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  "Rerata":          "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  "Diatas Rerata":   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Tinggi":          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};
const TIPI_ASPECT_LABELS: Record<TIPIAspect, string> = {
  extraversion:      "Extraversion", agreeableness: "Agreeableness",
  conscientiousness: "Conscientiousness", neuroticism: "Neuroticism", openness: "Openness",
};
const TIPI_ASPECT_INDO: Record<TIPIAspect, string> = {
  extraversion:      "Ekstraversi", agreeableness: "Mudah Akur",
  conscientiousness: "Kehati-hatian", neuroticism: "Neurotisisme", openness: "Keterbukaan",
};

// Helper untuk hapus respondent
function deleteRespondentFromStorage(nik: string) {
  const users = getUsers().filter(u => u.nik !== nik);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.removeItem(`kuesioner_done_${nik}`);
  try {
    const all = JSON.parse(localStorage.getItem("kuesioner_results") || "[]");
    localStorage.setItem("kuesioner_results", JSON.stringify(all.filter((s: { nik: string }) => s.nik !== nik)));
  } catch { /* ignore */ }
}

// Helper untuk reset kuesioner saja
function resetRespondentKuesioner(nik: string) {
  localStorage.removeItem(`kuesioner_done_${nik}`);
  try {
    const all = JSON.parse(localStorage.getItem("kuesioner_results") || "[]");
    localStorage.setItem("kuesioner_results", JSON.stringify(all.filter((s: { nik: string }) => s.nik !== nik)));
  } catch { /* ignore */ }
}

import { useAdminTheme } from "../../hooks/AdminThemeContext";

function InfoRow({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 border-b last:border-0 ${isDark ? "border-white/10" : "border-gray-200"}`}>
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
      <span className={`font-medium text-sm text-right max-w-[60%] ${isDark ? "text-white" : "text-gray-900"}`}>{value || "-"}</span>
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 bg-black/30 border border-gray-200 rounded-lg text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none placeholder:text-gray-600 shadow-inner transition-all";
const selectClass = "w-full px-3 py-2.5 bg-black/30 border border-gray-200 rounded-lg text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none shadow-inner transition-all appearance-none";

export default function RespondentScoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();
  const nik = id || "";
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-render on data mutation
  
  const userRecord = findUserByNIK(nik);
  const kuesionerResult = getKuesionerResult(nik);
  const isUnfilled = !kuesionerResult;
  const nama = userRecord?.fullName || `Responden ${nik.slice(-4)}`;
  const type = (userRecord?.gakinStatus as "GAKIN" | "Non-GAKIN") || "Non-GAKIN";
  const initials = nama.split(" ").slice(0, 2).map((w: string) => w.charAt(0).toUpperCase()).join("");
  const r = userRecord; // shorthand

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isAlertExiting, setIsAlertExiting] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Scores
  let gritScore = 0, gritCat = getGritCategory(0);
  let kwuScore = 0, kwuCat = getKwuCategory(0);
  let tipiAspects: Record<TIPIAspect, number> = { extraversion: 0, agreeableness: 0, conscientiousness: 0, neuroticism: 0, openness: 0 };
  let tipiCats: Record<TIPIAspect, string> = { extraversion: "-", agreeableness: "-", conscientiousness: "-", neuroticism: "-", openness: "-" };
  let kluster = 0, klusterInfo = KLUSTER_INFO[1];

  if (kuesionerResult && !isUnfilled) {
    gritScore = calcGritScore(kuesionerResult.data.grit || {});
    gritCat = getGritCategory(gritScore);
    kwuScore = calcKwuScore(kuesionerResult.data.kwu || {});
    kwuCat = getKwuCategory(kwuScore);
    tipiAspects = calcTIPIAspects(kuesionerResult.data.tipi || {});
    tipiCats = (Object.keys(tipiAspects) as TIPIAspect[]).reduce((acc, a) => { acc[a] = getTIPICategoryLabel(a, tipiAspects[a]); return acc; }, {} as Record<TIPIAspect, string>);
    kluster = determineKluster(gritCat.label, kwuCat.label, tipiCats);
    klusterInfo = KLUSTER_INFO[kluster];
  }

  const formatDate = (d: string) => { if (!d) return "-"; return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); };

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg); setShowSuccessAlert(true); setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowSuccessAlert(false); setIsAlertExiting(false); }, 4000);
  };

  const handleDelete = () => { deleteRespondentFromStorage(nik); setShowDeleteModal(false); triggerAlert("Responden berhasil dihapus."); setTimeout(() => navigate("/admin/respondent-management"), 1500); };
  const handleReset = () => { resetRespondentKuesioner(nik); setRefreshKey(prev => prev + 1); setShowResetModal(false); triggerAlert("Kuesioner responden berhasil direset. Responden dapat mengisi ulang."); };

  // ── THEME CLASSES ──
  const textPrimary   = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const bgCard        = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const borderCol     = isDark ? "border-white/10" : "border-gray-300";
  const glowLight     = isDark ? "bg-red-600/10" : "bg-red-600/5";
  const btnOutline    = isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-sm";

  // Kluster gradient colors (previously from respondentScoreData.KLUSTER_INFO)
  const klusterGradient: Record<number, string> = {
    1: "from-red-600 to-red-400",
    2: "from-orange-500 to-orange-400",
    3: "from-amber-400 to-yellow-300",
    4: "from-emerald-500 to-emerald-400",
  };
  const klusterGrad = klusterGradient[kluster] || "from-gray-500 to-gray-400";

  return (
    <AdminLayout title="Detail Skor Responden" headerIcon={<User className="w-4 h-4" />}>

      {/* SUCCESS ALERT */}
      {showSuccessAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'opacity-100 translate-y-0'}`}>
          <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
            <div className={`p-2 rounded-xl border shrink-0 ${isDark ? "border-white/10 bg-emerald-500/30" : "border-emerald-200 bg-emerald-100"}`}><CheckCircle className={`w-6 h-6 ${isDark ? "text-emerald-200" : "text-emerald-600"}`} /></div>
            <div><h3 className="text-white font-bold text-sm mb-1">Berhasil</h3><p className={`text-xs ${isDark ? "text-emerald-100" : "text-emerald-900"}`}>{alertMsg}</p></div>
          </div>
        </div>
      )}

      {/* BREADCRUMB + ACTION BUTTONS */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`${textSecondary} hover:${textPrimary} transition-colors group`}>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className={`text-sm font-medium flex items-center gap-2 ${textSecondary}`}>
            <span className="hover:underline cursor-pointer" onClick={() => navigate("/admin/respondent-management")}>Responden</span>
            <span>/</span><span className={textPrimary}>Detail Skor</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isUnfilled && kuesionerResult && (
            <button onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
              <RotateCcw className="w-4 h-4" /> Reset Kuesioner
            </button>
          )}
          <button onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
            <Trash2 className="w-4 h-4" /> Hapus
          </button>
        </div>
      </motion.div>

      {/* PROFILE HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 mb-6 relative overflow-hidden ${bgCard}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-900/20 shrink-0">
            <span className="text-red-500 font-black text-2xl">{initials}</span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{nama}</h1>
            <p className={`text-sm mt-1 font-mono ${textSecondary}`}>{nik}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border backdrop-blur-sm shadow-sm ${type === "GAKIN" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{type}</span>
              {!isUnfilled && kuesionerResult && <span className={`text-xs shadow-sm px-3 py-1 rounded-lg border font-medium ${isDark ? "bg-black/40 border-white/10 text-gray-400" : "bg-white border-gray-200 text-gray-600"}`}>Cluster {kluster}</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* UNFILLED STATE */}
      {(isUnfilled || !kuesionerResult) ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl border p-12 text-center ${bgCard}`}>
          <ClipboardX className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
          <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>Belum Mengisi Kuesioner</h2>
          <p className={`text-sm max-w-md mx-auto ${textSecondary}`}>Responden ini belum mengisi kuesioner, sehingga skor baterai dan klasifikasi klaster belum tersedia.</p>
        </motion.div>
      ) : (
        <>
          {/* CLUSTER RESULT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`shadow-sm backdrop-blur-xl rounded-2xl border ${isDark ? klusterInfo.border : "border-gray-300"} p-6 mb-6 shadow-lg relative overflow-hidden ${bgCard}`}>
            <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${klusterGrad} opacity-10 blur-[60px] rounded-full pointer-events-none`} />
            <div className="flex items-start gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${klusterGrad} shadow-lg shrink-0 shadow-gray-200/50`}><Award className="w-7 h-7 text-white" /></div>
              <div className="flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>Hasil Klasifikasi</p>
                <h3 className={`text-xl font-bold ${textPrimary}`}>{klusterInfo.title} — {klusterInfo.subtitle}</h3>
                <p className={`text-sm leading-relaxed mt-2 ${textSecondary}`}>{klusterInfo.desc}</p>
              </div>
            </div>
          </motion.div>

          {/* SCORE CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* GRIT */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
              <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20"><Target className="w-5 h-5 text-red-500" /></div><div><h3 className={`font-bold ${textPrimary}`}>Skor GRIT</h3><p className={`text-xs ${textSecondary}`}>Ketekunan & Semangat</p></div></div>
              <InfoRow label="Skor Total" value={`${gritScore} / 60`} isDark={isDark} />
              <div className={`flex justify-between items-center py-3 border-b ${borderCol}`}><span className={`text-sm ${textSecondary}`}>Kategori</span><span className={`font-bold text-sm px-3 py-1 rounded-lg border shadow-sm ${gritCat.bg} ${gritCat.color} ${isDark ? "border-transparent" : "border-gray-200"}`}>{gritCat.label}</span></div>
              <p className={`text-xs leading-relaxed pt-3 ${textSecondary}`}>{gritCat.desc}</p>
            </motion.div>
            {/* KWU */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
              <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20"><Zap className="w-5 h-5 text-orange-500" /></div><div><h3 className={`font-bold ${textPrimary}`}>Skor Kewirausahaan</h3><p className={`text-xs ${textSecondary}`}>Ide, Sumber Daya & Aksi</p></div></div>
              <InfoRow label="Skor Total" value={`${kwuScore} / 60`} isDark={isDark} />
              <div className={`flex justify-between items-center py-3 border-b ${borderCol}`}><span className={`text-sm ${textSecondary}`}>Kategori</span><span className={`font-bold text-sm px-3 py-1 rounded-lg border shadow-sm ${kwuCat.bg} ${kwuCat.color} ${isDark ? "border-transparent" : "border-gray-200"}`}>{kwuCat.label}</span></div>
              <p className={`text-xs leading-relaxed pt-3 ${textSecondary}`}>{kwuCat.desc}</p>
            </motion.div>
          </div>

          {/* TIPI */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 mb-6 ${bgCard}`}>
            <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><Brain className="w-5 h-5 text-blue-500" /></div><div><h3 className={`font-bold ${textPrimary}`}>Profil Kepribadian (TIPI — Big Five)</h3><p className={`text-xs ${textSecondary}`}>Lima dimensi utama kepribadian</p></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {(Object.keys(tipiAspects) as TIPIAspect[]).map((a) => (
                <div key={a} className={`backdrop-blur-sm rounded-xl p-4 border flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-md ${isDark ? "bg-white/[0.03] border-white/10" : "bg-gray-50 border-gray-200 shadow-sm"}`}>
                  <p className={`text-xs font-bold mb-1 ${textPrimary}`}>{TIPI_ASPECT_LABELS[a]}</p>
                  <p className={`text-[10px] mb-3 ${textSecondary}`}>{TIPI_ASPECT_INDO[a]}</p>
                  <p className={`text-2xl font-black mb-1 ${textPrimary}`}>{tipiAspects[a].toFixed(1)}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border ${TIPI_CAT_COLORS[tipiCats[a]] || "text-gray-500"} ${isDark ? "border-transparent" : "border-gray-200/50"}`}>{tipiCats[a]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* DATA DIRI CARDS — always shown */}
      {r && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Data Diri */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
            <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20"><User className="w-5 h-5 text-red-400" /></div><div><h3 className={`font-bold ${textPrimary}`}>Data Diri</h3><p className={`text-xs ${textSecondary}`}>Informasi identitas</p></div></div>
            <InfoRow label="Nama Lengkap" value={r.fullName} isDark={isDark} />
            <InfoRow label="NIK" value={r.nik} isDark={isDark} />
            <InfoRow label="Jenis Kelamin" value={r.jenisKelamin} isDark={isDark} />
            <InfoRow label="Tempat Lahir" value={r.tempatLahir} isDark={isDark} />
            <InfoRow label="Tanggal Lahir" value={formatDate(r.tanggalLahir)} isDark={isDark} />
            <InfoRow label="No. Telepon" value={r.phone} isDark={isDark} />
            <InfoRow label="Pendidikan" value={r.pendidikan} isDark={isDark} />
            <InfoRow label="Agama" value={r.agama} isDark={isDark} />
            <InfoRow label="Suku" value={r.suku} isDark={isDark} />
          </motion.div>

          {/* Alamat */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
              <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20"><Home className="w-5 h-5 text-orange-400" /></div><div><h3 className={`font-bold ${textPrimary}`}>Alamat KTP</h3><p className={`text-xs ${textSecondary}`}>Berdasarkan kartu identitas</p></div></div>
              <InfoRow label="Alamat" value={r.alamatKtp} isDark={isDark} />
              <InfoRow label="RT/RW" value={`${r.rtKtp}/${r.rwKtp}`} isDark={isDark} />
              <InfoRow label="Kelurahan" value={r.kelurahanKtp} isDark={isDark} />
              <InfoRow label="Kecamatan" value={r.kecamatanKtp} isDark={isDark} />
              <InfoRow label="Kota" value={r.kotaKtp} isDark={isDark} />
              <InfoRow label="Provinsi" value={r.provinsiKtp} isDark={isDark} />
              <InfoRow label="Kode Pos" value={r.kodePosKtp} isDark={isDark} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 ${bgCard}`}>
              <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><MapPin className="w-5 h-5 text-blue-400" /></div><div><h3 className={`font-bold ${textPrimary}`}>Alamat Domisili</h3><p className={`text-xs ${textSecondary}`}>Tempat tinggal saat ini</p></div></div>
              <InfoRow label="Alamat" value={r.alamatDomisili} isDark={isDark} />
              <InfoRow label="RT/RW" value={`${r.rtDomisili}/${r.rwDomisili}`} isDark={isDark} />
              <InfoRow label="Kelurahan" value={r.kelurahanDomisili} isDark={isDark} />
              <InfoRow label="Kecamatan" value={r.kecamatanDomisili} isDark={isDark} />
              <InfoRow label="Kota" value={r.kotaDomisili} isDark={isDark} />
              <InfoRow label="Provinsi" value={r.provinsiDomisili} isDark={isDark} />
              <InfoRow label="Kode Pos" value={r.kodePosDomisili} isDark={isDark} />
            </motion.div>
          </div>
        </div>
      )}

      {/* Usaha Card */}
      {r && r.punyaUsaha === "ya" && (
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className={`shadow-sm backdrop-blur-xl rounded-2xl border p-6 mb-6 ${bgCard}`}>
          <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Briefcase className="w-5 h-5 text-emerald-500" /></div><div><h3 className={`font-bold ${textPrimary}`}>Informasi Usaha</h3><p className={`text-xs ${textSecondary}`}>Detail kegiatan wirausaha</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow label="Bidang Usaha" value={r.bidangUsaha} isDark={isDark} />
            <InfoRow label="Penghasilan/Hari" value={r.penghasilanPerHari} isDark={isDark} />
            <InfoRow label="Lama Berusaha" value={r.lamaBerusaha} isDark={isDark} />
            <InfoRow label="Ganti Usaha" value={r.gantiUsaha} isDark={isDark} />
          </div>
        </motion.div>
      )}

      {/* ═══ DELETE CONFIRM MODAL ═══ */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
              className={`w-full max-w-md relative z-10 shadow-sm backdrop-blur-2xl border rounded-2xl p-6 shadow-2xl text-center ${isDark ? "bg-[#111] border-white/20" : "bg-white border-gray-300"}`}>
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-red-500" /></div>
              <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Hapus Responden?</h3>
              <p className={`text-sm mb-6 ${textSecondary}`}>Data <strong className={textPrimary}>{nama}</strong> akan dihapus secara permanen.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteModal(false)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm border transition-all ${btnOutline}`}>Batal</button>
                <button onClick={handleDelete} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-500/50 shadow-lg shadow-red-900/20 transition-all flex items-center gap-2"><Trash2 className="w-4 h-4" /> Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ RESET KUESIONER MODAL ═══ */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setShowResetModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
              className={`w-full max-w-md relative z-10 shadow-sm backdrop-blur-2xl border rounded-2xl p-6 shadow-2xl text-center ${isDark ? "bg-[#111] border-white/20" : "bg-white border-gray-200"}`}>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4"><RotateCcw className="w-7 h-7 text-amber-500" /></div>
              <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Reset Kuesioner?</h3>
              <p className={`text-sm mb-6 ${textSecondary}`}>Skor <strong className={textPrimary}>{nama}</strong> akan dihapus dan responden dapat mengisi kuesioner ulang.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowResetModal(false)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm border transition-all ${btnOutline}`}>Batal</button>
                <button onClick={handleReset} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 border border-amber-500/50 shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reset</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}
