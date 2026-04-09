import { Link } from "react-router";
import { ArrowLeft, Brain, BriefcaseBusiness, TrendingUp, Users } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion } from "motion/react";
import { useAdvancedAnalytics } from "../../hooks/useAdvancedAnalytics";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  PieChart, Pie, AreaChart, Area
} from "recharts";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const CLUSTER_COLORS = {
  k1: "#2563eb",
  k2: "#f97316",
  k3: "#eab308",
  k4: "#22c55e",
};

export default function DemografiDetail() {
  const data = useAdvancedAnalytics();
  const stats = useDashboardStats();
  
  const PRODUCTIVE_AGE_DATA = [
    { age: "15-64", jumlah: stats.usiaProduktifCount },
    { age: "Lainnya", jumlah: (stats.totalResponden - stats.usiaProduktifCount) },
  ];

  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const glowLight = "bg-blue-600/5";

  return (
    <AdminLayout title="Demografi & Psikologi" headerIcon={<Users className="w-4 h-4" />}>
      <div className="dark-scrollbar shrink-0">
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/admin/analytics" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Analytics Utama
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <Brain className="w-6 h-6 shadow-inner" />
              </div>
              Korelasi Demografi & Psikologi
            </h1>
            <p className="mt-1 text-gray-600">Rincian lebih dalam untuk pemetaan profil GAKIN berdasarkan uji psikologi dan sosial-ekonomi.</p>
          </div>
        </motion.div>

        {/* RADAR CHART ROW */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 overflow-hidden relative ${cardBg}`}>
            <div className={`absolute -top-10 -right-10 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2 relative z-10">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Profil Kapasitas Psikologis
            </h3>
            <p className="text-sm text-gray-600 mb-8 relative z-10">
              Membandingkan rata-rata skor GRIT (Ketekunan), TIPI (Kepribadian), dan KWU (Kewirausahaan) antar Klaster.
            </p>

            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="w-full lg:w-2/3 h-[400px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#4b5563", fontSize: 11, fontWeight: 600 }} />
                    <Radar name="Distribusi Jawaban" dataKey="Total" stroke="#10b981" fill="#10b981" fillOpacity={0.5} strokeWidth={2} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full lg:w-1/3 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 text-sm mb-1">Status Distribusi</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed text-justify">
                    Berdasarkan kuesioner yang masuk, grafik ini memetakan persentase responden ke dalam klasifikasi <strong className="font-black text-emerald-900">Tinggi, Sedang, Rendah</strong> untuk setiap dimensi psikometri. Hal ini menunjukkan mayoritas kekuatan mentalitas responden tanpa bias klaster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SOCIO-ECONOMIC ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOME BAR CHART */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col relative overflow-hidden ${cardBg}`}
          >
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2 relative z-10">
              <BriefcaseBusiness className="w-5 h-5 text-blue-500" /> Distribusi Penghasilan
            </h3>
            <p className="text-sm text-gray-600 mb-6 relative z-10">Korelasi tingkat penghasilan per hari dengan distribusi Klaster.</p>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.incomeData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                  <XAxis dataKey="range" fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="K1" name="Klaster 1" stackId="a" fill={CLUSTER_COLORS.k1} />
                  <Bar dataKey="K2" name="Klaster 2" stackId="a" fill={CLUSTER_COLORS.k2} />
                  <Bar dataKey="K3" name="Klaster 3" stackId="a" fill={CLUSTER_COLORS.k3} />
                  <Bar dataKey="K4" name="Klaster 4" stackId="a" fill={CLUSTER_COLORS.k4} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* BUSINESS FIELD DONUT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 flex flex-col relative overflow-hidden ${cardBg}`}
          >
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2 relative z-10">
              <BriefcaseBusiness className="w-5 h-5 text-emerald-500" /> Top 5 Bidang Usaha
            </h3>
            <p className="text-sm text-gray-600 mb-4 relative z-10">Rangkuman jenis usaha terbanyak yang sedang dijalankan responden.</p>
            
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <div className="h-[240px] w-[240px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.businessData} innerRadius="60%" outerRadius="85%" paddingAngle={3} dataKey="value" stroke="none">
                      {data.businessData.map((_entry, index) => {
                         const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
                         return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <RechartsTooltip itemStyle={{ color: '#111' }} contentStyle={{ borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 flex flex-col gap-2 w-full justify-center">
                {data.businessData.map((b, i) => {
                  const colors = ["bg-blue-500", "bg-emerald-500", "bg-yellow-500", "bg-violet-500", "bg-pink-500"];
                  return (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg border bg-gray-50/50 border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></span>
                        <span className="text-xs font-semibold text-gray-700 capitalize">{b.name}</span>
                      </div>
                      <span className="font-bold text-sm text-gray-900 bg-white px-2 py-0.5 rounded shadow-sm">{b.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* AGE DEMOGRAPHY ROW */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 mb-8">
           <div className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border p-6 overflow-hidden relative ${cardBg}`}>
              <div className="mb-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" /> Distribusi Kelompok Usia
                  </h3>
                  <p className="text-sm text-gray-600">Perbandingan jumlah responden usia produktif vs non-produktif.</p>
                </div>
                <div className="flex gap-4">
                   <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-center">
                      <span className="block text-[10px] uppercase font-black text-blue-500">Usia Produktif</span>
                      <span className="text-lg font-black text-blue-700">{stats.usiaProduktifPct}%</span>
                   </div>
                   <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-center">
                      <span className="block text-[10px] uppercase font-black text-gray-400">Non-Produktif</span>
                      <span className="text-lg font-black text-gray-600">{100 - stats.usiaProduktifPct}%</span>
                   </div>
                </div>
              </div>

              <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PRODUCTIVE_AGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsiaDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                    <XAxis dataKey="age" fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb' }} />
                    <Area type="monotone" dataKey="jumlah" name="Jumlah Responden" stroke="#2563eb" fillOpacity={1} fill="url(#colorUsiaDetail)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
