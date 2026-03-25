import { useState } from "react";
import { Activity } from "lucide-react";
import { motion } from "motion/react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";

export function UsiaProduktifCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const stats = useDashboardStats();

  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const hoverCardBg = "hover:border-emerald-400";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div
        className="relative w-full h-56 sm:h-44 cursor-pointer perspective-[1000px] group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d transition-all duration-500"
          initial={false}
          animate={{ rotateX: isFlipped ? -180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT SIDE */}
          <div className={`absolute inset-0 backface-hidden flex items-center p-6 pb-8 rounded-2xl border ${cardBg} backdrop-blur-xl ${hoverCardBg} transition-colors overflow-hidden`}>
            <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10 blur-[30px] rounded-full transition-opacity group-hover:opacity-20 bg-emerald-500" />
            
            <div className="flex items-center gap-5 w-full">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 transition-transform duration-300 group-hover:scale-105 shrink-0">
                <Activity className="w-8 h-8 drop-shadow-md" />
              </div>
              <div className="flex-1">
                <h3 className={`text-sm sm:text-base font-medium mb-1 ${textSecondary}`}>Usia Produktif & Aktif</h3>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm ${textPrimary}`}>{stats.usiaProduktifPct}%</p>
                  <span className={`text-xs ${textSecondary}`}>({stats.usiaProduktifCount.toLocaleString('id-ID')} orang)</span>
                </div>
              </div>
            </div>

            <div className={`absolute bottom-2 left-0 right-0 text-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity ${textSecondary}`}>
              <span className="text-[10px] font-medium">Klik untuk melihat informasi detail</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            className={`absolute inset-0 backface-hidden flex items-center p-6 rounded-2xl border ${cardBg} backdrop-blur-xl shadow-lg`}
            style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full h-full">
              <div className={`flex-1 p-3 rounded-xl border flex flex-col justify-center ${"bg-gray-50 border-gray-200"}`}>
                <span className={`text-xs font-bold mb-1 ${textPrimary}`}>USIA PRODUKTIF</span>
                <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                  Responden yang berada dalam rentang usia kerja aktif (15 - 64 tahun) berdasarkan demografi BPS.
                </p>
              </div>
              
              <div className={`flex-1 p-3 rounded-xl border flex flex-col justify-center ${"bg-gray-50 border-gray-200"}`}>
                <span className={`text-xs font-bold mb-1 ${textPrimary}`}>AKTIF BERUSAHA</span>
                <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                  Bagian dari usia produktif yang saat ini mengelola atau memiliki kegiatan usaha mandiri.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
