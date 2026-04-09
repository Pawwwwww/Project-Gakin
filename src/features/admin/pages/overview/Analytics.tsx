import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Presentation, Brain, Layers, ArrowRight, Lock } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion } from "motion/react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useNavigate, useLocation } from "react-router";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useAdvancedAnalytics } from "../../hooks/useAdvancedAnalytics";

const CLUSTER_COLORS = {
  klaster1: "#3b82f6",
  klaster2: "#8b5cf6",
  klaster3: "#d946ef",
  klaster4: "#ec4899",
};

export default function Analytics() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const userRole = localStorage.getItem("role") || "";
  const [activePieIndex, setActivePieIndex] = useState<number>(-1);
  const [mountedPieData, setMountedPieData] = useState<any[]>([]);

  const stats = useDashboardStats();
  const advancedStats = useAdvancedAnalytics();
  
  const m = Math.floor(advancedStats.avgCompletionTimeSeconds / 60);
  const s = advancedStats.avgCompletionTimeSeconds % 60;
  const timeStr = `${m}m ${s}s`;
  
  const PIE_DATA = [
    { name: "Klaster 1", value: stats.clusterCounts[0], color: CLUSTER_COLORS.klaster1 },
    { name: "Klaster 2", value: stats.clusterCounts[1], color: CLUSTER_COLORS.klaster2 },
    { name: "Klaster 3", value: stats.clusterCounts[2], color: CLUSTER_COLORS.klaster3 },
    { name: "Klaster 4", value: stats.clusterCounts[3], color: CLUSTER_COLORS.klaster4 },
  ];
  
  const TOTAL_PIE_VALUE = PIE_DATA.reduce((acc, curr) => acc + curr.value, 0) || 1;



  useEffect(() => {
    setMountedPieData([]);
    const t = setTimeout(() => {
      setMountedPieData(PIE_DATA);
    }, 150);
    return () => clearTimeout(t);
  }, [location.key, stats.totalResponden]);

  // Theme configuration
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";
  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const hoverCardBg = "hover:border-blue-500/50 hover:bg-white hover:shadow-lg";
  const detailBg = "bg-gray-50 border-gray-300 hover:bg-gray-100";
  const glowLight = "bg-blue-600/5";

  // Recharts specific colors
  const gridStroke = "#00000010";
  const axisStroke = "#6b7280";
  const tooltipBg = "#fff";
  const tooltipBorder = "#e5e7eb";
  const tooltipText = "#111";

  // Restricted Access Colors
  const overlayBg = "bg-gray-50/80";

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
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md shadow-2xl ${"bg-blue-50 border-blue-200 shadow-blue-500/10"}`}>
              <Lock className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className={`text-3xl font-black mb-3 tracking-tight ${textPrimary}`}>Akses Dibatasi</h2>
            <p className={`max-w-md text-sm leading-relaxed ${textSecondary}`}>
              Maaf, akun dengan peran <span className={`font-semibold px-2 py-0.5 rounded-md mx-1 ${"bg-gray-200 text-gray-900"}`}>Anggota</span> tidak memiliki izin untuk melihat modul <span className="text-blue-500 font-medium">Analytics & Statistik</span>.
            </p>
          </motion.div>
        </div>
      )}

      {/* ── HEADER SUMMARY ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
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
          <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 blur-[30px] rounded-full transition-opacity group-hover:opacity-40 bg-blue-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className={`text-sm font-medium ${textSecondary}`}>Produktif & Aktif</p>
               <h3 className={`text-3xl font-black mt-1 drop-shadow-sm ${textPrimary}`}>{stats.usiaProduktifCount.toLocaleString('id-ID')}</h3>
             </div>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:rotate-6 ${"bg-blue-50 text-blue-500 border-blue-200"}`}>
               <Brain className="w-6 h-6 drop-shadow-md" />
             </div>
          </div>
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border relative z-10 w-fit ${"bg-blue-50 text-emerald-600 border-blue-200"}`}>
            {stats.usiaProduktifPct}% dari Total Responden
          </span>
        </motion.button>

        <motion.button whileHover={{ y: -4, scale: 1.01 }} className={`shadow-sm backdrop-blur-xl rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between text-left group transition-all ${cardBg} ${"hover:border-gray-400 hover:bg-white hover:shadow-lg"}`}>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 blur-[30px] rounded-full transition-opacity group-hover:opacity-40 bg-gray-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className={`text-sm font-medium ${textSecondary}`}>Rata-rata Penyelesaian</p>
               <h3 className={`text-3xl font-black mt-1 drop-shadow-sm ${textPrimary}`}>{timeStr}</h3>
             </div>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:rotate-6 ${"bg-gray-100 text-gray-500 border-gray-200"}`}>
               <Presentation className="w-6 h-6 drop-shadow-md" />
             </div>
          </div>
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border relative z-10 w-fit ${"bg-gray-100 text-emerald-600 border-gray-200"}`}>
            Berdasarkan {stats.totalResponden.toLocaleString('id-ID')} data
          </span>
        </motion.button>
      </motion.div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Analisis Klaster - Ring Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col group transition-all duration-300 relative overflow-hidden ${cardBg} hover:border-blue-500/40 hover:bg-white/90`}
        >
          <div className={`absolute top-0 right-0 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />
          
          <div className="mb-2 relative z-10 flex justify-between items-start">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
                <Layers className="w-5 h-5 text-blue-500" /> Analisis Klaster
              </h3>
              <p className={`text-sm mt-1 mb-2 ${textSecondary}`}>Proporsi klaster keseluruhan.</p>
            </div>
            {/* CTA Indicator */}
            <div onClick={() => navigate("/admin/analytics/cluster-detail")}
              className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center hover:scale-110 cursor-pointer transition-all border ${detailBg}`}
            >
              <ArrowRight className="w-4 h-4 text-blue-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 flex flex-col relative z-10 mt-1">
            <div className="w-full h-[180px] relative shrink-0 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={`pie-${location.key}`}>
                  <Tooltip cursor={false} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                  <Pie data={mountedPieData} innerRadius="65%" outerRadius="90%" paddingAngle={3} dataKey="value" stroke="none"
                    animationDuration={1500}
                    animationEasing="ease-out"
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
                <span className={`text-3xl font-black ${textPrimary}`}>{stats.totalResponden}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {PIE_DATA.map((item, i) => (
                <div key={i} onMouseEnter={() => setActivePieIndex(i)} onMouseLeave={() => setActivePieIndex(-1)}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${activePieIndex === i ? `${detailBg} scale-105 shadow-sm` : `bg-white border-gray-100`}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className={`text-[11px] font-semibold ${textPrimary}`}>{item.name}</span>
                  </div>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] text-gray-900 bg-gray-100`}>
                    {((item.value / TOTAL_PIE_VALUE) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Profil Demografi (Large Card) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col group transition-all duration-300 relative overflow-hidden lg:col-span-2 ${cardBg} hover:border-emerald-500/40 hover:bg-white/90`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="mb-4 relative z-10 flex justify-between items-start">
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${textPrimary}`}>
                <Brain className="w-6 h-6 text-emerald-500" /> Profil Responden & Socio-Ekonomi
              </h3>
              <p className={`text-sm mt-1 ${textSecondary}`}>Analisis karakteristik psikologi dan sebaran bidang usaha responden.</p>
            </div>
            <div onClick={() => navigate("/admin/analytics/demografi")}
              className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200 cursor-pointer shadow-sm`}
            >
              Lihat Detail Demografi <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10 flex-1 pt-4 border-t border-gray-100/50">
             {/* Left side: Age Stats Percentage */}
             <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Users className="w-3.5 h-3.5" /> Ringkasan Usia
                </h4>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <span className="block text-[10px] font-black text-blue-500 uppercase mb-1">Usia Produktif</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-700">{stats.usiaProduktifPct}%</span>
                      <span className="text-xs font-bold text-blue-400">({stats.usiaProduktifCount} jiwa)</span>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${stats.usiaProduktifPct}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-blue-500" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Non-Produktif</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-600">{100 - stats.usiaProduktifPct}%</span>
                      <span className="text-[10px] font-bold text-gray-400">({stats.totalResponden - stats.usiaProduktifCount} jiwa)</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 leading-tight">Data mencakup responden di bawah 15 tahun dan di atas 64 tahun.</p>
                  </div>
                </div>
             </div>

             {/* Middle side: Psychology Highlights */}
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Karakteristik Psikologi</h4>
                <div className="grid grid-cols-1 gap-2.5">
                   {[
                     { label: "Grit (Kegigihan)", sub: "Dominasi Tinggi", value: advancedStats.radarData[0]?.Total || 0, color: "blue" },
                     { label: "KWU (Jiwa Usaha)", sub: "Dominasi Tinggi", value: advancedStats.radarData[6]?.Total || 0, color: "emerald" },
                     { label: "Personality (TIPI)", sub: "Kestabilan Emosi", value: advancedStats.radarData[3]?.Total || 0, color: "violet" },
                   ].map((item, i) => {
                     const pct = (item.value / Math.max(stats.totalResponden, 1)) * 100;
                     return (
                       <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.02]">
                          <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-black text-[11px] text-${item.color}-600 bg-${item.color}-50 border border-${item.color}-100`}>
                            {pct.toFixed(0)}%
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-gray-800 leading-tight">{item.label}</div>
                            <div className="text-[9px] font-medium text-gray-500">{item.sub}</div>
                          </div>
                       </div>
                     )
                   })}
                </div>
             </div>

             {/* Right side: Top Business Fields */}
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sektor Usaha Terpopuler</h4>
                <div className="flex flex-col gap-4">
                  {advancedStats.businessData.slice(0, 4).map((b, i) => {
                    const colors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500"];
                    const totalUsers = Math.max(stats.totalResponden, 1);
                    const pct = (b.value / totalUsers) * 100;
                    
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-gray-700 capitalize flex items-center gap-2 truncate max-w-[120px]">
                             <div className={`w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`} /> {b.name}
                           </span>
                           <div className="flex items-center gap-2 text-[10px] shrink-0">
                             <span className="font-bold text-gray-500">{pct.toFixed(1)}%</span>
                             <span className="text-gray-400 font-medium">({b.value})</span>
                           </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 + (i * 0.1) }} className={`h-full ${colors[i % colors.length]}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </motion.div>



        {/* Tren Klaster Per Bulan - Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col lg:col-span-3 relative overflow-hidden ${cardBg}`}
        >
          <div className="mb-6 relative z-10 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
                <TrendingUp className="w-5 h-5 text-blue-500" /> Tren Klaster Per Bulan
              </h3>
              <p className={`text-sm mt-1 ${textSecondary}`}>Perkembangan jumlah responden per klaster setiap bulan.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-4 px-4 py-2 shadow-sm rounded-xl border ${"bg-white border-gray-300"}`}>
                {[1, 2, 3, 4].map((klaster) => (
                  <div key={klaster} className={`flex items-center gap-2 text-xs font-medium ${"text-gray-700"}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[`klaster${klaster}` as keyof typeof CLUSTER_COLORS] }}></span> K{klaster}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/admin/analytics/trend")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-md border hover:border-transparent border-blue-400 text-sm font-bold transition-all hover:scale-105 active:scale-95 group">
                Filter Detail Tren <ArrowRight className="w-4 h-4 text-blue-100 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={`cluster-${location.key}`} data={advancedStats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
