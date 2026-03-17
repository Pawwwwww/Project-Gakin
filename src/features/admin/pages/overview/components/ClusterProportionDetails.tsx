import { ClipboardList } from "lucide-react";
import { motion } from "motion/react";
import { useAdminTheme } from "../../../hooks/AdminThemeContext";

export function ClusterProportionDetails() {
  const { isDark } = useAdminTheme();

  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const rowHover = isDark ? "hover:bg-white/5 border-white/5" : "hover:bg-gray-50 border-gray-200";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col relative overflow-hidden ${cardBg}`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="relative z-10">
        <h3 className={`font-bold mb-2 flex items-center gap-2 ${textPrimary}`}>
          <ClipboardList className="w-5 h-5 text-red-500" /> Detail Proporsi Klaster
        </h3>
        <p className={`text-sm mb-6 ${textSecondary}`}>Rincian data Gakin dan Non-Gakin per klaster</p>
        <div className="space-y-4">
          {[
            { name: "Klaster 1", gakin: 120, nonGakin: 180, fill: "bg-red-500/20 text-red-500 border-red-500/30" },
            { name: "Klaster 2", gakin: 200, nonGakin: 300, fill: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
            { name: "Klaster 3", gakin: 50,  nonGakin: 150, fill: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
            { name: "Klaster 4", gakin: 30,  nonGakin: 217, fill: "bg-green-500/20 text-green-500 border-green-500/30" },
          ].map((c, idx) => {
            const total = c.gakin + c.nonGakin;
            const gakinPct = Math.round((c.gakin / total) * 100);
            const nonGakinPct = 100 - gakinPct;

            return (
              <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${rowHover}`}>
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shadow-inner font-bold text-sm border ${c.fill}`}>{idx + 1}</span>
                  <span className={`font-semibold tracking-wide ${textPrimary}`}>{c.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex flex-col items-end">
                    <span className={`text-xs uppercase tracking-wider ${textSecondary}`}>Gakin</span>
                    <span className={`font-bold ${textPrimary}`}>{gakinPct}%</span>
                  </div>
                  <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-gray-200"}`}></div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs uppercase tracking-wider ${textSecondary}`}>Non-Gakin</span>
                    <span className={`font-bold ${textPrimary}`}>{nonGakinPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
