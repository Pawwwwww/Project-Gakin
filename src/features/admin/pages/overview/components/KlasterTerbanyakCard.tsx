import { useState } from "react";
import { Award, Info, Crown, Medal } from "lucide-react";
import { motion } from "motion/react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";

const CLUSTER_DESCRIPTIONS = [
  {
    name: "Klaster 1",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
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

// Gradient colors: dominant is bold purple/blue, runners-up fade out
const RANK_STYLES = [
  { bg: "bg-gradient-to-r from-blue-600 to-violet-600", text: "text-white", pctColor: "text-white/90", badge: "bg-white/20 text-white border-white/30" },
  { bg: "bg-gradient-to-r from-blue-500/15 to-violet-500/15", text: "text-gray-800", pctColor: "text-violet-600", badge: "bg-violet-500/15 text-violet-600 border-violet-500/25" },
  { bg: "bg-gradient-to-r from-blue-500/8 to-violet-500/8", text: "text-gray-700", pctColor: "text-blue-500", badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { bg: "bg-gradient-to-r from-gray-100 to-gray-50", text: "text-gray-500", pctColor: "text-gray-400", badge: "bg-gray-200/60 text-gray-400 border-gray-300/40" },
];

export function KlasterTerbanyakCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const stats = useDashboardStats();

  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";

  const totalResponden = stats.totalResponden || 1;

  // Build sorted ranking
  const ranked = stats.clusterCounts
    .map((count, idx) => ({
      klaster: idx + 1,
      count,
      pct: Math.round((count / totalResponden) * 100) || 0,
    }))
    .sort((a, b) => b.count - a.count || a.klaster - b.klaster);

  const dominant = ranked[0];

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
          <div className={`absolute inset-0 backface-hidden rounded-2xl border p-5 flex flex-col overflow-hidden ${cardBg} backdrop-blur-xl`}>
            <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10 blur-[30px] rounded-full transition-opacity group-hover:opacity-20 bg-violet-500" />
            
            {/* Dominant cluster hero */}
            <div className="flex flex-col items-center justify-center text-center mb-5 relative z-10 mt-2">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-violet-500/25 mb-3 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Crown className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <h3 className={`text-sm font-medium mb-0.5 ${textSecondary}`}>Dominasi Klaster</h3>
              <p className={`text-4xl font-black tracking-tight ${textPrimary}`}>Klaster {dominant.klaster}</p>
              <p className={`text-xs font-medium mt-1 ${textSecondary}`}>
                Mendominasi <span className="font-bold text-violet-600">{dominant.pct}%</span> dari total responden
              </p>
            </div>

            {/* Ranking rows */}
            <div className="flex flex-col gap-2 flex-1 relative z-10">
              {ranked.map((r, rankIdx) => {
                const style = RANK_STYLES[Math.min(rankIdx, RANK_STYLES.length - 1)];
                const isTop = rankIdx === 0;
                return (
                  <div
                    key={r.klaster}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-all ${style.bg} ${isTop ? "border-violet-500/20 shadow-sm" : "border-transparent"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${style.badge}`}>
                        {isTop ? <Medal className="w-3.5 h-3.5" /> : rankIdx + 1}
                      </span>
                      <span className={`font-semibold text-sm ${style.text}`}>
                        Klaster {r.klaster}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${style.pctColor}`}>{r.pct}%</span>
                      <span className={`text-[10px] ${isTop ? "text-white/60" : "text-gray-400"}`}>({r.count})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`mt-3 text-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity ${textSecondary}`}>
              <span className="text-[10px] font-medium flex items-center justify-center gap-1"><Info className="w-3 h-3" /> Klik untuk lihat deskripsi klaster</span>
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
                <div key={i} className={`p-3 rounded-xl border flex gap-3 ${"bg-gray-50 border-gray-200"}`}>
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
