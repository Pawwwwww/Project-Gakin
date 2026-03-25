import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Home, Send, FileText, Flame, Briefcase, Star, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KUESIONER_INITIAL, type KuesionerData, GRIT_QUESTIONS, KWU_ITEMS, TIPI_QUESTIONS } from "../../../entities/respondent";
import { isLoggedIn, getCurrentRole, getCurrentUserNIK, getCurrentUserName, getKuesionerResult, saveKuesionerResult } from "../../../services/StorageService";
import { ResultScreen } from "../components/kuesioner/ResultScreen";
import UserHeader from "../components/UserHeader";
import { ConfirmModal } from "../../../components/shared/ConfirmModal";
import { KuesionerConsent } from "../components/kuesioner/KuesionerConsent";
import { KuesionerGrit } from "../components/kuesioner/KuesionerGrit";
import { KuesionerKWU } from "../components/kuesioner/KuesionerKWU";
import { KuesionerTIPI } from "../components/kuesioner/KuesionerTIPI";

// ═══════════════════════════════════════════════════════════════
//  STEPS & INITIAL DATA (using shared entities)
// ═══════════════════════════════════════════════════════════════
const STEPS = [
  { label: "Persetujuan", icon: FileText },
  { label: "Bagian I", icon: Flame },
  { label: "Bagian II", icon: Briefcase },
  { label: "Bagian III", icon: Star },
];

const INITIAL = KUESIONER_INITIAL;

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Kuesioner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<KuesionerData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [userNIK, setUserNIK] = useState("");
  const [userName, setUserName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
  };

  useEffect(() => {
    if (!isLoggedIn() || getCurrentRole() !== "user") { navigate("/"); return; }

    const nik = getCurrentUserNIK() || "";
    const name = getCurrentUserName() || "";
    setUserNIK(nik);
    setUserName(name);

    // Block retries: Redirect immediately to Result Screen if already completed
    const kuesResult = getKuesionerResult(nik);
    if (kuesResult?.data) {
      setData(kuesResult.data);
      setSubmitted(true);
    }
  }, [navigate]);

  // ── Validation ──────────────────────────────────────────────
  const validateStep = (): boolean => {
    const errs: string[] = [];
    let firstMissedId: string | null = null;

    if (step === 0 && !data.consent) {
      errs.push("Anda harus menyetujui Lembar Persetujuan untuk melanjutkan.");
      firstMissedId = "consent-box";
    }
    if (step === 1) {
      const miss = GRIT_QUESTIONS.filter((q) => !data.grit[q.id]);
      if (miss.length) {
        errs.push(`${miss.length} pernyataan GRIT belum dijawab (No. ${miss.map((q) => q.id).join(", ")}).`);
        firstMissedId = `grit-q-${miss[0].id}`;
      }
    }
    if (step === 2) {
      const miss = KWU_ITEMS.filter((q) => !data.kwu[q.id]);
      if (miss.length) {
        errs.push(`${miss.length} pernyataan Kewirausahaan belum dijawab (No. ${miss.map((q) => q.id).join(", ")}).`);
        firstMissedId = `kwu-q-${miss[0].id}`;
      }
    }
    if (step === 3) {
      const miss = TIPI_QUESTIONS.filter((q) => !data.tipi[q.id]);
      if (miss.length) {
        errs.push(`${miss.length} pernyataan TIPI belum dijawab (No. ${miss.map((q) => q.id).join(", ")}).`);
        firstMissedId = `tipi-q-${miss[0].id}`;
      }
    }

    setErrors(errs);

    if (firstMissedId) {
      setTimeout(() => {
        const el = document.getElementById(firstMissedId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }

    return errs.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) { setErrors([]); setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handleBack = () => {
    setErrors([]); setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSubmit = () => {
    if (!validateStep()) return;
    saveKuesionerResult(userNIK, data);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setGrit = (id: number, v: number) => setData((p) => ({ ...p, grit: { ...p.grit, [id]: v } }));
  const setKwu = (id: number, v: number) => setData((p) => ({ ...p, kwu: { ...p.kwu, [id]: v } }));
  const setTipi = (id: number, v: number) => setData((p) => ({ ...p, tipi: { ...p.tipi, [id]: v } }));

  const answeredGrit = Object.keys(data.grit).length;
  const answeredKwu = Object.keys(data.kwu).length;
  const answeredTipi = Object.keys(data.tipi).length;

  const attemptExit = () => {
    if (!submitted) {
      setShowExitConfirm(true);
    } else {
      navigate("/welcome");
    }
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden transition-colors duration-700">

      {/* Background Blobs (Locked to background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <UserHeader 
        rightContent={(
          <button
            onClick={attemptExit}
            className="flex items-center gap-[6px] px-[12px] py-[8px] bg-white/10 hover:bg-white/20 text-white text-[14px] rounded-[8px] border border-white/20 transition-colors font-medium"
          >
            <Home className="w-[16px] h-[16px]" />
            <span className="hidden sm:inline">Beranda</span>
          </button>
        )}
      />

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full relative z-10">
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20"
        >

        {submitted ? (
          <ResultScreen data={data} userNIK={userNIK} userName={userName} onBack={() => navigate("/welcome")} />
        ) : (
          <>
            {/* Title */}
            <motion.div variants={itemVariants} className="mb-5">
              <h1 className="text-xl font-bold text-gray-900">
                Kuesioner Kemampuan Berkembang Maju dan Tangguh
              </h1>
              <p className="text-sm text-gray-500 mt-1">Program Pemerintah Kota Surabaya</p>
            </motion.div>

            {/* Step indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-0.5 sm:gap-1 mb-6 sm:mb-8 overflow-x-auto pb-1 no-scrollbar">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-0.5 sm:gap-1 flex-1 last:flex-none min-w-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${i < step ? "bg-green-600" : i === step ? "bg-blue-700" : "bg-gray-200"}`}>
                      {i < step ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <s.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i === step ? "text-white" : "text-gray-400"}`} />}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${i === step ? "text-blue-700" : i < step ? "text-green-700" : "text-gray-400"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 sm:mb-5 rounded mx-0.5 sm:mx-1 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Form Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-colors">
              {/* Card header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center gap-3">
                {(() => { const Ic = STEPS[step].icon; return <Ic className="w-5 h-5 text-white" />; })()}
                <div>
                  <p className="text-white font-bold text-sm">{STEPS[step].label}</p>
                  <p className="text-blue-200 text-xs">Bagian {step + 1} dari {STEPS.length}</p>
                </div>
              </div>

              <div className="p-4 sm:p-6">

                {/* ══ STEP 0: Consent ══ */}
                {step === 0 && (
                  <KuesionerConsent data={data} onToggleConsent={() => setData((p) => ({ ...p, consent: !p.consent }))} />
                )}

                {/* ══ STEP 1: GRIT ══ */}
                {step === 1 && (
                  <KuesionerGrit data={data} setGrit={setGrit} answered={answeredGrit} />
                )}

                {/* ══ STEP 2: Kewirausahaan ══ */}
                {step === 2 && (
                  <KuesionerKWU data={data} setKwu={setKwu} answered={answeredKwu} />
                )}

                {/* ══ STEP 3: TIPI ══ */}
                {step === 3 && (
                  <KuesionerTIPI data={data} setTipi={setTipi} answered={answeredTipi} />
                )}

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Harap lengkapi isian berikut:</p>
                    {errors.map((e, i) => (
                      <p key={i} className="text-sm text-blue-600 flex items-start gap-1.5">
                        <span className="mt-0.5 flex-shrink-0">•</span>{e}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <button
                  type="button"
                  onClick={step === 0 ? attemptExit : handleBack}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {step === 0 ? "Batal" : "Sebelumnya"}
                </button>

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={handleNext}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold shadow-sm">
                    Selanjutnya <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold shadow-sm">
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Kirim Kuesioner
                  </button>
                )}
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center text-xs text-gray-400 mt-4">
              Data kuesioner bersifat rahasia dan hanya untuk keperluan evaluasi program pemerintah kota
            </motion.p>
          </>
        )}
        </motion.main>
      </div>

    {/* Exit Confirmation Modal */}
    <ConfirmModal
      isOpen={showExitConfirm}
      onClose={() => setShowExitConfirm(false)}
      onConfirm={() => navigate("/welcome")}
      icon={LogOut}
      title="Keluar Kuesioner?"
      message="Progres pengisian kuesioner Anda belum tersimpan. Apakah Anda yakin ingin keluar dan membatalkan pengisian?"
      confirmLabel="Ya, Keluar"
    />

    </div>
  );
}
