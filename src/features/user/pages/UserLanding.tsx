import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LogOut, ClipboardList, User, ChevronRight,
  CheckCircle, Info, Star, MapPin, Brain, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateRaporPDF } from "../../../utils/pdfGenerator";
import { KLUSTER_INFO, GRIT_QUESTIONS, KWU_ITEMS, TIPI_QUESTIONS } from "../../../entities/respondent";
import { calcFullScore } from "../../../services/ScoringService";
import { getCurrentUserNIK, getCurrentUserName, getKuesionerResult, logout, isLoggedIn, getCurrentRole, findUserByNIK, UserRecord, KuesionerSubmission } from "../../../services/StorageService";
import Profile from "./Profile";
import UserHeader from "../components/UserHeader";

const INFO_ITEMS = [
  {
    icon: ClipboardList,
    title: "Kuesioner Kemampuan Berkembang Maju dan Tangguh ",
    desc: "Kuesioner Kemampuan Berkembang Maju dan Tangguh yang diselenggarakan BRIDA Surabaya.",
    color: "text-red-600 bg-red-50",
  },
  {
    icon: Star,
    title: "Hanya ±5–10 Menit",
    desc: "Kuesioner ini terdiri dari 3 bagian singkat yang mencakup beberapa pertanyaan mengenai ketekunan dalam mencapai tujuan (GRIT), kompetensi berwirausaha, dan pengukuran kepribadian singkat (TIPI).",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    icon: CheckCircle,
    title: "Kontribusi Nyata",
    desc: "Jawaban Anda membantu BRIDA merancang program inovasi yang tepat sasaran bagi masyarakat Surabaya.",
    color: "text-green-600 bg-green-50",
  },
];

// ----------------------------------------------------------------

export default function UserLanding() {
  const navigate = useNavigate();
  const [userNIK, setUserNIK] = useState("");
  const [userName, setUserName] = useState("");
  const [sudahIsi, setSudahIsi] = useState(false);
  const [userKluster, setUserKluster] = useState<number | null>(null);
  const [userGrit, setUserGrit] = useState("");
  const [userKwu, setUserKwu] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
  const [completeUser, setCompleteUser] = useState<UserRecord | null>(null);
  const [kuesionerResult, setKuesionerResult] = useState<KuesionerSubmission | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || getCurrentRole() !== "user") {
      navigate("/");
      return;
    }
    const nik = getCurrentUserNIK() || "";
    const name = getCurrentUserName() || "";
    setUserNIK(nik);
    setUserName(name);

    // Cek apakah sudah pernah mengisi kuesioner dan hitung kluster
    const kuesResult = getKuesionerResult(nik);
    if (kuesResult && kuesResult.data) {
      setSudahIsi(true);
      setKuesionerResult(kuesResult);
      
      const fullUser = findUserByNIK(nik);
      if (fullUser) setCompleteUser(fullUser);
      try {
        const scoring = calcFullScore(kuesResult.data);
        setUserGrit(scoring.gritCategory.label);
        setUserKwu(scoring.kwuCategory.label);
        setUserKluster(scoring.kluster);
      } catch (e) {
        console.error("Gagal mendapatkan data kuesioner", e);
      }
    } else {
      setSudahIsi(false);
      setUserKluster(null);
      setUserGrit("");
      setUserKwu("");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDownloadPDF = async () => {
    if (!completeUser || !kuesionerResult || isDownloadingPDF) return;
    try {
      setIsDownloadingPDF(true);
      console.log("Generating initial PDF for user:", completeUser.fullName);
      await generateRaporPDF(completeUser, kuesionerResult);
    } catch (error) {
      console.error("Gagal membuat PDF", error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const displayName = userName || `Pengguna (NIK: ${userNIK})`;
  const shortNIK = userNIK
    ? userNIK.slice(0, 4) + "****" + userNIK.slice(-4)
    : "";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-red-100 to-red-200 transition-colors duration-700 relative overflow-hidden">

      {/* Background Blobs (Locked to background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
      </div>

      {/* ── HEADER ── */}
      <UserHeader 
        rightContent={(
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      />

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full relative z-10">
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
        >

        {/* ── WELCOME BANNER ── */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 right-20 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-red-200 text-sm">Selamat datang,</p>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm font-medium">
                  <User className="w-3.5 h-3.5" />
                  NIK: {shortNIK}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  Kota Surabaya
                </span>
                {sudahIsi && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    Kuesioner sudah diisi
                  </span>
                )}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs px-4 py-1.5 rounded-full bg-white text-red-700 hover:bg-red-50 border border-transparent shadow-md shadow-red-900/10 font-bold transition-all hover:scale-105 active:scale-95 sm:ml-2"
                >
                  <User className="w-3.5 h-3.5" />
                  Profil Selengkapnya
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── INFO CARDS ── */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Kuesioner Kemampuan Berkembang Maju dan Tangguh 
              </h2>
              <p className="text-sm text-gray-500">
                Layanan ini mengundang Anda untuk mengisi kuesioner singkat tentang kebutuhan masyarakat dan pelayanan publik tahun 2026.
              </p>
            </div>

            <div className="space-y-3">
              {INFO_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-sm p-4 flex items-start gap-4 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color} backdrop-blur-sm`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pemberitahuan privasi */}
            <div className="flex items-start gap-3 rounded-xl border border-white/40 bg-blue-50/50 backdrop-blur-xl p-4 transition-colors">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Data serta jawaban yang Anda isi bersifat rahasia dan hanya digunakan untuk pengembangan
                program Pemerintah Kota Surabaya serta peningkatan layanan publik sesuai dengan ketentuan yang berlaku.
              </p>
            </div>
          </motion.div>

          {/* ── SIDE CTA ── */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Status card */}
            <div className="rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-sm p-5 transition-colors">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Kuesioner</h3>

              {sudahIsi ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-green-700">Sudah Diisi!</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Terima kasih atas partisipasi Anda.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Belum Diisi</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Silakan isi kuesioner sekarang
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/kuesioner")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold transition-colors shadow-md mt-3"
              >
                <ClipboardList className="w-4 h-4" />
                {sudahIsi ? "Lihat Hasil Pengerjaan" : "Mulai Kuesioner"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hasil Kuesioner (Pengganti Partisipasi Masyarakat) */}
            <div className="rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-sm p-5 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <Brain className="w-5 h-5 text-red-600" /> Hasil Pengerjaan Kuesioner Anda
              </h3>

              {sudahIsi && userKluster ? (
                <div className="space-y-4 relative z-10">
                  <div className={`p-4 rounded-xl border ${KLUSTER_INFO[userKluster].bg} ${KLUSTER_INFO[userKluster].border} shadow-sm relative overflow-hidden`}>
                    <h4 className={`text-lg font-bold ${KLUSTER_INFO[userKluster].color} mb-2 leading-tight`}>
                      {KLUSTER_INFO[userKluster].subtitle}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/70 text-gray-800 border border-gray-200/50 shadow-sm backdrop-blur-sm">
                        GRIT: {userGrit}
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/70 text-gray-800 border border-gray-200/50 shadow-sm backdrop-blur-sm">
                        KWU: {userKwu}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                      {KLUSTER_INFO[userKluster].desc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => navigate("/kuesioner")}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-white/60 hover:bg-white/90 text-red-700 border border-red-200 rounded-lg font-semibold transition-colors shadow-sm text-xs"
                    >
                      Baca Selengkapnya
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloadingPDF}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-red-700 hover:bg-red-800 text-white border border-red-800 rounded-lg font-semibold transition-colors shadow-sm text-xs disabled:opacity-70"
                    >
                      {isDownloadingPDF ? "Memproses..." : "Unduh Rapor PDF"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 relative z-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                    <ClipboardList className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Belum Ada Hasil</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Silakan kerjakan asesmen terlebih dahulu untuk melihat hasil analisis Anda.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>

    {/* Profile Modal */}
    <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

    {/* Logout Confirmation Modal */}
    <AnimatePresence>
      {isLogoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop WITHOUT blur, just dark translucent */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsLogoutOpen(false)} />

          {/* Modal Card - Liquid Glass */}
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0, rotateX: 10, filter: "blur(4px)" }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.8, y: 30, opacity: 0, rotateX: -10, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
            className="relative w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 text-center overflow-hidden"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-5 border border-red-500/30 shadow-inner">
              <LogOut className="w-8 h-8 text-red-200" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Keluar Aplikasi?</h2>
            <p className="text-sm text-red-100/80 mb-8 leading-relaxed">
              Anda akan mengakhiri sesi saat ini. Apakah Anda yakin ingin keluar dari portal dashboard?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setIsLogoutOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-red-600/90 hover:bg-red-500 shadow-lg shadow-red-600/30 border border-red-500/50 transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
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
