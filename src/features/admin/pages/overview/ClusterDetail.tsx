import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
          fill={fill}
          fontSize={15}
          fontWeight="900"
          style={{ filter: `drop-shadow(0 0 4px ${fill}30)` }}
        >
          <AnimatedNumber id={`chart-${chartTitle}-${payload.klaster}`} value={safeValue} />
        </text>
      )}
    </g>
  );
};

// ── Filter types ──
type GenderFilter = "keseluruhan" | "laki" | "perempuan" | "produktif";

const CLUSTER_COLORS = ["#991b1b", "#c2410c", "#a16207", "#15803d"];
const BAR_FILLS = [
  { klaster: "Klaster 1", fill: "#991b1b" },
  { klaster: "Klaster 2", fill: "#c2410c" },
  { klaster: "Klaster 3", fill: "#a16207" },
  { klaster: "Klaster 4", fill: "#15803d" },
];

const GENDER_OPTIONS: { key: GenderFilter; label: string }[] = [
  { key: "keseluruhan", label: "Keseluruhan" },
  { key: "laki", label: "Laki-laki" },
  { key: "perempuan", label: "Perempuan" },
  { key: "produktif", label: "Usia Produktif" },
];

type ClusterEntry = { klaster: string; value: number; fill: string };
type ClusterSet = { keseluruhan: ClusterEntry[]; gakin: ClusterEntry[]; nonGakin: ClusterEntry[] };
type AllClusterData = Record<GenderFilter, ClusterSet>;

function useClusterData(): AllClusterData {
  const [data, setData] = useState<AllClusterData>({
    keseluruhan: { keseluruhan: [], gakin: [], nonGakin: [] },
    laki: { keseluruhan: [], gakin: [], nonGakin: [] },
    perempuan: { keseluruhan: [], gakin: [], nonGakin: [] },
    produktif: { keseluruhan: [], gakin: [], nonGakin: [] },
  });

  useEffect(() => {
    const users = getUsers();
    const results = getAllKuesionerResults();
    const currentYear = new Date().getFullYear();

    // 4 klasters × 4 gender-filter × 3 types (all/gakin/nonGakin)
    type Bucket = { all: number; gakin: number; nonGakin: number };
    const buildBuckets = (): Bucket[] => [
      { all: 0, gakin: 0, nonGakin: 0 },
      { all: 0, gakin: 0, nonGakin: 0 },
      { all: 0, gakin: 0, nonGakin: 0 },
      { all: 0, gakin: 0, nonGakin: 0 },
    ];

    const buckets: Record<GenderFilter, Bucket[]> = {
      keseluruhan: buildBuckets(),
      laki: buildBuckets(),
      perempuan: buildBuckets(),
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

      const increment = (b: Bucket) => {
        b.all++;
        if (isGakin) b.gakin++;
        else b.nonGakin++;
      };

      increment(buckets.keseluruhan[kIdx]);
      if (isLaki) increment(buckets.laki[kIdx]);
      if (isPerempuan) increment(buckets.perempuan[kIdx]);
      if (isProduktif) increment(buckets.produktif[kIdx]);
    });

    const toEntries = (buckets: Bucket[], key: "all" | "gakin" | "nonGakin"): ClusterEntry[] =>
      BAR_FILLS.map((b, i) => ({ klaster: b.klaster, value: buckets[i][key], fill: b.fill }));

    const build = (gf: GenderFilter): ClusterSet => ({
      keseluruhan: toEntries(buckets[gf], "all"),
      gakin: toEntries(buckets[gf], "gakin"),
      nonGakin: toEntries(buckets[gf], "nonGakin"),
    });

    setData({
      keseluruhan: build("keseluruhan"),
      laki: build("laki"),
      perempuan: build("perempuan"),
      produktif: build("produktif"),
    });
  }, []);

  return data;
}

function ClusterChart({ title, data, subtitle }: any) {
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
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={location.key} data={data} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={"#00000010"} vertical={false} />
            <XAxis dataKey="klaster" stroke={"#4b5563"} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={"#4b5563"} fontSize={12} tickLine={false} axisLine={false} />
            <Bar 
              dataKey="value" 
              animationDuration={1500} 
              animationEasing="ease-out"
              shape={<CustomBarShape chartTitle={title} />}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function ClusterDetail() {
  const navigate = useNavigate();
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("keseluruhan");
  const clusterData = useClusterData();
  
  const currentData = clusterData[genderFilter];

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
        <div className={`shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap md:flex-nowrap items-center gap-1 border relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-x-auto ${"bg-white border-gray-300 shadow-md"}`}>
          <Users2 className="w-4 h-4 text-gray-500 mx-2" />
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setGenderFilter(opt.key)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                genderFilter === opt.key
                  ? ("text-gray-900")
                  : ("text-gray-500 hover:text-gray-900")
              }`}
            >
              {genderFilter === opt.key && (
                <motion.div
                  layoutId="active-glass-filter"
                  className={`absolute inset-0 backdrop-blur-lg border rounded-xl shadow-sm ${"bg-gray-100 border-gray-300"}`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── CLUSTER CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClusterChart
          title="Keseluruhan Klaster"
          subtitle="Total responden per klaster"
          data={currentData.keseluruhan}
        />
        <ClusterChart
          title="GAKIN Klaster"
          subtitle="Responden GAKIN per klaster"
          data={currentData.gakin}
        />
        <ClusterChart
          title="Non-GAKIN Klaster"
          subtitle="Responden Non-GAKIN per klaster"
          data={currentData.nonGakin}
        />
      </div>

      {/* ── SUMMARY CARDS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
      >
        {currentData.keseluruhan.map((item, i) => {
          const color = CLUSTER_COLORS[i];
          return (
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              key={item.klaster}
              className={`shadow-sm backdrop-blur-xl rounded-2xl p-5 border relative overflow-hidden group transition-all text-left ${"bg-white border-gray-300 shadow-md"}`}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity border-2 z-0"
                style={{ borderColor: `${color}80` }}
              />
              <div
                className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 blur-[30px] rounded-full transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-inner"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-sm font-medium transition-colors tracking-wider uppercase ${"text-gray-600 group-hover:text-gray-800"}`}>{item.klaster}</span>
              </div>
              <p className={`text-2xl font-black relative z-10 drop-shadow-sm ${"text-gray-900"}`}>
                <AnimatedNumber id={`summary-${item.klaster}`} value={item.value} />
              </p>
              <p className={`text-xs mt-1 relative z-10 transition-colors ${"text-gray-500 group-hover:text-gray-600"}`}>
                {genderFilter === "keseluruhan" ? "Total" : genderFilter === "laki" ? "Laki-laki" : genderFilter === "perempuan" ? "Perempuan" : "Usia Produktif"} responden
              </p>
            </motion.button>
          );
        })}
      </motion.div>

    </AdminLayout>
  );
}
