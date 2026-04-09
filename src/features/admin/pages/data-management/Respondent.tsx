import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Database, Users, ChevronDown, CheckCircle, SlidersHorizontal, ArrowUpDown, Filter, Check, MapPin, RotateCcw, AlertTriangle, X } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { getUsers, getKuesionerResult } from "../../../../services/StorageService";
import { calcFullScore } from "../../../../services/ScoringService";
import type { UserRecord } from "../../../../services/StorageService";

interface DataItem {
  id: string;
  nik: string;
  nama: string;
  kecamatan: string;
  kelurahan: string;
  alamatKtp: string;
  type: "GAKIN" | "Non-GAKIN";
  usia: number;
  jenisKelamin: string;
  phone: string;
  pendidikan: string;
  agama: string;
  bidangUsaha: string;
  klaster: number | null;
  scores: { grit: number; tipi: number; kewira: number } | null;
}

function calcUsia(tanggalLahir: string): number {
  if (!tanggalLahir) return 0;
  const bday = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - bday.getFullYear();
  const m = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
  return age;
}

function buildDataItems(): DataItem[] {
  return getUsers().map((u: UserRecord): DataItem => {
    const result = getKuesionerResult(u.nik);
    if (!result) {
      return {
        id: u.nik, nik: u.nik, nama: u.fullName,
        kecamatan: u.kecamatanKtp || "-", kelurahan: u.kelurahanKtp || "-",
        alamatKtp: u.alamatKtp || "-",
        type: (u.gakinStatus as "GAKIN" | "Non-GAKIN") || "Non-GAKIN",
        usia: calcUsia(u.tanggalLahir), jenisKelamin: u.jenisKelamin || "-",
        phone: u.phone || "-", pendidikan: u.pendidikan || "-",
        agama: u.agama || "-", bidangUsaha: u.bidangUsaha || "-",
        klaster: null, scores: null,
      };
    }
    const full = calcFullScore(result.data);
    const gritPct  = Math.round((full.gritScore / 60) * 100);
    const kwuPct   = Math.round((full.kwuScore  / 60) * 100);
    const tipiAvg  = Object.values(full.tipiAspects).reduce((a, b) => a + b, 0) / 5;
    const tipiPct  = Math.round((tipiAvg / 14) * 100);
    return {
      id: u.nik, nik: u.nik, nama: u.fullName,
      kecamatan: u.kecamatanKtp || "-", kelurahan: u.kelurahanKtp || "-",
      alamatKtp: u.alamatKtp || "-",
      type: (u.gakinStatus as "GAKIN" | "Non-GAKIN") || "Non-GAKIN",
      usia: calcUsia(u.tanggalLahir), jenisKelamin: u.jenisKelamin || "-",
      phone: u.phone || "-", pendidikan: u.pendidikan || "-",
      agama: u.agama || "-", bidangUsaha: u.bidangUsaha || "-",
      klaster: full.kluster,
      scores: { grit: gritPct, tipi: tipiPct, kewira: kwuPct },
    };
  });
}

function resetAllRespondents() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("kuesioner_done_"));
  keys.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem("kuesioner_results");
}

type FilterKlasterTab = "Keseluruhan" | "Klaster 1" | "Klaster 2" | "Klaster 3" | "Klaster 4";

const KLASTER_OPTIONS: { key: FilterKlasterTab; label: string; klasterVal: number | null }[] = [
  { key: "Keseluruhan", label: "Keseluruhan", klasterVal: null },
  { key: "Klaster 1", label: "Klaster 1", klasterVal: 1 },
  { key: "Klaster 2", label: "Klaster 2", klasterVal: 2 },
  { key: "Klaster 3", label: "Klaster 3", klasterVal: 3 },
  { key: "Klaster 4", label: "Klaster 4", klasterVal: 4 },
];

const ROWS_OPTIONS = [10, 25, 50];

type ColumnKey = "nama" | "nik" | "kecamatan" | "kelurahan" | "alamatKtp" | "type" | "usia" | "jenisKelamin" | "phone" | "pendidikan" | "agama" | "bidangUsaha" | "klaster";
const ALL_COLUMNS: { key: ColumnKey; label: string; sortable?: boolean }[] = [
  { key: "nama", label: "Nama Lengkap", sortable: true },
  { key: "nik", label: "NIK", sortable: true },
  { key: "type", label: "Tipe Data" },
  { key: "usia", label: "Usia" },
  { key: "jenisKelamin", label: "Jenis Kelamin" },
  { key: "kecamatan", label: "Kecamatan" },
  { key: "kelurahan", label: "Kelurahan" },
  { key: "alamatKtp", label: "Alamat KTP" },
  { key: "phone", label: "No. Telepon" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "agama", label: "Agama" },
  { key: "bidangUsaha", label: "Bidang Usaha" },
  { key: "klaster", label: "Skor Klaster" },
];

const DEFAULT_VISIBLE = new Set<ColumnKey>(["nama", "nik", "kecamatan", "type", "phone", "bidangUsaha", "klaster"]);

export default function Respondent() {
  const navigate = useNavigate();  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeKlasterTab, setActiveKlasterTab] = useState<FilterKlasterTab>("Keseluruhan");
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isAlertExiting, setIsAlertExiting] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const allItems: DataItem[] = buildDataItems();
  
  const [sortCol, setSortCol] = useState<ColumnKey | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [visibleColsSet, setVisibleColsSet] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE));
  const [showColDropdown, setShowColDropdown] = useState(false);
  const colDropdownRef = useRef<HTMLDivElement>(null);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);
  const rowsBtnRef = useRef<HTMLButtonElement>(null);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg); setShowSuccessAlert(true); setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowSuccessAlert(false); setIsAlertExiting(false); }, 4000);
  };

  const handleResetAll = () => {
    resetAllRespondents();
    setRefreshKey(k => k + 1);
    setShowResetAllModal(false);
    triggerAlert("Seluruh data kuesioner berhasil direset.");
  };

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colDropdownRef.current && !colDropdownRef.current.contains(target)) {
        setShowColDropdown(false);
      }
      if (rowsBtnRef.current && !rowsBtnRef.current.contains(target) && (!rowsDropdownRef.current || !rowsDropdownRef.current.contains(target))) {
        setShowRowsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let filteredData = allItems.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.nik.includes(searchTerm);
    if (!matchesSearch) return false;
    if (item.klaster === null) return false;
    if (activeKlasterTab === "Klaster 1" && item.klaster !== 1) return false;
    if (activeKlasterTab === "Klaster 2" && item.klaster !== 2) return false;
    if (activeKlasterTab === "Klaster 3" && item.klaster !== 3) return false;
    if (activeKlasterTab === "Klaster 4" && item.klaster !== 4) return false;
    return true;
  });

  if (sortCol) {
    filteredData = [...filteredData].sort((a: DataItem, b: DataItem) => {
      if (sortCol === "klaster") {
        const aVal = a.klaster ?? (sortDir === "asc" ? 999 : -1);
        const bVal = b.klaster ?? (sortDir === "asc" ? 999 : -1);
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const valA = (a as unknown as Record<string, unknown>)[sortCol];
      const valB = (b as unknown as Record<string, unknown>)[sortCol];
      if (typeof valA === "number") {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortDir === "asc" ? numA - numB : numB - numA;
      }
      const strA = String(valA ?? "");
      const strB = String(valB ?? "");
      return sortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  
  // Smart ellipsis pagination
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 1;
    const range: number[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) range.push(i);
    const items: (number | "...")[] = [1];
    if (range[0] > 2) items.push("...");
    items.push(...range);
    if (range[range.length - 1] < totalPages - 1) items.push("...");
    items.push(totalPages);
    return items;
  };

  const handleKlasterTabChange = (tab: FilterKlasterTab) => { setActiveKlasterTab(tab); setCurrentPage(1); setAnimKey(k => k + 1); };
  const handleRowsChange = (val: number) => { setRowsPerPage(val); setCurrentPage(1); };

  const handleSort = (col: ColumnKey) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const toggleColumn = (col: ColumnKey) => {
    setVisibleColsSet(prev => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });
  };

  const getDropdownPos = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!ref.current) return { top: 0, left: 0 };
    const rect = ref.current.getBoundingClientRect();
    return { top: rect.bottom + 8, left: rect.left };
  };

  // ── THEME CLASSES ──
  const textPrimary   = "text-gray-900";
  const textSecondary = "text-gray-600";
  const bgCard        = "bg-white/95 border-gray-300 shadow-sm";
  const bgTableCard   = "bg-white/95 border-gray-300 shadow-md";
  const tableHeader   = "border-b border-gray-300 text-gray-700 bg-gray-100/50";
  const borderCol     = "border-gray-300";
  const rowHoverBg    = "hover:bg-gray-100/50 shadow-sm";
  const dropdownBg    = "bg-white border-gray-300 text-gray-800 shadow-xl";
  const dropdownHover = "hover:bg-gray-50";
  const inputBg       = "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 hover:border-gray-400 shadow-sm";
  const btnOutline    = "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-sm";

  const renderBatteryScore = (item: DataItem) => {
    if (!item.klaster || !item.scores) {
      return (
        <div className="flex items-center gap-2">
          <span className={`text-xs italic shadow-sm px-3 py-1.5 rounded-md border ${"bg-gray-50 border-gray-200 text-gray-500"}`}>
            Belum Mengisi Kuesioner
          </span>
        </div>
      );
    }

    const { grit, tipi, kewira } = item.scores;
    const avgScore = (grit + tipi + kewira) / 3;
    
    const clusterColors: Record<number, { gradient: string; solid: string }> = {
      1: { gradient: "from-blue-600 to-blue-400", solid: "text-blue-400" },
      2: { gradient: "from-orange-500 to-orange-400", solid: "text-orange-400" },
      3: { gradient: "from-amber-400 to-yellow-400", solid: "text-amber-400" },
      4: { gradient: "from-emerald-500 to-emerald-400", solid: "text-emerald-400" },
    };
    
    const colors = clusterColors[item.klaster] || { gradient: "from-gray-500 to-gray-400", solid: "text-gray-500" };
    
    return (
      <div className="flex flex-col gap-1 max-w-[200px]">
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${colors.solid}`}>Klaster {item.klaster}</span>
          <span className={`text-xs font-bold ${textPrimary}`}>{avgScore.toFixed(0)}%</span>
        </div>
        <div className={`h-2.5 w-full rounded-full border overflow-hidden relative ${"bg-gray-200 border-gray-300"}`}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${avgScore}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`} />
        </div>
      </div>
    );
  };

  const displayCols = ALL_COLUMNS.map(c => c.key).filter(c => visibleColsSet.has(c));

  const renderCellContent = (item: DataItem, col: ColumnKey) => {
    switch (col) {
      case "nama": return <p className={`font-semibold transition-colors ${"text-gray-800 group-hover:text-blue-500"}`}>{item.nama}</p>;
      case "nik": return <span className={`font-mono text-xs shadow-sm px-2 py-1 rounded-md border ${"bg-gray-50 text-gray-600 border-gray-200"}`}>{item.nik}</span>;
      case "kecamatan": return <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className={textSecondary}>{item.kecamatan}</span></div>;
      case "kelurahan": return <span className={textSecondary}>{item.kelurahan}</span>;
      case "alamatKtp": return <span className={`truncate max-w-[150px] inline-block ${textSecondary}`} title={item.alamatKtp}>{item.alamatKtp || "-"}</span>;
      case "type": return <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm shadow-sm whitespace-nowrap inline-block ${item.type === "GAKIN" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{item.type}</span>;
      case "usia": return <span className={textSecondary}>{item.usia ? `${item.usia} thn` : "-"}</span>;
      case "jenisKelamin": return <span className={textSecondary}>{item.jenisKelamin || "-"}</span>;
      case "phone": return <span className={textSecondary}>{item.phone || "-"}</span>;
      case "pendidikan": return <span className={textSecondary}>{item.pendidikan || "-"}</span>;
      case "agama": return <span className={textSecondary}>{item.agama || "-"}</span>;
      case "bidangUsaha": return <span className={textSecondary}>{item.bidangUsaha || "-"}</span>;
      case "klaster": return renderBatteryScore(item);
      default: return <span className={textSecondary}>{String((item as unknown as Record<string, unknown>)[col] ?? "-")}</span>;
    }
  };

  return (
    <AdminLayout title="Hasil Kuesioner Responden" headerIcon={<Users className="w-4 h-4" />}>
      {/* SUCCESS ALERT */}
      {showSuccessAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'opacity-100 translate-y-0'}`}>
          <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
            <div className={`p-2 rounded-xl border shrink-0 ${"border-emerald-200 bg-emerald-100"}`}><CheckCircle className={`w-6 h-6 ${"text-emerald-600"}`} /></div>
            <div><h3 className="text-white font-bold text-sm mb-1">Berhasil</h3><p className={`text-xs ${"text-emerald-900"}`}>{alertMsg}</p></div>
          </div>
        </div>
      )}
      
      {/* ── HEADER SUMMARY ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${textPrimary}`}>
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 border border-blue-500/30"><Users className="w-6 h-6 shadow-inner" /></div>
            Hasil Klasifikasi Kuesioner
          </h1>
          <button onClick={() => setShowResetAllModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-500 hover:text-purple-400 hover:bg-purple-500/20 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <RotateCcw className="w-4 h-4" /> Reset Semua Kuesioner
          </button>
        </div>
        <p className={`mt-1 max-w-2xl text-sm leading-relaxed ${textSecondary}`}>
          Kelola data subjek dan pantau secara langsung hasil analisis baterai dari kuesioner. Hanya responden yang telah melengkapi data yang akan masuk dalam skoring klaster.
        </p>
      </motion.div>

      {/* ── KLASTER FILTER TABS + COLUMN TOGGLE ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="shadow-sm backdrop-blur-xl rounded-xl p-1.5 flex items-center gap-1 border bg-white/80 border-gray-200">
          <Users className={`w-4 h-4 mx-2 ${textSecondary}`} />
          {KLASTER_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => handleKlasterTabChange(opt.key)}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeKlasterTab === opt.key ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
              {activeKlasterTab === opt.key && (
                <motion.div layoutId="active-respondent-filter" className="absolute inset-0 rounded-lg bg-blue-500/15 border border-blue-500/20 shadow-sm backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Columns Toggle */}
          <div className="relative" ref={colDropdownRef}>
            <button onClick={() => setShowColDropdown(!showColDropdown)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm backdrop-blur-md border transition-all ${btnOutline}`}>
              <SlidersHorizontal className="w-4 h-4" /> Columns
            </button>
            <AnimatePresence>
              {showColDropdown && (
                <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }} transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-full mt-2 w-56 shadow-2xl backdrop-blur-2xl border rounded-2xl z-50 py-2 overflow-hidden ${dropdownBg}`}>
                  <p className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b mb-1 ${textSecondary} ${borderCol}`}>Toggle columns</p>
                  <div className="overflow-y-auto max-h-[50vh]">
                    {ALL_COLUMNS.map(col => (
                      <button key={col.key} onClick={() => toggleColumn(col.key)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${dropdownHover}`}>
                        <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${visibleColsSet.has(col.key) ? "bg-blue-500/80 border-blue-500/50 shadow-sm" : `border-gray-300 ${"bg-white"}`}`}>
                          {visibleColsSet.has(col.key) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={visibleColsSet.has(col.key) ? textPrimary : textSecondary}>{col.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input type="text" placeholder="Cari NIK atau nama..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full pl-10 pr-4 py-2.5 shadow-sm backdrop-blur-md border rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all outline-none ${inputBg}`} />
        </div>
        <div className={`flex items-center gap-3 text-sm ${textSecondary}`}>
          {filteredData.length} data ditemukan
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className={`shadow-sm backdrop-blur-xl rounded-2xl border overflow-hidden ${bgTableCard}`}>
        <div className="overflow-x-auto dark-scrollbar pb-2">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className={`font-semibold text-[13px] ${tableHeader}`}>
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                {ALL_COLUMNS.filter(c => visibleColsSet.has(c.key)).map(col => (
                  <th key={col.key} className="px-6 py-4">
                    {col.sortable ? (
                      <button onClick={() => handleSort(col.key)} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group text-inherit font-inherit">
                        {col.label}
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortCol === col.key ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-400'}`} />
                      </button>
                    ) : ( col.label )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${"divide-gray-100"}`}>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <motion.tr key={`${animKey}-${item.id}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * index, duration: 0.4, ease: "easeOut" }}
                    onClick={() => navigate(`/admin/respondent-score/${item.nik}`)}
                    className={`transition-all group cursor-pointer ${rowHoverBg}`}>
                    <td className={`px-6 py-4 font-mono text-xs ${textSecondary}`}>{startIndex + index + 1}</td>
                    {displayCols.map(colKey => <td key={colKey} className="px-6 py-4">{renderCellContent(item, colKey)}</td>)}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={displayCols.length + 1} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Database className="w-12 h-12 text-gray-500 drop-shadow-lg opacity-50" />
                      <p className={`font-medium ${textSecondary}`}>Tidak ada data responden yang ditemukan.</p>
                      <button onClick={() => { setSearchTerm(""); setActiveKlasterTab("Keseluruhan"); }} 
                        className="mt-2 text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-semibold transition-colors">
                        Reset Filter
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showRowsDropdown && (
          <div ref={rowsDropdownRef} className="fixed z-[200] w-24 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 py-2" style={{ top: getDropdownPos(rowsBtnRef).top - 170, left: getDropdownPos(rowsBtnRef).left }}>
            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">Rows</p>
            {ROWS_OPTIONS.map(n => (
              <button key={n} onClick={() => { handleRowsChange(n); setShowRowsDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center justify-between ${rowsPerPage === n ? "text-blue-600 bg-blue-50 font-bold" : "text-gray-700 hover:bg-gray-50"}`}>
                {n}
                {rowsPerPage === n && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${borderCol}`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${textSecondary}`}>Rows</span>
            <button ref={rowsBtnRef} onClick={(e) => { e.stopPropagation(); setShowRowsDropdown(!showRowsDropdown); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 transition-all`}>
              {rowsPerPage} <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setAnimKey(k => k + 1); }} disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>
              Previous
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((num, idx) =>
                num === "..." ? (
                  <span key={`ellipsis-${idx}`} className={`w-9 h-9 flex items-center justify-center text-sm font-medium select-none ${textSecondary}`}>…</span>
                ) : (
                  <button key={num} onClick={() => { setCurrentPage(num); setAnimKey(k => k + 1); }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                      currentPage === num ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25" : btnOutline
                    }`}>{num}</button>
                )
              )}
            </div>
            <span className={`sm:hidden text-sm font-medium px-2 ${textSecondary}`}>
              {currentPage} / {totalPages}
            </span>
            <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setAnimKey(k => k + 1); }} disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>
              Next
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* ═══ RESET ALL MODAL ═══ */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showResetAllModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setShowResetAllModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                className="w-full max-w-md relative z-10 shadow-2xl backdrop-blur-md border rounded-3xl p-6 text-center bg-white/5 border-white/20 overflow-hidden"
              >
                <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <AlertTriangle className="w-8 h-8 text-purple-300" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Reset Seluruh Kuesioner?</h3>
                <p className="text-[13px] text-blue-100/80 mb-6 leading-relaxed">
                  Semua data terkait <strong>kuesioner baterai dan klaster</strong> akan dihapus dari seluruh responden. Data subjek asalnya akan tetap ada. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowResetAllModal(false)} 
                    className="px-5 py-2.5 rounded-xl font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                    Batal
                  </button>
                  <button onClick={handleResetAll} 
                    className="px-5 py-2.5 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/50 shadow-lg shadow-purple-500/30 transition-all text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Reset Semua
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </AdminLayout>
  );
}
