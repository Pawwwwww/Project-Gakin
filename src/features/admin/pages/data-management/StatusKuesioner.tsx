import { useState, useRef, useEffect } from "react";
import { Search, ClipboardList, Users, SlidersHorizontal, Check, MapPin, ChevronDown, Filter, X } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { getKuesionerResult } from "../../../../services/StorageService";
import { getDataItems, type DataItem as RawDataItem } from "../../../../data/mockRespondents";

interface DataItem {
  nik: string;
  nama: string;
  kecamatan: string;
  kelurahan: string;
  type: "GAKIN" | "Non-GAKIN";
  usia: number;
  jenisKelamin: string;
  phone: string;
  pendidikan: string;
  agama: string;
  hasFilledKuesioner: boolean;
}

function buildDataItems(): DataItem[] {
  const rawItems = getDataItems();
  return rawItems.map((u): DataItem => ({
    nik:      u.nik,
    nama:     u.nama,
    kecamatan: u.kecamatan || "-",
    kelurahan: u.kelurahan || "-",
    type:     u.type as "GAKIN" | "Non-GAKIN",
    usia:     u.usia,
    jenisKelamin: u.jenisKelamin || "-",
    phone:    u.phone || "-",
    pendidikan: u.pendidikan || "-",
    agama:    u.agama || "-",
    hasFilledKuesioner: Boolean(getKuesionerResult(u.nik)),
  }));
}

type ColumnKey = "nama" | "nik" | "kecamatan" | "kelurahan" | "type" | "usia" | "jenisKelamin" | "phone" | "pendidikan" | "agama" | "status";
const ALL_COLUMNS: { key: ColumnKey; label: string; sortable?: boolean }[] = [
  { key: "nama", label: "Nama Lengkap", sortable: true },
  { key: "nik", label: "NIK", sortable: true },
  { key: "type", label: "Tipe Data" },
  { key: "usia", label: "Usia" },
  { key: "jenisKelamin", label: "Jenis Kelamin" },
  { key: "kecamatan", label: "Kecamatan" },
  { key: "kelurahan", label: "Kelurahan" },
  { key: "phone", label: "No. Telepon" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "agama", label: "Agama" },
  { key: "status", label: "Status Kuesioner" },
];

const DEFAULT_VISIBLE = new Set<ColumnKey>(["nama", "nik", "kecamatan", "type", "status"]);

export default function StatusKuesioner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCol, setSortCol] = useState<ColumnKey | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [visibleColsSet, setVisibleColsSet] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE));
  const [showColDropdown, setShowColDropdown] = useState(false);
  const colDropdownRef = useRef<HTMLDivElement>(null);

  const [kecFilter, setKecFilter] = useState<string>("");
  const [kelFilter, setKelFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [showKecDropdown, setShowKecDropdown] = useState(false);
  const [showKelDropdown, setShowKelDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const kecBtnRef = useRef<HTMLButtonElement>(null);
  const kelBtnRef = useRef<HTMLButtonElement>(null);
  const typeBtnRef = useRef<HTMLButtonElement>(null);
  const statusBtnRef = useRef<HTMLButtonElement>(null);

  const kecDropdownRef = useRef<HTMLDivElement>(null);
  const kelDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_OPTIONS = [10, 25, 50];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colDropdownRef.current && !colDropdownRef.current.contains(target)) setShowColDropdown(false);
      if (kecDropdownRef.current && !kecDropdownRef.current.contains(target) && kecBtnRef.current && !kecBtnRef.current.contains(target)) {
        setShowKecDropdown(false);
      }
      if (kelDropdownRef.current && !kelDropdownRef.current.contains(target) && kelBtnRef.current && !kelBtnRef.current.contains(target)) {
        setShowKelDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target) && typeBtnRef.current && !typeBtnRef.current.contains(target)) {
        setShowTypeDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target) && statusBtnRef.current && !statusBtnRef.current.contains(target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [allData, setAllData] = useState<DataItem[]>(() => buildDataItems());

  // Real-time sync: refresh when localStorage changes or tab regains focus
  useEffect(() => {
    setAllData(buildDataItems());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "users") setAllData(buildDataItems());
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") setAllData(buildDataItems());
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const userRole = localStorage.getItem("role");
  const adminKecamatan = localStorage.getItem("adminKecamatan");

  let filteredData = allData.filter((item: DataItem) => {
    if (userRole === "camat" && adminKecamatan) {
      if (item.kecamatan.toLowerCase() !== adminKecamatan.toLowerCase()) return false;
    }
    if (kecFilter && item.kecamatan !== kecFilter) return false;
    if (kelFilter && item.kelurahan !== kelFilter) return false;
    if (typeFilter && item.type !== typeFilter) return false;
    if (statusFilter === "Sudah Mengisi" && !item.hasFilledKuesioner) return false;
    if (statusFilter === "Belum Mengisi" && item.hasFilledKuesioner) return false;
    return item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.nik.includes(searchTerm);
  });

  const allKecamatans = [...new Set(allData.map(d => d.kecamatan))].sort();
  const allKelurahans = [...new Set(allData.map(d => d.kelurahan))].sort();

  if (sortCol) {
    filteredData = [...filteredData].sort((a: DataItem, b: DataItem) => {
      if (sortCol === "status") {
        const aStatus = a.hasFilledKuesioner ? 1 : 0;
        const bStatus = b.hasFilledKuesioner ? 1 : 0;
        return sortDir === "asc" ? aStatus - bStatus : bStatus - aStatus;
      }
      const valA = (a as unknown as Record<string, unknown>)[sortCol];
      const valB = (b as unknown as Record<string, unknown>)[sortCol];
      const strA = String(valA ?? "");
      const strB = String(valB ?? "");
      return sortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  
  // Smart ellipsis pagination — always shows first, last, current ±2, with '...' gaps
  const getPaginationItems = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    const items: (number | "...")[] = [1];
    if (range[0] > 2) items.push("...");
    items.push(...range);
    if (range[range.length - 1] < totalPages - 1) items.push("...");
    items.push(totalPages);
    return items;
  };
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

  const availableColumns = userRole === "camat" ? ALL_COLUMNS.filter(c => c.key !== "kecamatan") : ALL_COLUMNS;
  const displayCols = availableColumns.map(c => c.key).filter(c => visibleColsSet.has(c));

  const getDropdownPos = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!ref.current) return { top: 0, left: 0 };
    const rect = ref.current.getBoundingClientRect();
    return { top: rect.bottom + 8, left: rect.left };
  };

  // ── THEME CLASSES ──
  const textPrimary   = "text-gray-900";
  const textSecondary = "text-gray-600";
  const bgTableCard   = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const bgCard        = "bg-white border-gray-300 shadow-xl";
  const borderCol     = "border-gray-300";
  const dropdownHover = "hover:bg-gray-50";
  const rowHoverBg    = "hover:bg-gray-50 shadow-sm";
  const inputBg       = "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-600 hover:border-gray-400";
  const btnOutline    = "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-sm";
  const tableHeader   = "border-b border-gray-300 text-gray-700 bg-gray-100/50";

  const renderCellContent = (item: DataItem, col: ColumnKey) => {
    switch (col) {
      case "nama": return <p className={`font-semibold transition-colors ${"text-gray-800 group-hover:text-blue-600"}`}>{item.nama}</p>;
      case "nik": return <span className={`font-mono text-xs shadow-sm px-2 py-1 rounded-md border ${"bg-gray-50 text-gray-600 border-gray-200"}`}>{item.nik}</span>;
      case "kecamatan": return <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className={textSecondary}>{item.kecamatan}</span></div>;
      case "kelurahan": return <span className={textSecondary}>{item.kelurahan}</span>;
      case "type": return <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-sm shadow-sm ${item.type === "GAKIN" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{item.type}</span>;
      case "usia": return <span className={textSecondary}>{item.usia ? `${item.usia} thn` : "-"}</span>;
      case "jenisKelamin": return <span className={textSecondary}>{item.jenisKelamin || "-"}</span>;
      case "phone": return <span className={textSecondary}>{item.phone || "-"}</span>;
      case "pendidikan": return <span className={textSecondary}>{item.pendidikan || "-"}</span>;
      case "agama": return <span className={textSecondary}>{item.agama || "-"}</span>;
      case "status": {
        const filled = item.hasFilledKuesioner;
        return (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${!filled ? ("bg-gray-100 text-gray-600 border-gray-300") : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
            {filled ? "Sudah Mengisi" : "Belum Mengisi"}
          </span>
        );
      }
      default: return <span className={textSecondary}>{String((item as unknown as Record<string, unknown>)[col] ?? "-")}</span>;
    }
  };

  return (
    <AdminLayout title="Status Kuesioner Responden" headerIcon={<ClipboardList className="w-4 h-4" />}>
      
      {/* ── HEADER SUMMARY ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 border border-blue-500/30"><ClipboardList className="w-6 h-6 shadow-inner" /></div>
          Status Kuesioner
        </h1>
        <p className={`mt-1 max-w-2xl text-sm leading-relaxed ${textSecondary}`}>
          Pantau daftar subjek yang sudah maupun belum mengisi kuesioner baterai assessment.
          {userRole === "camat" && adminKecamatan && (
            <span className="block mt-1 text-blue-500 font-medium tracking-wide">
              Menampilkan data untuk Kecamatan {adminKecamatan}
            </span>
          )}
        </p>
      </motion.div>

      {/* ── SEARCH BAR & COLUMNS ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input type="text" placeholder="Cari NIK atau nama..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full pl-10 pr-4 py-2.5 shadow-sm backdrop-blur-md rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all outline-none border ${inputBg}`} />
        </div>
        
        <div className="flex items-center gap-3">
          {(kecFilter || kelFilter || typeFilter || statusFilter) && (
            <button onClick={() => { setKecFilter(""); setKelFilter(""); setTypeFilter(""); setStatusFilter(""); setCurrentPage(1); }}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"><X className="w-3 h-3" /> Reset filter</button>
          )}
          <div className="relative" ref={colDropdownRef}>
            <button onClick={() => setShowColDropdown(!showColDropdown)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm backdrop-blur-md border transition-all ${btnOutline}`}>
              <SlidersHorizontal className="w-4 h-4" /> Columns
            </button>
            <AnimatePresence>
              {showColDropdown && (
                <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }} transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-full mt-2 w-56 shadow-2xl backdrop-blur-2xl border rounded-2xl z-50 py-2 overflow-hidden ${bgCard}`}>
                  <p className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b mb-1 ${textSecondary} ${borderCol}`}>Toggle columns</p>
                  <div className="overflow-y-auto max-h-[50vh]">
                    {availableColumns.map(col => (
                      <button key={col.key} onClick={() => toggleColumn(col.key)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 hover:bg-gray-50`}>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${visibleColsSet.has(col.key) ? "bg-blue-500/80 border-blue-500/50 shadow-sm" : `border-gray-300 ${"bg-white"}`}`}>
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
      </div>

      {/* ── FIXED FILTER DROPDOWNS ── */}
      {showKecDropdown && (
        <div ref={kecDropdownRef} className="fixed z-[200] w-56 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 py-2 max-h-60 overflow-y-auto" style={{ top: getDropdownPos(kecBtnRef).top, left: getDropdownPos(kecBtnRef).left }}>
          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">Kecamatan</p>
          <button onClick={() => { setKecFilter(""); setShowKecDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${!kecFilter ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>Semua{!kecFilter && <Check className="w-4 h-4 text-blue-500" />}</button>
          {allKecamatans.map(k => <button key={k} onClick={() => { setKecFilter(k); setShowKecDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${kecFilter === k ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{k}{kecFilter === k && <Check className="w-4 h-4 text-blue-500" />}</button>)}
        </div>
      )}
      {showKelDropdown && (
        <div ref={kelDropdownRef} className="fixed z-[200] w-56 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 py-2 max-h-60 overflow-y-auto" style={{ top: getDropdownPos(kelBtnRef).top, left: getDropdownPos(kelBtnRef).left }}>
          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">Kelurahan</p>
          <button onClick={() => { setKelFilter(""); setShowKelDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${!kelFilter ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>Semua{!kelFilter && <Check className="w-4 h-4 text-blue-500" />}</button>
          {allKelurahans.map(k => <button key={k} onClick={() => { setKelFilter(k); setShowKelDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${kelFilter === k ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{k}{kelFilter === k && <Check className="w-4 h-4 text-blue-500" />}</button>)}
        </div>
      )}
      {showTypeDropdown && (
        <div ref={typeDropdownRef} className="fixed z-[200] w-56 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 py-2 max-h-60 overflow-y-auto" style={{ top: getDropdownPos(typeBtnRef).top, left: getDropdownPos(typeBtnRef).left }}>
          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">Tipe Data</p>
          <button onClick={() => { setTypeFilter(""); setShowTypeDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${!typeFilter ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>Semua{!typeFilter && <Check className="w-4 h-4 text-blue-500" />}</button>
          {["GAKIN", "Non-GAKIN"].map(k => <button key={k} onClick={() => { setTypeFilter(k); setShowTypeDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${typeFilter === k ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{k}{typeFilter === k && <Check className="w-4 h-4 text-blue-500" />}</button>)}
        </div>
      )}
      {showStatusDropdown && (
        <div ref={statusDropdownRef} className="fixed z-[200] w-56 bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 py-2 max-h-60 overflow-y-auto" style={{ top: getDropdownPos(statusBtnRef).top, left: getDropdownPos(statusBtnRef).left }}>
          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">Status Kuesioner</p>
          <button onClick={() => { setStatusFilter(""); setShowStatusDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${!statusFilter ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>Semua{!statusFilter && <Check className="w-4 h-4 text-blue-500" />}</button>
          {["Sudah Mengisi", "Belum Mengisi"].map(k => <button key={k} onClick={() => { setStatusFilter(k); setShowStatusDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${statusFilter === k ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{k}{statusFilter === k && <Check className="w-4 h-4 text-blue-500" />}</button>)}
        </div>
      )}

      {/* ── TABLE ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`shadow-sm backdrop-blur-xl border rounded-2xl overflow-hidden ${bgTableCard}`} onClick={() => { setShowKecDropdown(false); setShowKelDropdown(false); setShowTypeDropdown(false); setShowStatusDropdown(false); }}>
        <div className="overflow-x-auto dark-scrollbar pb-2">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead className={`font-semibold text-[13px] ${tableHeader}`}>
              <tr>
                <th className="px-6 py-4">No</th>
                {displayCols.map((colKey) => {
                  const colDef = ALL_COLUMNS.find(c => c.key === colKey)!;
                  const isSorted = sortCol === colKey;

                  if (colKey === "kecamatan") {
                    return (
                      <th key={colKey} className="px-6 py-4 transition-colors select-none">
                        <button ref={kecBtnRef} onClick={(e) => { e.stopPropagation(); setShowKecDropdown(!showKecDropdown); setShowKelDropdown(false); setShowTypeDropdown(false); setShowStatusDropdown(false); }}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors outline-none text-inherit font-inherit">
                          {colDef.label} {kecFilter && <span className="text-blue-500 text-[10px]">●</span>}
                          <Filter className="w-3 h-3 ml-1 text-gray-400" />
                        </button>
                      </th>
                    );
                  }

                  if (colKey === "kelurahan") {
                    return (
                      <th key={colKey} className="px-6 py-4 transition-colors select-none">
                        <button ref={kelBtnRef} onClick={(e) => { e.stopPropagation(); setShowKelDropdown(!showKelDropdown); setShowKecDropdown(false); setShowTypeDropdown(false); setShowStatusDropdown(false); }}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors outline-none text-inherit font-inherit">
                          {colDef.label} {kelFilter && <span className="text-blue-500 text-[10px]">●</span>}
                          <Filter className="w-3 h-3 ml-1 text-gray-400" />
                        </button>
                      </th>
                    );
                  }

                  if (colKey === "type") {
                    return (
                      <th key={colKey} className="px-6 py-4 transition-colors select-none">
                        <button ref={typeBtnRef} onClick={(e) => { e.stopPropagation(); setShowTypeDropdown(!showTypeDropdown); setShowKecDropdown(false); setShowKelDropdown(false); setShowStatusDropdown(false); }}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors outline-none text-inherit font-inherit">
                          {colDef.label} {typeFilter && <span className="text-blue-500 text-[10px]">●</span>}
                          <Filter className="w-3 h-3 ml-1 text-gray-400" />
                        </button>
                      </th>
                    );
                  }

                  if (colKey === "status") {
                    return (
                      <th key={colKey} className="px-6 py-4 transition-colors select-none">
                        <button ref={statusBtnRef} onClick={(e) => { e.stopPropagation(); setShowStatusDropdown(!showStatusDropdown); setShowKecDropdown(false); setShowKelDropdown(false); setShowTypeDropdown(false); }}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors outline-none text-inherit font-inherit">
                          {colDef.label} {statusFilter && <span className="text-blue-500 text-[10px]">●</span>}
                          <Filter className="w-3 h-3 ml-1 text-gray-400" />
                        </button>
                      </th>
                    );
                  }

                  return (
                    <th key={colKey} onClick={() => colDef.sortable && handleSort(colKey)}
                      className={`px-6 py-4 ${colDef.sortable ? `cursor-pointer ${"hover:text-blue-600"} transition-colors select-none` : ""}`}>
                      <div className="flex items-center gap-2">
                        {colDef.label}
                        {colDef.sortable && (
                          <div className={`flex flex-col opacity-50 ${"text-gray-400"}`}>
                            <ChevronDown className={`w-3 h-3 -mb-1 ${isSorted && sortDir === "asc" ? "text-blue-500 opacity-100" : ""}`} style={{ transform: "rotate(180deg)" }} />
                            <ChevronDown className={`w-3 h-3 ${isSorted && sortDir === "desc" ? "text-blue-500 opacity-100" : ""}`} />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${"divide-gray-100"}`}>
              {paginatedData.map((item, index) => (
                <motion.tr key={item.nik} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`transition-colors group ${rowHoverBg}`}>
                  <td className={`px-6 py-4 font-mono text-xs ${textSecondary}`}>{startIndex + index + 1}</td>
                  {displayCols.map(colKey => (
                    <td key={colKey} className="px-6 py-4">
                      {renderCellContent(item, colKey)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
          {paginatedData.length === 0 && (
            <div className="px-6 py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <Users className="w-12 h-12 opacity-30" />
              <p className={`font-medium ${textSecondary}`}>Tidak ada data responden ditemukan.</p>
            </div>
          )}
        </div>

        {/* ── PAGINATION ── */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${borderCol}`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${textSecondary}`}>Rows</span>
            <div className="relative">
              <select value={rowsPerPage} onChange={(e) => handleRowsChange(Number(e.target.value))}
                className={`appearance-none shadow-sm border text-sm font-semibold rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer ${btnOutline}`}>
                {ROWS_OPTIONS.map(opt => <option key={opt} value={opt} className={"bg-white text-gray-900"}>{opt}</option>)}
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Prev</button>
            <div className="hidden sm:flex items-center gap-1">
              {getPaginationItems().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className={`w-9 h-9 flex items-center justify-center text-sm font-medium select-none ${textSecondary}`}>…</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm font-bold rounded-lg border transition-all ${currentPage === page ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25" : btnOutline}`}>{page}</button>
                )
              )}
            </div>
            <span className={`sm:hidden text-sm font-medium px-2 ${textSecondary}`}>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Next</button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
