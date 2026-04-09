import { ClipboardList } from "lucide-react";
import { motion } from "motion/react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";

const CLUSTER_COLORS = [
  { bar: "bg-blue-500", label: "text-blue-600", badge: "bg-blue-500/15 text-blue-600 border-blue-500/25" },
  { bar: "bg-violet-500", label: "text-violet-600", badge: "bg-violet-500/15 text-violet-600 border-violet-500/25" },
  { bar: "bg-fuchsia-500", label: "text-fuchsia-600", badge: "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/25" },
  { bar: "bg-pink-500", label: "text-pink-600", badge: "bg-pink-500/15 text-pink-600 border-pink-500/25" },
];

export function ClusterProportionDetails() {
  const stats = useDashboardStats();
  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";

  const clusters = [
    { name: "Klaster 1", ...stats.clusterProportions[0], total: stats.clusterCounts[0] },
    { name: "Klaster 2", ...stats.clusterProportions[1], total: stats.clusterCounts[1] },
    { name: "Klaster 3", ...stats.clusterProportions[2], total: stats.clusterCounts[2] },
    { name: "Klaster 4", ...stats.clusterProportions[3], total: stats.clusterCounts[3] },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col relative overflow-hidden ${cardBg}`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="relative z-10">
        <h3 className={`font-bold mb-2 flex items-center gap-2 ${textPrimary}`}>
          <ClipboardList className="w-5 h-5 text-blue-500" /> Detail Proporsi Klaster
        </h3>
        <p className={`text-sm mb-5 ${textSecondary}`}>Rincian data Gakin dan Non-Gakin per klaster</p>
        <div className="space-y-4">
          {clusters.map((c, idx) => {
            const clr = CLUSTER_COLORS[idx];
            const totalInCluster = c.gakin + c.nonGakin;
            const gakinPct = totalInCluster > 0 ? Math.round((c.gakin / totalInCluster) * 100) : 0;
            const nonGakinPct = totalInCluster > 0 ? 100 - gakinPct : 0;

            return (
              <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50 hover:border-gray-300 transition-colors">
                {/* Cluster Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/80">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${clr.badge}`}>
                      {idx + 1}
                    </span>
                    <span className={`font-semibold text-sm ${textPrimary}`}>{c.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${textSecondary}`}>{totalInCluster} responden</span>
                </div>

                {/* Proportion Bar */}
                <div className="px-4 pb-3 pt-1">
                  {totalInCluster > 0 ? (
                    <>
                      <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-200 mb-2.5">
                        {gakinPct > 0 && (
                          <div className="bg-blue-500 transition-all duration-500 rounded-l-full" style={{ width: `${gakinPct}%` }} />
                        )}
                        {nonGakinPct > 0 && (
                          <div className="bg-violet-400 transition-all duration-500 rounded-r-full" style={{ width: `${nonGakinPct}%` }} />
                        )}
                      </div>
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                          <span className={textSecondary}>GAKIN</span>
                          <span className={`font-bold ${textPrimary}`}>{gakinPct}%</span>
                          <span className="text-gray-400">({c.gakin})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
                          <span className={textSecondary}>Non-GAKIN</span>
                          <span className={`font-bold ${textPrimary}`}>{nonGakinPct}%</span>
                          <span className="text-gray-400">({c.nonGakin})</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-1">Belum ada data</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
