import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LogOut, ClipboardList, User, ChevronRight,
  CheckCircle, Info, Star, MapPin, Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { KLUSTER_INFO } from "../../../entities/respondent";
import { calcFullScore } from "../../../services/ScoringService";
import { getCurrentUserNIK, getCurrentUserName, getKuesionerResult, logout, isLoggedIn, getCurrentRole, findUserByNIK, UserRecord, KuesionerSubmission } from "../../../services/StorageService";
import Profile from "../components/profile/Profile";
import UserHeader from "../components/UserHeader";
import { ConfirmModal } from "../../../components/shared/ConfirmModal";

const INFO_ITEMS = [
  {
    icon: ClipboardList,
    title: "Kuesioner Kemampuan Berkembang Maju dan Kompetensi Wirausaha (MASIH HARUS REVISI)",
    desc: "Kuesioner Kemampuan Berkembang Maju dan Kompetensi Wirausaha yang diselenggarakan BRIDA Surabaya.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Star,
    title: "Hanya ±5–10 Menit (MASIH HARUS REVISI)",
    desc: "Kuesioner ini terdiri dari 3 bagian singkat yang mencakup beberapa pertanyaan mengenai ketekunan dalam mencapai tujuan (GRIT), kompetensi berwirausaha, dan pengukuran kepribadian singkat (TIPI).",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    icon: CheckCircle,
    title: "Kontribusi Nyata (MASIH HARUS REVISI)",
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
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-slate-100 to-slate-200 transition-colors duration-700 relative overflow-hidden">

      {/* Background Blobs (Locked to background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
      </div>

      {/* ── HEADER ── */}
      <UserHeader 
        rightContent={(
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center gap-[6px] px-[12px] py-[8px] bg-white/10 hover:bg-white/20 text-white rounded-[8px] border border-white/20 transition-colors text-[14px] font-medium"
          >
            <LogOut className="w-[16px] h-[16px]" />
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
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-52 sm:h-52 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 right-20 w-60 h-60 sm:w-72 sm:h-72 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-center sm:items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-xs sm:text-sm font-medium mb-0.5">Selamat datang,</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide leading-tight">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm font-medium">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    NIK: {shortNIK}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm font-medium">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Kota Surabaya
                  </span>
                  {sudahIsi && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-500/20 backdrop-blur-md border border-green-400/30 text-green-100 shadow-sm font-bold">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-300" />
                      Kuesioner Diisi
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-[11px] sm:text-xs md:text-sm px-4 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white shadow-lg font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <User className="w-4 h-4" />
              Lihat Profil
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── INFO CARDS ── */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
            {/* ── BRIDA STEP Intro Card ── */}
            <div className="relative rounded-2xl border border-white/40 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-300/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 p-5 sm:p-6 space-y-3">
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight leading-tight">
                  <i>BRIDA STEP</i>
                </h2>

                {/* Tagline Bubble */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-700/10 border border-blue-400/30 rounded-full backdrop-blur-sm shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold text-blue-800 italic">
                    Riset Tepat, Inovasi Hebat, Masyarakat Berkarya, Ekonomi Berdaya
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-blue-300/50 to-transparent" />

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-800"><i>BRIDA-STEP (BRIDA Surabaya Talent Enterpreneural Path)</i></span> adalah platform{" "}
                  <span className="italic text-blue-700">Diagnostic &amp; Intervention</span> pertama di Surabaya yang mengonversi hasil riset perilaku ekonomi menjadi panduan praktis bagi warga.
                  {" "}Aplikasi ini menghilangkan sekat sosial, baik warga prasejahtera yang ingin memulai usaha kecil, maupun warga umum yang ingin naik kelas, akan mendapatkan perlakuan berbasis data yang sama adilnya.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {INFO_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-sm p-3 sm:p-4 flex items-start gap-3 sm:gap-4 transition-colors"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color} backdrop-blur-sm`}>
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
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
            <div className="rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-sm p-4 sm:p-5 transition-colors">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Status Kuesioner</h3>

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
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Belum Diisi</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Silakan isi kuesioner sekarang
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/kuesioner")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors shadow-md mt-3"
              >
                <ClipboardList className="w-4 h-4" />
                {sudahIsi ? "Lihat Hasil Pengerjaan" : "Mulai Kuesioner"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hasil Kuesioner (Pengganti Partisipasi Masyarakat) */}
            <div className="rounded-xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-sm p-4 sm:p-5 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <h3 className="text-sm font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 relative z-10">
                <Brain className="w-5 h-5 text-blue-600" /> Hasil Pengerjaan Kuesioner Anda
              </h3>

              {sudahIsi && userKluster ? (
                <div className="space-y-4 relative z-10">
                  <div className={`p-4 rounded-xl border ${KLUSTER_INFO[userKluster].bg} ${KLUSTER_INFO[userKluster].border} shadow-sm relative overflow-hidden`}>
                    <h4 className={`text-lg font-bold ${KLUSTER_INFO[userKluster].color} mb-2 leading-tight`}>
                      {KLUSTER_INFO[userKluster].subtitle}
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                      {KLUSTER_INFO[userKluster].desc}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <button
                      onClick={() => navigate("/kuesioner")}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-white/60 hover:bg-white/90 text-blue-700 border border-blue-200 rounded-lg font-semibold transition-colors shadow-sm text-xs"
                    >
                      Baca Selengkapnya
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
    <ConfirmModal
      isOpen={isLogoutOpen}
      onClose={() => setIsLogoutOpen(false)}
      onConfirm={handleLogout}
      icon={LogOut}
      title="Keluar Aplikasi?"
      message="Anda akan mengakhiri sesi saat ini. Apakah Anda yakin ingin keluar dari portal dashboard?"
      confirmLabel="Ya, Keluar"
    />

    </div>
  );
}
