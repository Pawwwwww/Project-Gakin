import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Presentation, Brain, Layers, ArrowRight, Lock } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion } from "motion/react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useNavigate, useLocation } from "react-router";
import { useAdminTheme } from "../../hooks/AdminThemeContext";

const PRODUCTIVE_AGE_DATA = [
  { age: "18-25", jumlah: 120 },
  { age: "26-35", jumlah: 450 },
  { age: "36-45", jumlah: 380 },
  { age: "46-55", jumlah: 200 },
  { age: "56+", jumlah: 97 },
];

const CLUSTER_MONTHLY_DATA = [
  { bulan: "Jan", klaster1: 45, klaster2: 30, klaster3: 55, klaster4: 20 },
  { bulan: "Feb", klaster1: 60, klaster2: 42, klaster3: 48, klaster4: 35 },
  { bulan: "Mar", klaster1: 80, klaster2: 55, klaster3: 62, klaster4: 40 },
  { bulan: "Apr", klaster1: 95, klaster2: 68, klaster3: 70, klaster4: 52 },
  { bulan: "Mei", klaster1: 110, klaster2: 75, klaster3: 85, klaster4: 60 },
  { bulan: "Jun", klaster1: 130, klaster2: 90, klaster3: 95, klaster4: 72 },
  { bulan: "Jul", klaster1: 120, klaster2: 85, klaster3: 100, klaster4: 68 },
  { bulan: "Agu", klaster1: 140, klaster2: 98, klaster3: 110, klaster4: 80 },
  { bulan: "Sep", klaster1: 155, klaster2: 105, klaster3: 120, klaster4: 88 },
  { bulan: "Okt", klaster1: 170, klaster2: 115, klaster3: 130, klaster4: 95 },
  { bulan: "Nov", klaster1: 185, klaster2: 125, klaster3: 140, klaster4: 102 },
  { bulan: "Des", klaster1: 200, klaster2: 138, klaster3: 155, klaster4: 110 },
];

const CLUSTER_COLORS = {
  klaster1: "#ef4444", // red-500
  klaster2: "#f97316", // orange-500
  klaster3: "#eab308", // yellow-500
  klaster4: "#22c55e", // green-500
};

const PIE_DATA = [
  { name: "Klaster 1", value: 200, color: CLUSTER_COLORS.klaster1 },
  { name: "Klaster 2", value: 138, color: CLUSTER_COLORS.klaster2 },
  { name: "Klaster 3", value: 155, color: CLUSTER_COLORS.klaster3 },
  { name: "Klaster 4", value: 110, color: CLUSTER_COLORS.klaster4 },
];

const TOTAL_PIE_VALUE = PIE_DATA.reduce((acc, curr) => acc + curr.value, 0);

export default function Analytics() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const userRole = localStorage.getItem("role") || "";
  const { isDark } = useAdminTheme();

  const [activePieIndex, setActivePieIndex] = useState<number>(-1);
  const [mountedPieData, setMountedPieData] = useState<any[]>([]);

  useEffect(() => {
    setMountedPieData([]);
    const t = setTimeout(() => {
      setMountedPieData(PIE_DATA);
    }, 150);
    return () => clearTimeout(t);
  }, [location.key]);

  // Theme configuration
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const hoverCardBg = isDark ? "hover:border-red-500/30 hover:bg-white/10" : "hover:border-red-500/50 hover:bg-white hover:shadow-lg";
  const detailBg = isDark ? "bg-white/[0.02] border-gray-700 hover:bg-gray-800" : "bg-gray-50 border-gray-300 hover:bg-gray-100";
  const glowLight = isDark ? "bg-red-600/10" : "bg-red-600/5";

  // Recharts specific colors
  const gridStroke = isDark ? "#ffffff10" : "#00000010";
  const axisStroke = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#111" : "#fff";
  const tooltipBorder = isDark ? "#ffffff20" : "#e5e7eb";
  const tooltipText = isDark ? "#fff" : "#111";

  // Restricted Access Colors
  const overlayBg = isDark ? "bg-[#0a0a0a]/80" : "bg-gray-50/80";

  return (
    <AdminLayout title="Analytics & Statistik" headerIcon={<BarChart3 className="w-4 h-4" />}>
      <div className={userRole.startsWith("anggota") ? "h-[calc(100vh-100px)] overflow-hidden dark-scrollbar relative" : "dark-scrollbar shrink-0"}>
      
      {/* ── ACCESS DENIED OVERLAY (Only for anggota) ── */}
      {userRole.startsWith("anggota") && (
        <div className={`absolute inset-0 z-[100] backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none rounded-[32px] ${overlayBg}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col items-center"
          >
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md shadow-2xl ${isDark ? "bg-red-500/10 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]" : "bg-red-50 border-red-200 shadow-red-500/10"}`}>
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className={`text-3xl font-black mb-3 tracking-tight ${textPrimary}`}>Akses Dibatasi</h2>
            <p className={`max-w-md text-sm leading-relaxed ${textSecondary}`}>
              Maaf, akun dengan peran <span className={`font-semibold px-2 py-0.5 rounded-md mx-1 ${isDark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900"}`}>Anggota</span> tidak memiliki izin untuk melihat modul <span className="text-red-500 font-medium">Analytics & Statistik</span>.
            </p>
          </motion.div>
        </div>
      )}

      {/* ── HEADER SUMMARY ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
            <TrendingUp className="w-6 h-6 shadow-inner" />
          </div>
          Pusat Statistik Analytics
        </h1>
        <p className={`mt-1 ${textSecondary}`}>
          Analisis mendetail partisipasi responden kuesioner, distribusi demografis, dan kemajuan pengisian modul.
        </p>
      </motion.div>

      {/* ── HIGHLIGHT CARDS (2 cards) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button whileHover={{ y: -4, scale: 1.01 }} className={`shadow-sm backdrop-blur-xl rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between text-left group transition-all ${cardBg} ${hoverCardBg}`}>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 blur-[30px] rounded-full transition-opacity group-hover:opacity-40 bg-red-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className={`text-sm font-medium ${textSecondary}`}>Produktif & Aktif</p>
               <h3 className={`text-3xl font-black mt-1 drop-shadow-sm ${textPrimary}`}>830</h3>
             </div>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:rotate-6 ${isDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-50 text-red-500 border-red-200"}`}>
               <Brain className="w-6 h-6 drop-shadow-md" />
             </div>
          </div>
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border relative z-10 w-fit ${isDark ? "bg-red-500/10 text-emerald-400 border-red-500/20" : "bg-red-50 text-emerald-600 border-red-200"}`}>
            +15% Responden Usia Produktif
          </span>
        </motion.button>

        <motion.button whileHover={{ y: -4, scale: 1.01 }} className={`shadow-sm backdrop-blur-xl rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between text-left group transition-all ${cardBg} ${isDark ? "hover:border-gray-500/50 hover:bg-white/10" : "hover:border-gray-400 hover:bg-white hover:shadow-lg"}`}>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 blur-[30px] rounded-full transition-opacity group-hover:opacity-40 bg-gray-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className={`text-sm font-medium ${textSecondary}`}>Rata-rata Penyelesaian</p>
               <h3 className={`text-3xl font-black mt-1 drop-shadow-sm ${textPrimary}`}>4m 12s</h3>
             </div>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:rotate-6 ${isDark ? "bg-gray-700/50 text-gray-400 border-gray-600/50" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
               <Presentation className="w-6 h-6 drop-shadow-md" />
             </div>
          </div>
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border relative z-10 w-fit ${isDark ? "bg-gray-500/10 text-emerald-400 border-gray-500/20" : "bg-gray-100 text-emerald-600 border-gray-200"}`}>
            Berdasarkan data tersimpan
          </span>
        </motion.button>
      </motion.div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Usia Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col ${cardBg}`}
        >
          <div className="mb-6">
            <h3 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
              <Users className="w-5 h-5 text-red-500" /> Demografi Usia Responden
            </h3>
            <p className={`text-sm mt-1 ${textSecondary}`}>Distribusi usia aktif yang mengisi kuesioner.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={location.key} data={PRODUCTIVE_AGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="age" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText }} />
                <Area type="monotone" dataKey="jumlah" name="Jumlah" stroke="#ef4444" fillOpacity={1} fill="url(#colorUsia)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Analisis Klaster - Ring Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col group transition-all duration-300 relative overflow-hidden ${cardBg} hover:border-red-500/40 ${isDark ? "hover:bg-white/[0.07]" : "hover:bg-white/90"}`}
        >
          <div className={`absolute top-0 right-0 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />
          
          <div className="mb-2 relative z-10 flex justify-between items-start">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
                <Layers className="w-5 h-5 text-red-500" /> Analisis Klaster
              </h3>
              <p className={`text-sm mt-1 ${textSecondary}`}>Proporsi persebaran responden di 4 klaster utama.</p>
            </div>
            {/* CTA Indicator */}
            <div onClick={() => navigate("/admin/analytics/cluster-detail")}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 cursor-pointer transition-all border ${isDark ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20" : "bg-red-50 hover:bg-red-100 border-red-200"}`}
            >
              <ArrowRight className="w-5 h-5 text-red-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={`pie-${location.key}`}>
                  <Tooltip cursor={false} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                  <Pie data={mountedPieData} innerRadius="65%" outerRadius="90%" paddingAngle={3} dataKey="value" stroke="none"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(-1)}>
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} 
                        style={{ transition: 'all 0.3s ease', filter: activePieIndex === index ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none',
                          transform: activePieIndex === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center' }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-3xl font-black ${textPrimary}`}>4</span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Klaster</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3 w-full">
              {PIE_DATA.map((item, i) => (
                <div key={i} onMouseEnter={() => setActivePieIndex(i)} onMouseLeave={() => setActivePieIndex(-1)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-300 ${activePieIndex === i ? `${detailBg} scale-105 shadow-md` : `${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-gray-200"}`}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                    <span className={`text-sm font-semibold ${textPrimary}`}>{item.name}</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded text-sm ${isDark ? "text-white bg-white/10" : "text-gray-900 bg-gray-100"}`}>
                    {((item.value / TOTAL_PIE_VALUE) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tren Klaster Per Bulan - Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col lg:col-span-2 relative overflow-hidden ${cardBg}`}
        >
          <div className="mb-6 relative z-10 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
                <TrendingUp className="w-5 h-5 text-red-500" /> Tren Klaster Per Bulan
              </h3>
              <p className={`text-sm mt-1 ${textSecondary}`}>Perkembangan jumlah responden per klaster setiap bulan.</p>
            </div>
            <div className={`hidden sm:flex items-center gap-4 mt-2 sm:mt-0 px-4 py-2 shadow-sm rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-300"}`}>
              {[1, 2, 3, 4].map((klaster) => (
                <div key={klaster} className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[`klaster${klaster}` as keyof typeof CLUSTER_COLORS] }}></span> K{klaster}
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={`cluster-${location.key}`} data={CLUSTER_MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {[1, 2, 3, 4].map((k) => (
                    <linearGradient key={`colorK${k}`} id={`colorK${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CLUSTER_COLORS[`klaster${k}` as keyof typeof CLUSTER_COLORS]} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={CLUSTER_COLORS[`klaster${k}` as keyof typeof CLUSTER_COLORS]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="bulan" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                
                <Area type="monotone" dataKey="klaster4" name="Klaster 4" stroke={CLUSTER_COLORS.klaster4} fillOpacity={1} fill="url(#colorK4)" strokeWidth={2} />
                <Area type="monotone" dataKey="klaster3" name="Klaster 3" stroke={CLUSTER_COLORS.klaster3} fillOpacity={1} fill="url(#colorK3)" strokeWidth={2} />
                <Area type="monotone" dataKey="klaster2" name="Klaster 2" stroke={CLUSTER_COLORS.klaster2} fillOpacity={1} fill="url(#colorK2)" strokeWidth={2} />
                <Area type="monotone" dataKey="klaster1" name="Klaster 1" stroke={CLUSTER_COLORS.klaster1} fillOpacity={1} fill="url(#colorK1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      </div>
    </AdminLayout>
  );
}
