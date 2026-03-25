import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from "recharts";
import { motion } from "motion/react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";

export function ClusterDistributionChart() {
  const stats = useDashboardStats();

  const BAR_DATA = [
    { name: "K 1", jumlah: stats.clusterCounts[0], fill: "#2563eb" }, // red-500
    { name: "K 2", jumlah: stats.clusterCounts[1], fill: "#f97316" }, // orange-500
    { name: "K 3", jumlah: stats.clusterCounts[2], fill: "#eab308" }, // yellow-500
    { name: "K 4", jumlah: stats.clusterCounts[3], fill: "#22c55e" }, // green-500
  ];

  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";
  const glowEffect = "bg-blue-600/10";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className={`h-full shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col relative overflow-hidden group ${cardBg}`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 ${glowEffect} blur-[80px] rounded-full pointer-events-none`} />
      <div className="relative z-10 flex flex-col flex-1 h-full">
        <h3 className={`font-bold mb-2 flex items-center gap-2 ${textPrimary}`}>
          <BarChart3 className="w-5 h-5 text-blue-500" /> Distribusi Klaster
        </h3>
        <p className={`text-sm mb-6 ${textSecondary}`}>Jumlah responden berdasarkan pembagian klaster</p>
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BAR_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={"#00000015"} vertical={false} />
              <XAxis dataKey="name" stroke={"#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={"#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={false} content={() => null} />
              <Bar 
                dataKey="jumlah" 
                radius={[6, 6, 0, 0]} 
                isAnimationActive={true} 
                animationDuration={1500} 
                animationEasing="ease-out"
              >
                <LabelList dataKey="jumlah" position="top" fill={"#111"} fontSize={14} fontWeight="bold"
                  content={({ x, y, width, value, index }: any) => {
                    if (value === 0) return null;
                    return (
                      <text x={x + width / 2} y={y - 6} textAnchor="middle" fill={"#111"} fontSize={14} fontWeight="bold"
                        style={{ filter: `drop-shadow(0 0 4px ${BAR_DATA[index]?.fill || '#fff'})` }}>
                        {value}
                      </text>
                    );
                  }}
                />
                {BAR_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill}
                    style={{ 
                      transition: 'all 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
                      opacity: 1,
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
