import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle,
  ChevronDown, TestTube2, Hash, UserPlus, X
} from "lucide-react";
import {
  getDummyCount, getDummyUsers, generateDummies, clearDummies, isDummyNIK
} from "../../../../services/DummyDataService";

const PRESET_COUNTS = [10, 20, 40, 50, 100];

export default function DummyManager() {
  const [currentCount, setCurrentCount] = useState(() => getDummyCount());
  const [inputCount, setInputCount] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Alert
  const [alertMsg, setAlertMsg] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isAlertExiting, setIsAlertExiting] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "warning">("success");

  // Dropdown
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) setShowPresetDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Listen to storage changes
  useEffect(() => {
    const onStorage = () => setCurrentCount(getDummyCount());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const triggerAlert = (msg: string, type: "success" | "warning" = "success") => {
    setAlertMsg(msg);
    setAlertType(type);
    setShowAlert(true);
    setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowAlert(false); setIsAlertExiting(false); }, 4000);
  };

  const handleGenerate = (count: number) => {
    setPendingCount(count);
    setShowGenerateConfirm(true);
  };

  const confirmGenerate = () => {
    generateDummies(pendingCount);
    setCurrentCount(pendingCount);
    setInputCount("");
    setShowGenerateConfirm(false);
    triggerAlert(`Berhasil generate ${pendingCount} data dummy GAKIN. Login dengan NIK 3578000000000001 s/d ${String(pendingCount).padStart(10, "0").replace(/^0+/, "") || "0"}.`);
  };

  const handleClear = () => {
    clearDummies();
    setCurrentCount(0);
    setShowClearConfirm(false);
    triggerAlert("Seluruh data dummy berhasil dihapus.", "warning");
  };

  const handleCustomGenerate = () => {
    const count = parseInt(inputCount, 10);
    if (!count || count < 1 || count > 500) {
      triggerAlert("Jumlah harus antara 1 - 500.", "warning");
      return;
    }
    handleGenerate(count);
  };

  // Get preview of dummy users for the info card
  const dummyUsers = getDummyUsers();
  const gakinDummies = dummyUsers.filter(u => u.gakinStatus === "GAKIN");
  const nonGakinDummies = dummyUsers.filter(u => u.gakinStatus !== "GAKIN");

  return (
    <AdminLayout title="Kelola Data Dummy" headerIcon={<TestTube2 className="w-4 h-4" />}>

      {/* ── ALERT ── */}
      {showAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'opacity-100 translate-y-0'}`}>
          <div className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 flex items-start gap-4 ${alertType === "success" ? "border-emerald-500/40 bg-emerald-900/30" : "border-orange-500/40 bg-orange-900/30"}`}>
            <div className={`p-2 rounded-xl border shrink-0 ${alertType === "success" ? "border-emerald-200 bg-emerald-100" : "border-orange-200 bg-orange-100"}`}>
              {alertType === "success" ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-orange-600" />}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">{alertType === "success" ? "Berhasil" : "Perhatian"}</h3>
              <p className={`text-xs ${alertType === "success" ? "text-emerald-100" : "text-orange-100"}`}>{alertMsg}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3 text-gray-900">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500 border border-purple-500/30"><TestTube2 className="w-6 h-6" /></div>
          Manajemen Data Dummy
        </h1>
        <p className="mt-1 text-gray-600">
          Generate data responden dummy untuk uji coba. Dummy akan terdaftar sebagai <strong>GAKIN</strong> dan bisa langsung login untuk mengisi kuesioner.
        </p>
      </motion.div>

      {/* ── STATS CARDS ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        <div className="bg-white/95 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><Hash className="w-5 h-5 text-blue-500" /></div>
            <span className="text-sm font-medium text-gray-500">Total Dummy</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{currentCount}</p>
          <p className="text-xs text-gray-400 mt-1">akun dummy terdaftar</p>
        </div>

        <div className="bg-white/95 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><UserPlus className="w-5 h-5 text-emerald-500" /></div>
            <span className="text-sm font-medium text-gray-500">Status GAKIN</span>
          </div>
          <p className="text-3xl font-black text-emerald-600">{gakinDummies.length}</p>
          <p className="text-xs text-gray-400 mt-1">aktif sebagai GAKIN</p>
        </div>

        <div className="bg-white/95 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20"><Users className="w-5 h-5 text-orange-500" /></div>
            <span className="text-sm font-medium text-gray-500">Non-GAKIN (dihapus)</span>
          </div>
          <p className="text-3xl font-black text-orange-600">{nonGakinDummies.length}</p>
          <p className="text-xs text-gray-400 mt-1">sudah dipindahkan</p>
        </div>

      </motion.div>

      {/* ── QUICK GENERATE ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white/95 border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">

        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> Generate Data Dummy
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Pilih jumlah preset atau masukkan jumlah custom. Data dummy lama akan di-<strong>replace</strong> dengan yang baru.
        </p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-3 mb-5">
          {PRESET_COUNTS.map(count => (
            <button key={count} onClick={() => handleGenerate(count)}
              className={`px-5 py-3 rounded-xl text-sm font-bold border transition-all shadow-sm ${
                currentCount === count
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-400"
              }`}>
              {count} Dummy
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="number" min="1" max="500" value={inputCount}
              onChange={e => setInputCount(e.target.value)}
              placeholder="Jumlah custom (1-500)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm"
            />
          </div>
          <button onClick={handleCustomGenerate}
            className="px-5 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Generate
          </button>
        </div>
      </motion.div>

      {/* ── INFO CARD ── */}
      {currentCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/95 border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">

          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" /> Info Login Dummy
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>NIK untuk login:</strong>
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                  3578000000000001
                </span>
                <span className="text-xs text-gray-400">→ Responden Dummy 1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                  3578000000000002
                </span>
                <span className="text-xs text-gray-400">→ Responden Dummy 2</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">... sampai</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                  357800{String(currentCount).padStart(10, "0")}
                </span>
                <span className="text-xs text-gray-400">→ Responden Dummy {currentCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Kuesioner belum diisi.</strong> Login dengan NIK dummy di atas, lalu isi kuesioner secara manual untuk melihat hasil scoring & klaster.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── DANGER ZONE ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/95 border border-red-200 rounded-2xl p-6 shadow-sm">

        <h2 className="text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
          <Trash2 className="w-5 h-5" /> Hapus Semua Dummy
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Menghapus seluruh data dummy dari sistem. Data hardcoded tidak akan terpengaruh.
        </p>
        <button onClick={() => setShowClearConfirm(true)} disabled={currentCount === 0}
          className="px-5 py-3 rounded-xl text-sm font-bold bg-red-600 text-white border border-red-500 shadow-lg shadow-red-500/25 hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Trash2 className="w-4 h-4" /> Hapus {currentCount} Data Dummy
        </button>
      </motion.div>

      {/* ── CLEAR CONFIRM MODAL ── */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setShowClearConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm relative z-10 shadow-2xl backdrop-blur-md border rounded-3xl p-6 text-center bg-white/5 border-white/20">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Hapus Semua Dummy?</h3>
              <p className="text-[13px] text-blue-100/80 mb-5">
                {currentCount} data dummy akan dihapus permanen dari sistem.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-medium text-sm">Batal</button>
                <button onClick={handleClear}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm border border-red-500/50 shadow-lg">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── GENERATE CONFIRM MODAL ── */}
      <AnimatePresence>
        {showGenerateConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setShowGenerateConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm relative z-10 shadow-2xl backdrop-blur-md border rounded-3xl p-6 text-center bg-white/5 border-white/20">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Generate {pendingCount} Dummy?</h3>
              <p className="text-[13px] text-blue-100/80 mb-5">
                {currentCount > 0 ? `${currentCount} dummy lama akan di-replace dengan ${pendingCount} dummy baru.` : `${pendingCount} data dummy GAKIN akan dibuat.`}
                <br/><span className="text-blue-200/60 text-[11px]">Kuesioner belum diisi — anda bisa mengisinya sendiri.</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowGenerateConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-medium text-sm">Batal</button>
                <button onClick={confirmGenerate}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm border border-blue-500/50 shadow-lg">Ya, Generate</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}
