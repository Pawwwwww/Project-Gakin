import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, Check, Home, Send,
  FileText, Target, Zap, Brain, AlertTriangle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GRIT_QUESTIONS, GRIT_LABELS, KWU_ITEMS, KWU_GROUPS, KWU_GROUP_LABELS, KWU_GROUP_COLORS,
  TIPI_QUESTIONS, TIPI_LABELS,
  KUESIONER_INITIAL,
  type KuesionerData,
} from "../../../entities/respondent";
import {
  isLoggedIn, getCurrentRole, getCurrentUserNIK, getCurrentUserName,
  getKuesionerResult, saveKuesionerResult,
} from "../../../services/StorageService";
import { KWUOption } from "../components/KWUOption";
import { ResultScreen } from "../components/ResultScreen";
import UserHeader from "../components/UserHeader";

// ═══════════════════════════════════════════════════════════════
//  STEPS & INITIAL DATA (using shared entities)
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { label: "Persetujuan", icon: FileText },
  { label: "GRIT", icon: Target },
  { label: "Kewirausahaan", icon: Zap },
  { label: "TIPI", icon: Brain },
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
    if (step === 0 && !data.consent)
      errs.push("Anda harus menyetujui Lembar Persetujuan untuk melanjutkan.");
    if (step === 1) {
      const miss = GRIT_QUESTIONS.filter((q) => !data.grit[q.id]);
      if (miss.length) errs.push(`${miss.length} pernyataan GRIT belum dijawab (No. ${miss.map((q) => q.id).join(", ")}).`);
    }
    if (step === 2) {
      const miss = KWU_ITEMS.filter((q) => !data.kwu[q.id]);
      if (miss.length) errs.push(`${miss.length} pernyataan Kewirausahaan belum dijawab (No. ${miss.map((q) => q.id).join(", ")}).`);
    }
    if (step === 3) {
      const miss = TIPI_QUESTIONS.filter((q) => !data.tipi[q.id]);
      if (miss.length) errs.push(`${miss.length} pernyataan TIPI belum dijawab (No. ${miss.map((q) => q.id).join(", ")}).`);
    }
    setErrors(errs);
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
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-red-100 to-red-200 relative overflow-hidden transition-colors duration-700">

      {/* Background Blobs (Locked to background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <UserHeader 
        rightContent={(
          <button
            onClick={attemptExit}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg border border-white/20 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
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
            <motion.div variants={itemVariants} className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-1 flex-1 last:flex-none min-w-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${i < step ? "bg-green-600" : i === step ? "bg-red-700" : "bg-gray-200"}`}>
                      {i < step ? <Check className="w-4 h-4 text-white" /> : <s.icon className={`w-4 h-4 ${i === step ? "text-white" : "text-gray-400"}`} />}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-red-700" : i < step ? "text-green-700" : "text-gray-400"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 rounded mx-1 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Form Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-colors">
              {/* Card header */}
              <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4 flex items-center gap-3">
                {(() => { const Ic = STEPS[step].icon; return <Ic className="w-5 h-5 text-white" />; })()}
                <div>
                  <p className="text-white font-bold text-sm">{STEPS[step].label}</p>
                  <p className="text-red-200 text-xs">Bagian {step + 1} dari {STEPS.length}</p>
                </div>
              </div>

              <div className="p-6">

                {/* ══ STEP 0: Consent ══ */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <p className="text-sm text-gray-700 mb-2">Salam Sejahtera,</p>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        Bapak/Ibu/Saudara/i yang kami hormati, Kami mengundang Anda untuk mengisi kuesioner ini guna memperoleh gambaran pengalaman dalam
                        bekerja serta mengembangkan usaha/bisnis selama ini.
                        Tidak ada jawaban yang
                        benar atau salah. Kami berharap Bapak/Ibu/Saudara/i dapat menjawab setiap pertanyaan sesuai dengan kondisi yang sebenarnya/dirasakan. Seluruh data dan informasi
                        yang diberikan akan dijaga kerahasiaannya dan hanya digunakan untuk kepentingan pengembangan dan evaluasi program Pemerintah Kota Surabaya.
                      </p>
                      <p className="text-sm text-gray-700">
                        Kami sampaikan terima kasih atas kesediaan dan bantuan Bapak/Ibu/Saudara/i
                      </p>
                    </div>

                    <div className="border-2 border-red-100 rounded-xl p-5 bg-red-50">
                      <h3 className="font-bold text-gray-900 mb-3">Lembar Persetujuan <span className="italic font-normal">(Informed Consent)</span></h3>
                      <ol className="space-y-2 mb-5">
                        {[
                          "Saya mengisi secara sukarela dan tanpa paksaan.",
                          "Kerahasiaan data yang saya berikan terjamin.",
                          "Saya mengisi dengan benar dan sesuai dengan kondisi yang saya alami.",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="font-semibold text-red-700 flex-shrink-0">{i + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ol>
                      <button
                        type="button"
                        onClick={() => setData((p) => ({ ...p, consent: !p.consent }))}
                        className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left transition-all ${data.consent ? "border-green-500 bg-green-50" : "border-gray-300 bg-white hover:border-red-300"}`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${data.consent ? "bg-green-600" : "border-2 border-gray-300"}`}>
                          {data.consent && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Saya Menyetujui Lembar Persetujuan di Atas</p>
                          <p className="text-xs text-gray-500 mt-0.5">Centang kotak ini untuk melanjutkan pengisian kuesioner</p>
                        </div>
                      </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-2">Kuesioner ini terdiri dari 3 bagian:</p>
                      <ul className="space-y-1 text-xs text-blue-700">
                        <li>• <strong>Bagian I — GRIT (Ketangguhan):</strong> 12 pernyataan, skala 1–5</li>
                        <li>• <strong>Bagian II — Kompetensi Kewirausahaan:</strong> 15 pernyataan, skala 1–4</li>
                        <li>• <strong>Bagian III — TIPI (Kepribadian):</strong> 10 pernyataan, skala 1–7</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* ══ STEP 1: GRIT ══ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-800 text-sm mb-2">Bagian I. Skala GRIT (Ketangguhan)</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        GRIT (<b>Guts, Resilience, Initiative, and Tenacity</b>) merupakan skala pengukuruan ketekunan seseorang. GRIT adalah karakter yang mencerminkan perpaduan antara ketekunan (<i>perseverance</i>) dan konsistensi minat dalam mencapai tujuan jangka panjang (<i>passion for long-term goals</i>).
                        <br />
                        Pernyataan-pernyataan berikut berkaitan dengan kondisi diri Anda saat ini. Pilihlah jawaban yang
                        paling sesuai dengan diri Anda.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-1 text-xs">
                        {[
                          { n: 1, label: "Tidak Sesuai", cls: "bg-red-100 text-red-700" },
                          { n: 2, label: "Kurang Sesuai", cls: "bg-orange-100 text-orange-700" },
                          { n: 3, label: "Agak Sesuai", cls: "bg-yellow-100 text-yellow-700" },
                          { n: 4, label: "Cukup Sesuai", cls: "bg-lime-100 text-lime-700" },
                          { n: 5, label: "Sangat Sesuai", cls: "bg-green-100 text-green-700" },
                        ].map((item) => (
                          <div key={item.n} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${item.cls}`}>
                            <span className="font-bold">{item.n}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{answeredGrit} dari 12 pernyataan dijawab</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${(answeredGrit / 12) * 100}%` }} />
                      </div>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden md:grid md:grid-cols-[2fr_repeat(5,52px)] gap-1 px-2 text-center">
                      <div />
                      {GRIT_LABELS.map((l, i) => (
                        <div key={i} className="text-xs text-gray-500 leading-tight whitespace-pre-line">{l}</div>
                      ))}
                    </div>

                    {GRIT_QUESTIONS.map((q, idx) => (
                      <div key={q.id} className={`rounded-xl border transition-all ${data.grit[q.id] ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-red-100"}`}>
                        {/* Mobile */}
                        <div className="md:hidden p-4">
                          <p className={`text-sm mb-3 text-gray-700`}>
                            <span className="text-red-600 font-bold mr-1">{idx + 1}.</span>
                            {q.text}
                          </p>
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-xs text-gray-400 hidden xs:block">TS</span>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} type="button" onClick={() => setGrit(q.id, n)}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${data.grit[q.id] === n ? "bg-red-700 border-red-700 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-red-400"}`}>
                                {n}
                              </button>
                            ))}
                            <span className="text-xs text-gray-400 hidden xs:block">SS</span>
                          </div>
                        </div>
                        {/* Desktop */}
                        <div className="hidden md:grid md:grid-cols-[2fr_repeat(5,52px)] gap-1 p-3 items-center">
                          <p className={`text-sm pr-2 text-gray-700`}>
                            <span className="text-red-600 font-semibold mr-1">{idx + 1}.</span>
                            {q.text}
                          </p>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="flex justify-center">
                              <button type="button" onClick={() => setGrit(q.id, n)}
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${data.grit[q.id] === n ? "bg-red-700 border-red-700 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-red-400"}`}>
                                {n}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ══ STEP 2: Kewirausahaan ══ */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-800 text-sm mb-2">Bagian II. Skala Kompetensi Kewirausahaan</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Kompetensi Wirausaha adalah keterampilan yang diperlukan untuk menjadi wirausahawan yang berhasil. Skala pengukuran ini digunakan untuk mengukur tingkat kompetensi wirausaha seseorang.
                        <br />Setiap nomor terdapat empat pernyataan yang menggambarkan tingkat kompetensi dari rendah ke tinggi.
                        Pilihlah <strong>satu pernyataan</strong> yang paling sesuai dan menggambarkan diri Anda.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{answeredKwu} dari 15 pernyataan dijawab</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(answeredKwu / 15) * 100}%` }} />
                      </div>
                    </div>

                    {KWU_GROUPS.map((grp) => {
                      const items = KWU_ITEMS.filter((item) => item.kategori === grp);
                      return (
                        <div key={grp}>
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 bg-gradient-to-r ${KWU_GROUP_COLORS[grp]}`}>
                            <span className="text-white text-xs font-bold uppercase tracking-wide">{KWU_GROUP_LABELS[grp]}</span>
                            <span className="text-white/60 text-xs">({grp})</span>
                          </div>
                          <div className="space-y-4">
                            {items.map((item) => (
                              <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-orange-100 transition-all">
                                <div className="mb-3">
                                  <p className="text-sm font-semibold text-gray-900">
                                    <span className="text-orange-600 mr-1">{item.id}.</span>{item.aspek}
                                  </p>
                                  <p className="text-xs text-gray-400 italic">{item.aspekEn}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {item.options.map((opt, optIdx) => (
                                    <KWUOption
                                      key={optIdx}
                                      score={optIdx + 1}
                                      label={opt}
                                      selected={data.kwu[item.id] === optIdx + 1}
                                      onChange={() => setKwu(item.id, optIdx + 1)}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ══ STEP 3: TIPI ══ */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-800 text-sm mb-2">Bagian III. Skala <i>Ten Item Personality Inventory</i> (TIPI)</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        TIPI (<i>Ten Item Personality Inventory</i>) adalah skala pengukuran kepribadian yang dirancang untuk mengukur sepuluh aspek penting dari kepribadian seseorang.
                        <br />
                        Berikut ini adalah sepuluh pernyataan tentang sifat/kepribadian. Pilihlah nomor yang paling sesuai
                        menggambarkan diri Anda.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-7 gap-1 text-xs">
                        {[
                          { n: 1, label: "Sangat Tidak Setuju", cls: "bg-red-100 text-red-800" },
                          { n: 2, label: "Tidak Setuju", cls: "bg-red-50 text-red-700" },
                          { n: 3, label: "Agak Tidak Setuju", cls: "bg-orange-100 text-orange-700" },
                          { n: 4, label: "Netral", cls: "bg-gray-100 text-gray-700" },
                          { n: 5, label: "Agak Setuju", cls: "bg-yellow-100 text-yellow-700" },
                          { n: 6, label: "Setuju", cls: "bg-lime-100 text-lime-700" },
                          { n: 7, label: "Sangat Sesuai", cls: "bg-green-100 text-green-700" },
                        ].map((item) => (
                          <div key={item.n} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${item.cls}`}>
                            <span className="font-bold">{item.n}</span>
                            <span className="leading-tight">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{answeredTipi} dari 10 pernyataan dijawab</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(answeredTipi / 10) * 100}%` }} />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 italic">"Saya adalah seseorang yang..."</p>

                    {/* Desktop column header */}
                    <div className="hidden lg:grid lg:grid-cols-[2fr_repeat(7,44px)] gap-1 px-2 text-center">
                      <div />
                      {TIPI_LABELS.map((l, i) => (
                        <div key={i} className="text-xs text-gray-400">{i + 1}</div>
                      ))}
                    </div>

                    {TIPI_QUESTIONS.map((q, idx) => {
                      const isUF = q.id >= 6;
                      return (
                        <div key={q.id} className={`rounded-xl border transition-all ${data.tipi[q.id] ? "border-blue-200 bg-blue-50/30" : "border-gray-100 hover:border-blue-100"}`}>
                          {/* Mobile */}
                          <div className="lg:hidden p-4">
                            <p className="text-sm text-gray-700 mb-1">
                              <span className={`font-bold mr-1 ${isUF ? "text-blue-500" : "text-blue-600"}`}>{idx + 1}.</span>
                              {q.text}
                            </p>
                            <div className="grid grid-cols-7 gap-1 mt-2">
                              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                <button key={n} type="button" onClick={() => setTipi(q.id, n)}
                                  className={`h-9 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${data.tipi[q.id] === n ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-blue-400"}`}>
                                  {n}
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-400">Sangat Tidak Setuju</span>
                              <span className="text-xs text-gray-400">Sangat Sesuai</span>
                            </div>
                          </div>
                          {/* Desktop */}
                          <div className="hidden lg:grid lg:grid-cols-[2fr_repeat(7,44px)] gap-1 p-3 items-center">
                            <p className="text-sm text-gray-700 pr-2">
                              <span className={`font-semibold mr-1 ${isUF ? "text-blue-500" : "text-blue-600"}`}>{idx + 1}.</span>
                              {q.text}
                              {isUF && <span className="ml-1 text-xs text-gray-400"></span>}
                            </p>
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                              <div key={n} className="flex justify-center">
                                <button type="button" onClick={() => setTipi(q.id, n)}
                                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${data.tipi[q.id] === n ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-blue-400"}`}>
                                  {n}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                    <p className="text-sm font-semibold text-red-700 mb-1">Harap lengkapi isian berikut:</p>
                    {errors.map((e, i) => (
                      <p key={i} className="text-sm text-red-600 flex items-start gap-1.5">
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
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {step === 0 ? "Batal" : "Sebelumnya"}
                </button>

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm">
                    Selanjutnya <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm">
                    <Send className="w-4 h-4" /> Kirim Kuesioner
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
    <AnimatePresence>
      {showExitConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop WITHOUT blur, just dark translucent */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowExitConfirm(false)} />

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
            
            <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-5 border border-orange-500/30 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-orange-200" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Keluar Kuesioner?</h2>
            <p className="text-sm text-red-100/80 mb-8 leading-relaxed">
              Progres pengisian kuesioner Anda belum tersimpan. Apakah Anda yakin ingin keluar dan membatalkan pengisian?
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => navigate("/welcome")}
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
