import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Layers, ArrowLeft, Users2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { getUsers, getAllKuesionerResults } from "../../../../services/StorageService";
import { calcFullScore } from "../../../../services/ScoringService";

// ── Helper ──
const previousValues = new Map<string, number>();

function AnimatedNumber({ id, value }: { id: string; value: number }) {
  const mappedPrev = previousValues.get(id);
  const initialValue = mappedPrev !== undefined ? mappedPrev : 0;
  
  const [displayValue, setDisplayValue] = useState(initialValue);
  
  useEffect(() => {
    let animationFrameId: number;
    let startValue = displayValue;
    const endValue = value;
    
    previousValues.set(id, value);

    if (startValue === endValue) return;
    
    const duration = 1500;
    const startTime = performance.now();
    
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentVal = Math.round(startValue + (endValue - startValue) * easeOut(progress));
      setDisplayValue(currentVal);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      }
    };
    
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, id]);

  return <>{displayValue}</>;
}

// ── Custom Bar Shape ──
const CustomBarShape = (props: any) => {
  const { x, y, width, height, fill, value, payload, chartTitle } = props;
  
  if (width < 0 || height < 0 || isNaN(x) || isNaN(y)) return null;

  const radius = Math.min(6, width / 2, height / 2);
  const path = `
    M${x},${y + height} 
    L${x},${y + radius} 
    Q${x},${y} ${x + radius},${y} 
    L${x + width - radius},${y} 
    Q${x + width},${y} ${x + width},${y + radius} 
    L${x + width},${y + height} 
    Z
  `;

  const safeValue = typeof value === 'number' ? value : (payload?.value || 0);

  return (
    <g>
      <path 
        d={path} 
        fill={fill} 
        style={{ filter: `drop-shadow(0 0 15px ${fill}80)` }} 
      />
      {(height >= 0 || safeValue === 0) && (
        <text
          x={x + width / 2}
          y={y - 10}
          textAnchor="middle"
          fill={fill === '#60a5fa' ? '#2563eb' : (fill === '#f472b6' ? '#be185d' : fill)}
          fontSize={15}
          fontWeight="900"
          style={{ filter: `drop-shadow(0 0 2px ${fill}50)` }}
        >
          {safeValue === 0 ? "" : safeValue}
        </text>
      )}
    </g>
  );
};

// ── Filter types ──
type ViewMode = "keseluruhan" | "gender" | "produktif";

const CLUSTER_COLORS = ["#3b82f6", "#8b5cf6", "#d946ef", "#ec4899"];
const BAR_FILLS = [
  { klaster: "Klaster 1", fill: "#3b82f6" },
  { klaster: "Klaster 2", fill: "#8b5cf6" },
  { klaster: "Klaster 3", fill: "#d946ef" },
  { klaster: "Klaster 4", fill: "#ec4899" },
];

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: "keseluruhan", label: "Keseluruhan" },
  { key: "gender", label: "Gender" },
  { key: "produktif", label: "Usia Produktif" },
];

type ClusterEntry = { 
  klaster: string; 
  value: number; 
  laki: number;
  perempuan: number;
  fill: string; 
};
type ClusterSet = { keseluruhan: ClusterEntry[]; gakin: ClusterEntry[]; nonGakin: ClusterEntry[] };
type AllClusterData = Record<ViewMode, ClusterSet>;

function useClusterData(): AllClusterData {
  const [data, setData] = useState<AllClusterData>({
    keseluruhan: { keseluruhan: [], gakin: [], nonGakin: [] },
    gender: { keseluruhan: [], gakin: [], nonGakin: [] },
    produktif: { keseluruhan: [], gakin: [], nonGakin: [] },
  });

  useEffect(() => {
    const users = getUsers();
    const results = getAllKuesionerResults();
    const currentYear = new Date().getFullYear();

    // 4 klasters × 3 types (all/gakin/nonGakin)
    // inside each we track: total, laki, perempuan
    type BucketStats = { total: number; laki: number; perempuan: number };
    type Bucket = { all: BucketStats; gakin: BucketStats; nonGakin: BucketStats };
    const buildBuckets = (): Bucket[] => Array(4).fill(null).map(() => ({
      all: { total: 0, laki: 0, perempuan: 0 },
      gakin: { total: 0, laki: 0, perempuan: 0 },
      nonGakin: { total: 0, laki: 0, perempuan: 0 }
    }));

    const buckets: Record<ViewMode, Bucket[]> = {
      keseluruhan: buildBuckets(),
      gender: buildBuckets(), // Data is identical to keseluruhan, but triggers different render
      produktif: buildBuckets(),
    };

    results.forEach((r) => {
      const user = users.find((u) => u.nik === r.nik);
      if (!user) return;

      const score = calcFullScore(r.data);
      const kIdx = score.kluster - 1; // 0-indexed

      const isGakin = user.gakinStatus === "GAKIN";
      const jenisKelamin = (user.jenisKelamin || "").toLowerCase();
      const isLaki = jenisKelamin.includes("laki");
      const isPerempuan = jenisKelamin.includes("perempuan");

      let age = 99;
      if (user.tanggalLahir) {
        age = currentYear - new Date(user.tanggalLahir).getFullYear();
      }
      const isProduktif = age >= 15 && age <= 64;

      const increment = (b: BucketStats) => {
        b.total++;
        if (isLaki) b.laki++;
        if (isPerempuan) b.perempuan++;
      };

      const processBucket = (b: Bucket) => {
        increment(b.all);
        if (isGakin) increment(b.gakin);
        else increment(b.nonGakin);
      };

      processBucket(buckets.keseluruhan[kIdx]);
      processBucket(buckets.gender[kIdx]);
      if (isProduktif) processBucket(buckets.produktif[kIdx]);
    });

    const toEntries = (bArray: Bucket[], key: "all" | "gakin" | "nonGakin"): ClusterEntry[] =>
      BAR_FILLS.map((f, i) => ({ 
        klaster: f.klaster, 
        value: bArray[i][key].total, 
        laki: bArray[i][key].laki,
        perempuan: bArray[i][key].perempuan,
        fill: f.fill 
      }));

    const build = (view: ViewMode): ClusterSet => ({
      keseluruhan: toEntries(buckets[view], "all"),
      gakin: toEntries(buckets[view], "gakin"),
      nonGakin: toEntries(buckets[view], "nonGakin"),
    });

    setData({
      keseluruhan: build("keseluruhan"),
      gender: build("gender"),
      produktif: build("produktif"),
    });
  }, []);

  return data;
}

function ClusterChart({ title, data, subtitle, mode }: { title: string, data: any, subtitle: string, mode: ViewMode }) {
  const location = useLocation() as any;
  
  const textPrimary   = "text-gray-900";
  const textSecondary = "text-gray-600";
  const bgCard        = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 flex flex-col group relative overflow-hidden ${bgCard}`}
    >
      <div className="mb-5">
        <h3 className={`font-bold flex items-center gap-2 text-base ${textPrimary}`}>
          <Layers className="w-5 h-5 text-blue-500" />
          {title}
        </h3>
        {subtitle && <p className={`text-sm mt-1 ${textSecondary}`}>{subtitle}</p>}
      </div>
      <div className="h-[320px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={"#00000010"} vertical={false} />
            <XAxis dataKey="klaster" stroke={"#4b5563"} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={"#4b5563"} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            
            {mode === "gender" ? (
              <>
                <Bar name="Laki-laki" dataKey="laki" fill="#60a5fa" shape={<CustomBarShape chartTitle={`${title}-L`} />} animationDuration={1500} animationEasing="ease-out" />
                <Bar name="Perempuan" dataKey="perempuan" fill="#f472b6" shape={<CustomBarShape chartTitle={`${title}-P`} />} animationDuration={1500} animationEasing="ease-out" />
              </>
            ) : (
              <Bar 
                dataKey="value" 
                shape={<CustomBarShape chartTitle={title} />}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            )}
            
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function ClusterDetail() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("keseluruhan");
  const clusterData = useClusterData();
  
  const currentData = clusterData[viewMode];

  return (
    <AdminLayout title="Analisis Klaster" headerIcon={<Layers className="w-4 h-4" />}>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/admin/analytics")}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-500 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Kembali ke Analytics</span>
      </motion.button>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${"text-gray-900"}`}>
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 border border-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
          Detail Analisis Klaster
        </h1>
        <p className={`mt-1 ${"text-gray-600"}`}>
          Distribusi klaster berdasarkan jenis kelamin dan usia responden.
        </p>
      </motion.div>

      {/* ── FILTERS ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex mb-8"
      >
        {/* Detail Filter */}
        <div className="shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap md:flex-nowrap items-center gap-1 border relative overflow-hidden bg-white border-gray-300">
          <Users2 className="w-4 h-4 text-gray-500 mx-2 shrink-0" />
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setViewMode(opt.key)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors duration-300 z-10 ${
                viewMode === opt.key
                  ? "text-blue-700"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {viewMode === opt.key && (
                <>
                  <motion.div
                    layoutId="active-glass-filter"
                    className="absolute inset-0 bg-blue-100/60 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-inner shadow-blue-500/10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                  {/* Bubbles / Liquid effect */}
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
                  >
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bg-blue-400/20 rounded-full blur-[1px]"
                        style={{ 
                          width: Math.random() * 6 + 4, 
                          height: Math.random() * 6 + 4,
                          left: `${10 + Math.random() * 80}%`,
                          bottom: '-10%'
                        }}
                        animate={{ 
                          y: [-10, -50], 
                          x: [0, (Math.random() - 0.5) * 20],
                          opacity: [0, 0.8, 0],
                          scale: [0.5, 1.2, 0.8]
                        }}
                        transition={{ 
                          duration: 2 + Math.random() * 2, 
                          repeat: Infinity, 
                          delay: Math.random() * 2,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                </>
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>
        
        {viewMode === "gender" && (
          <div className="ml-4 flex items-center gap-3 px-4 rounded-xl border bg-white shadow-sm">
             <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span className="flex w-3 h-3 rounded-full bg-blue-500"></span> Laki-laki
             </div>
             <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span className="flex w-3 h-3 rounded-full bg-pink-500"></span> Perempuan
             </div>
          </div>
        )}
      </motion.div>

      {/* ── CLUSTER CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClusterChart
          title="Keseluruhan Klaster"
          subtitle="Total responden per klaster"
          mode={viewMode}
          data={currentData.keseluruhan}
        />
        <ClusterChart
          title="GAKIN Klaster"
          subtitle="Responden GAKIN per klaster"
          mode={viewMode}
          data={currentData.gakin}
        />
        <ClusterChart
          title="Non-GAKIN Klaster"
          subtitle="Responden Non-GAKIN per klaster"
          mode={viewMode}
          data={currentData.nonGakin}
        />
      </div>

      {/* ── SUMMARY CARDS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
      >
        {currentData.keseluruhan.map((item, i) => {
          const color = CLUSTER_COLORS[i];
          const gakinVal = currentData.gakin[i].value;
          const nonGakinVal = currentData.nonGakin[i].value;
          
          return (
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              key={item.klaster}
              className={`shadow-sm backdrop-blur-xl rounded-2xl p-5 border relative overflow-hidden group transition-all text-left ${"bg-white border-gray-300 shadow-md"}`}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity border-2 z-0 pointer-events-none"
                style={{ borderColor: `${color}80` }}
              />
              <div
                className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 blur-[30px] rounded-full transition-opacity group-hover:opacity-30 pointer-events-none"
                style={{ backgroundColor: color }}
              />
              
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                  <span className={`text-sm font-bold uppercase tracking-wider ${"text-gray-800"}`}>{item.klaster}</span>
                </div>
              </div>
              
              <div className="my-2 relative z-10">
                <p className={`text-3xl font-black drop-shadow-sm ${"text-gray-900"}`}>
                  <AnimatedNumber id={`summary-${item.klaster}`} value={item.value} />
                </p>
                <p className={`text-xs mt-0.5 font-semibold ${"text-gray-500"}`}>
                  Total Responden
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 relative z-10">
                <div className="px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">GAKIN</p>
                  <p className="text-sm font-black text-gray-800"><AnimatedNumber id={`summary-gakin-${item.klaster}`} value={gakinVal} /></p>
                </div>
                <div className="px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-blue-600 mb-0.5">NON-GAKIN</p>
                  <p className="text-sm font-black text-gray-800"><AnimatedNumber id={`summary-nongakin-${item.klaster}`} value={nonGakinVal} /></p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </AdminLayout>
  );
}
