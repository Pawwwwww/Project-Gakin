import { useState } from "react";
import { Award, Info } from "lucide-react";
import { motion } from "motion/react";
import { useAdminTheme } from "../../../hooks/AdminThemeContext";

const CLUSTER_DESCRIPTIONS = [
  {
    name: "Klaster 1",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    desc: "Kapasitas rendah. Responden pada klaster ini memiliki skor GRIT, TIPI, dan KWU yang rendah. Memerlukan intervensi menyeluruh untuk pengembangan potensi wirausaha.",
  },
  {
    name: "Klaster 2",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    desc: "Kapasitas sedang-aktif. Responden memiliki semangat dan niat usaha yang cukup baik, namun ketekunan dan kepribadian berwirausaha masih perlu dikembangkan.",
  },
  {
    name: "Klaster 3",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    desc: "Kapasitas berkembang. Responden memiliki potensi kepribadian dan kewirausahaan yang mulai menonjol, hanya perlu penguatan ketekunan jangka panjang.",
  },
  {
    name: "Klaster 4",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    desc: "Kapasitas tinggi. Responden memiliki skor tertinggi pada semua dimensi. Siap mandiri dan dapat dijadikan model untuk intervensi wirausaha lanjutan.",
  },
];

export function KlasterTerbanyakCard() {
  const { isDark } = useAdminTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";

  const totalResponden = 1247;
  const klaster2Count = 500;
  const pct = Math.round((klaster2Count / totalResponden) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="h-full"
    >
      <div
        className="relative w-full h-full min-h-[320px] cursor-pointer perspective-[1000px] group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative transition-all duration-500"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT SIDE */}
          <div className={`absolute inset-0 backface-hidden rounded-2xl border p-6 flex flex-col items-center justify-center text-center overflow-hidden ${cardBg} backdrop-blur-xl`}>
            <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10 blur-[30px] rounded-full transition-opacity group-hover:opacity-20 bg-orange-500" />
            <div className="w-20 h-20 rounded-full flex items-center justify-center border bg-orange-500/10 text-orange-500 border-orange-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-10 h-10 drop-shadow-md" />
            </div>
            <h3 className={`text-base font-medium mb-1 ${textSecondary}`}>Klaster Terbanyak</h3>
            <p className={`text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm mb-3 ${textPrimary}`}>Klaster 2</p>
            <p className={`text-sm font-medium ${textSecondary}`}>
              Mendominasi <span className="font-bold text-orange-500">{pct}%</span> dari total responden
            </p>
            <div className={`mt-5 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${isDark ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
              <Info className="w-3.5 h-3.5" /> Klik untuk lihat deskripsi klaster
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className={`absolute inset-0 backface-hidden rounded-2xl border p-5 overflow-y-auto ${cardBg} backdrop-blur-xl`}
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
            <h4 className={`text-sm font-bold mb-3 ${textPrimary}`}>Deskripsi Klaster</h4>
            <div className="space-y-2.5">
              {CLUSTER_DESCRIPTIONS.map((c, i) => (
                <div key={i} className={`p-3 rounded-xl border flex gap-3 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <span className={`shrink-0 text-xs font-bold w-16 mt-0.5 px-1.5 py-0.5 rounded-md text-center border ${c.color}`}>{c.name}</span>
                  <p className={`text-[11px] leading-relaxed ${textSecondary}`}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
