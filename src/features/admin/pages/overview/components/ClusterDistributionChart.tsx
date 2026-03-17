import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from "recharts";
import { motion } from "motion/react";
import { useAdminTheme } from "../../../hooks/AdminThemeContext";

const BAR_DATA = [
  { name: "K 1", jumlah: 300, fill: "#ef4444" }, // red-500
  { name: "K 2", jumlah: 500, fill: "#f97316" }, // orange-500
  { name: "K 3", jumlah: 200, fill: "#eab308" }, // yellow-500
  { name: "K 4", jumlah: 247, fill: "#22c55e" }, // green-500
];

export function ClusterDistributionChart() {
  const { isDark } = useAdminTheme();
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const handleClick = (_data: any, index: number) => {
    setActiveIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const getBarFill = (index: number, defaultColor: string) => {
    if (activeIndices.length === 0) return defaultColor;
    return activeIndices.includes(index) ? defaultColor : (isDark ? "#374151" : "#e5e7eb");
  };

  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const glowEffect = isDark ? "bg-red-600/20" : "bg-red-600/10";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col relative overflow-hidden group ${cardBg}`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 ${glowEffect} blur-[80px] rounded-full pointer-events-none`} />
      <div className="relative z-10">
        <h3 className={`font-bold mb-2 flex items-center gap-2 ${textPrimary}`}>
          <BarChart3 className="w-5 h-5 text-red-500" /> Distribusi Klaster
        </h3>
        <p className={`text-sm mb-6 ${textSecondary}`}>Jumlah responden berdasarkan pembagian klaster</p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} onClick={(e: any) => e && handleClick(null, e.activeTooltipIndex)}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff15" : "#00000015"} vertical={false} />
              <XAxis dataKey="name" stroke={isDark ? "#9ca3af" : "#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={isDark ? "#9ca3af" : "#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={false} content={() => null} />
              <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} cursor="pointer">
                <LabelList dataKey="jumlah" position="top" fill={isDark ? "#fff" : "#111"} fontSize={14} fontWeight="bold"
                  content={({ x, y, width, value, index }: any) => {
                    if (activeIndices.length > 0 && !activeIndices.includes(index)) return null;
                    if (activeIndices.length === 0) return null;
                    return (
                      <text x={x + width / 2} y={y - 6} textAnchor="middle" fill={isDark ? "#fff" : "#111"} fontSize={14} fontWeight="bold"
                        style={{ filter: `drop-shadow(0 0 4px ${BAR_DATA[index]?.fill || '#fff'})` }}>
                        {value}
                      </text>
                    );
                  }}
                />
                {BAR_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarFill(index, entry.fill)}
                    style={{ 
                      transition: 'all 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
                      opacity: activeIndices.length === 0 || activeIndices.includes(index) ? 1 : 0.15,
                      transform: activeIndices.includes(index) ? 'scaleY(1.05)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                      filter: activeIndices.includes(index) ? `drop-shadow(0 0 12px ${entry.fill})` : 'none'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
