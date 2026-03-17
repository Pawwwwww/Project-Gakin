import { useState } from "react";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import { useAdminTheme } from "../../../hooks/AdminThemeContext";

export function TotalRespondenCard() {
  const { isDark } = useAdminTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const hoverCardBg = isDark ? "hover:border-blue-400/30" : "hover:border-blue-400";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
          {/* FRONT SIDE (Original Split View) */}
          <div className={`absolute inset-0 backface-hidden rounded-2xl border ${cardBg} backdrop-blur-xl ${hoverCardBg} transition-colors overflow-hidden flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6`}>
            <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10 blur-[30px] rounded-full transition-opacity group-hover:opacity-20 bg-blue-500" />
            
            {/* Left side: Icon & Total */}
            <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-white/10 pb-4 sm:pb-0 sm:pr-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border bg-blue-500/10 text-blue-500 border-blue-500/20 transition-transform duration-300 group-hover:scale-105 shrink-0">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md" />
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-medium mb-1 ${textSecondary}`}>Total Responden</h3>
                <p className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-sm ${textPrimary}`}>1.247</p>
              </div>
            </div>

            {/* Right side: Breakdown */}
            <div className="flex flex-col gap-2 flex-1 justify-center relative z-10">
              <div className={`flex justify-between items-center border p-2 sm:p-2.5 rounded-lg ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <span className={`text-xs font-semibold ${textSecondary}`}>GAKIN</span>
                <div className="text-right">
                  <span className={`text-sm font-bold ${textPrimary}`}>500</span>
                  <span className={`text-[10px] ml-1.5 ${textSecondary}`}>dari 2.000 terdata</span>
                </div>
              </div>
              <div className={`flex justify-between items-center border p-2 sm:p-2.5 rounded-lg ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <span className={`text-xs font-semibold ${textSecondary}`}>Non-GAKIN</span>
                <div className="text-right">
                  <span className={`text-sm font-bold ${textPrimary}`}>747</span>
                  <span className={`text-[10px] ml-1.5 ${textSecondary}`}>responden sukarela</span>
                </div>
              </div>
            </div>


          </div>

          {/* BACK SIDE (Definitions) */}
          <div 
            className={`absolute inset-0 backface-hidden flex items-center p-6 rounded-2xl border ${cardBg} backdrop-blur-xl shadow-lg leading-relaxed`}
            style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full h-full">
              <div className={`flex-1 p-4 rounded-xl border flex flex-col justify-center ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <span className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${textPrimary}`}>
                  <Users className="w-3.5 h-3.5 text-blue-500" /> GAKIN
                </span>
                <p className={`text-[11px] sm:text-xs ${textSecondary}`}>
                  Keluarga Miskin berdasarkan database terpadu pemerintah kota terbaru. Data ini diambil dan diverifikasi secara langsung dari sistem instansi terkait.
                </p>
              </div>
              
              <div className={`flex-1 p-4 rounded-xl border flex flex-col justify-center ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <span className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${textPrimary}`}>
                  <Users className="w-3.5 h-3.5 text-gray-500" /> Non-GAKIN
                </span>
                <p className={`text-[11px] sm:text-xs ${textSecondary}`}>
                  Masyarakat umum yang berinisiatif secara sukarela mengisi kuesioner pendataan mandiri tanpa masuk ke dalam database GAKIN pusat.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
