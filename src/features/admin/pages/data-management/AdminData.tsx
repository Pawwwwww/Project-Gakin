import { useState, useRef, useEffect } from "react";
import { Search, Database, ChevronDown, MapPin, Plus, X, User, Home, CheckCircle, Download, SlidersHorizontal, Check, ArrowUpDown, Filter, Trash2, AlertTriangle } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { INITIAL_DATA, type DataItem } from "../../../../data/mockRespondents";
import { AddDataModal } from "./components/AddDataModal";

function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}


type FilterTab = "Keseluruhan" | "GAKIN" | "Non-GAKIN";

const FILTER_OPTIONS: { key: FilterTab; label: string }[] = [
  { key: "Keseluruhan", label: "Keseluruhan" },
  { key: "GAKIN", label: "GAKIN" },
  { key: "Non-GAKIN", label: "Non-GAKIN" },
];

const ROWS_OPTIONS = [10, 25, 50];

type ColumnKey = "nama" | "nik" | "kecamatan" | "kelurahan" | "type" | "usia" | "jenisKelamin" | "phone" | "pendidikan" | "agama";
const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "nama", label: "Nama" },
  { key: "nik", label: "NIK" },
  { key: "kecamatan", label: "Kecamatan" },
  { key: "kelurahan", label: "Kelurahan" },
  { key: "type", label: "Tipe" },
  { key: "usia", label: "Usia" },
  { key: "jenisKelamin", label: "Jenis Kelamin" },
  { key: "phone", label: "No. Telepon" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "agama", label: "Agama" },
];

const DEFAULT_VISIBLE = new Set<ColumnKey>(["nama", "nik", "kecamatan", "kelurahan", "type", "usia"]);

export default function AdminData() {
  const navigate = useNavigate();  
  const [allData, setAllData] = useState<DataItem[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("Keseluruhan");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  const [visibleColsSet, setVisibleColsSet] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE));
  const [showColDropdown, setShowColDropdown] = useState(false);
  const colDropdownRef = useRef<HTMLDivElement>(null);

  const userRole = localStorage.getItem("role") || "";

  const [kecFilter, setKecFilter] = useState<string>("");
  const [kelFilter, setKelFilter] = useState<string>("");
  const [showKecDropdown, setShowKecDropdown] = useState(false);
  const [showKelDropdown, setShowKelDropdown] = useState(false);

  const [sortCol, setSortCol] = useState<ColumnKey | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });

  const [itemToDelete, setItemToDelete] = useState<DataItem | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const kecDropdownRef = useRef<HTMLDivElement>(null);
  const kelDropdownRef = useRef<HTMLDivElement>(null);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState("Data berhasil disimpan.");
  const [isAlertExiting, setIsAlertExiting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colDropdownRef.current && !colDropdownRef.current.contains(target)) setShowColDropdown(false);
      if (kecBtnRef.current && !kecBtnRef.current.contains(target) && (!kecDropdownRef.current || !kecDropdownRef.current.contains(target))) setShowKecDropdown(false);
      if (kelBtnRef.current && !kelBtnRef.current.contains(target) && (!kelDropdownRef.current || !kelDropdownRef.current.contains(target))) setShowKelDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allKecamatans = [...new Set(allData.map(d => d.kecamatan))].sort();
  const allKelurahans = [...new Set(allData.map(d => d.kelurahan))].sort();

  let filteredData = allData.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.nik.includes(searchTerm);
    if (!matchesSearch) return false;
    if (activeTab === "GAKIN" && item.type !== "GAKIN") return false;
    if (activeTab === "Non-GAKIN" && item.type !== "Non-GAKIN") return false;
    if (kecFilter && item.kecamatan !== kecFilter) return false;
    if (kelFilter && item.kelurahan !== kelFilter) return false;
    return true;
  });

  if (sortCol) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortCol];
      const bVal = (b as any)[sortCol];
      if (typeof aVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleTabChange = (tab: FilterTab) => { setActiveTab(tab); setCurrentPage(1); setAnimKey(k => k + 1); };
  const handleRowsChange = (val: number) => { setRowsPerPage(val); setCurrentPage(1); };

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

  const toggleColumn = (col: ColumnKey) => {
    setVisibleColsSet(prev => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });
  };

  const handleSort = (col: ColumnKey) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const nik = fd.get("nik") as string || "";
    const nama = fd.get("nama") as string || "";
    const jenisKelamin = fd.get("jenisKelamin") as string || "Laki-laki";
    const phone = fd.get("phone") as string || "";
    const tanggalLahir = fd.get("tanggalLahir") as string || "";
    const kecamatan = fd.get("kecamatan") as string || "";
    const kelurahan = fd.get("kelurahan") as string || "";
    const pendidikan = fd.get("pendidikan") as string || "";
    const agama = fd.get("agama") as string || "";

    let usia = 30;
    if (tanggalLahir) {
      const birth = new Date(tanggalLahir);
      const today = new Date();
      usia = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) usia--;
    }

    const newEntry: DataItem = {
      id: allData.length + 1, nik, nama, kecamatan, kelurahan, usia,
      type: "GAKIN", jenisKelamin, phone, pendidikan, agama,
    };

    setAllData(prev => [...prev, newEntry]);
    setShowAddModal(false);
    setAnimKey(k => k + 1);
    form.reset();

    setSuccessAlertMessage("Data GAKIN berhasil ditambahkan ke sistem.");
    setShowSuccessAlert(true);
    setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowSuccessAlert(false); setIsAlertExiting(false); }, 4000);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setAllData(prev => prev.filter(d => d.nik !== itemToDelete.nik));
    setItemToDelete(null);
    setSuccessAlertMessage(`Data ${itemToDelete.nama} berhasil dihapus.`);
    setShowSuccessAlert(true);
    setIsAlertExiting(false);
    setTimeout(() => setIsAlertExiting(true), 3500);
    setTimeout(() => { setShowSuccessAlert(false); setIsAlertExiting(false); }, 4000);
  };

  const handleExport = () => {
    const cols = ALL_COLUMNS.map(c => c.key).filter(c => visibleColsSet.has(c)).filter(c => activeTab !== "Keseluruhan" ? c !== "type" : true);
    const headers = ["No", ...cols.map(c => ALL_COLUMNS.find(ac => ac.key === c)?.label || c)];
    const rows = filteredData.map((item, i) => {
      const row: string[] = [String(i + 1)];
      cols.forEach(c => {
        const val = (item as any)[c] || "";
        if (c === "nik") row.push(`'${val}`);
        else row.push(String(val));
      });
      return row;
    });

    const BOM = "\uFEFF";
    const csv = BOM + [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data_responden_${activeTab.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayCols = ALL_COLUMNS.map(c => c.key).filter(c => visibleColsSet.has(c)).filter(c => activeTab !== "Keseluruhan" ? c !== "type" : true);

  // ── THEME CLASSES ──
  const textPrimary   = "text-gray-900";
  const textSecondary = "text-gray-600";
  const bgCard        = "bg-white/95 border-gray-300 shadow-sm";
  const bgTableCard   = "bg-white/95 border-gray-300 shadow-md";
  const tableHeader   = "border-b border-gray-300 text-gray-700 bg-gray-100/50";
  const borderCol     = "border-gray-300";
  const rowHoverBg    = "hover:bg-gray-100/50";
  const dropdownBg    = "bg-white border-gray-300 text-gray-800 shadow-xl";
  const dropdownHover = "hover:bg-gray-50";
  const inputBg       = "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 hover:border-gray-400";
  const btnOutline    = "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-sm";
  const glowLight     = "bg-blue-600/5";

  // Reusable classes based on theme
  const formInputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500/50 outline-none shadow-inner transition-all ${inputBg}`;

  const renderCellContent = (item: DataItem, col: ColumnKey) => {
    switch (col) {
      case "nama": return <p className={`font-semibold transition-colors ${"text-gray-800 group-hover:text-blue-500"}`}>{toTitleCase(String(item.nama))}</p>;
      case "nik": return <span className={`font-mono text-xs shadow-sm px-2 py-1 rounded-md border ${"bg-gray-50 text-gray-600 border-gray-200"}`}>{item.nik}</span>;
      case "kecamatan": return <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className={textSecondary}>{toTitleCase(String(item.kecamatan))}</span></div>;
      case "kelurahan": return <span className={textSecondary}>{toTitleCase(String(item.kelurahan))}</span>;
      case "type": return <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-sm ${item.type === "GAKIN" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{item.type}</span>;
      case "usia": return <span className={`font-medium ${textPrimary}`}>{item.usia} <span className={`text-[10px] ${textSecondary}`}>thn</span></span>;
      case "jenisKelamin": return <span className={textSecondary}>{item.jenisKelamin}</span>;
      case "phone": return <span className={`text-xs font-mono ${textSecondary}`}>{item.phone}</span>;
      case "pendidikan": return <span className={textSecondary}>{item.pendidikan}</span>;
      case "agama": return <span className={textSecondary}>{item.agama}</span>;
      default: return <span className={textSecondary}>{(item as any)[col]}</span>;
    }
  };

  const kecBtnRef = useRef<HTMLButtonElement>(null);
  const kelBtnRef = useRef<HTMLButtonElement>(null);

  const getDropdownPos = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!ref.current) return { top: 0, left: 0 };
    const rect = ref.current.getBoundingClientRect();
    return { top: rect.bottom + 8, left: rect.left };
  };

  const renderHeaderCell = (col: ColumnKey) => {
    const label = ALL_COLUMNS.find(c => c.key === col)?.label || col;
    if (col === "kecamatan") {
      return (
        <button ref={kecBtnRef} onClick={(e) => { e.stopPropagation(); setShowKecDropdown(!showKecDropdown); setShowKelDropdown(false); }}
          className="flex items-center gap-1 hover:text-blue-400 transition-colors">
          {label} {kecFilter && <span className="text-blue-500 text-[10px]">●</span>}
          <Filter className="w-3 h-3" />
        </button>
      );
    }
    if (col === "kelurahan") {
      return (
        <button ref={kelBtnRef} onClick={(e) => { e.stopPropagation(); setShowKelDropdown(!showKelDropdown); setShowKecDropdown(false); }}
          className="flex items-center gap-1 hover:text-blue-400 transition-colors">
          {label} {kelFilter && <span className="text-blue-500 text-[10px]">●</span>}
          <Filter className="w-3 h-3" />
        </button>
      );
    }
    return (
      <button onClick={() => handleSort(col)} className="flex items-center gap-1 hover:text-blue-400 transition-colors outline-none">
        {label}<ArrowUpDown className={`w-3 h-3 ${sortCol === col ? "text-blue-500" : ""}`} />
      </button>
    );
  };

  return (
    <AdminLayout title="Data Responden" headerIcon={<Database className="w-4 h-4" />}>

      {/* ── SUCCESS ALERT ── */}
      {showSuccessAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ease-in-out ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'animate-bounce-in opacity-100 translate-y-0 blur-none scale-100'}`}>
          <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
            <div className={`p-2 rounded-xl backdrop-blur-md border shadow-inner flex-shrink-0 ${"bg-emerald-100 border-emerald-200"}`}><CheckCircle className={`w-6 h-6 ${"text-emerald-600"}`} /></div>
            <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Berhasil</h3>
                <p className="text-emerald-100 text-xs font-medium leading-relaxed">{successAlertMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 perspective-[1000px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setItemToDelete(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-sm relative z-10 border rounded-2xl shadow-2xl p-6 text-center ${"bg-white border-gray-200"}`}>
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Hapus Data?</h3>
              <p className={`text-sm mb-6 ${textSecondary}`}>Anda yakin ingin menghapus data responden <span className={`font-semibold ${textPrimary}`}>{itemToDelete.nama}</span>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setItemToDelete(null)} className={`flex-1 py-2.5 rounded-xl border shadow-sm font-semibold transition-colors ${btnOutline}`}>Batal</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-lg shadow-blue-900/20">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AddDataModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        textSecondary={textSecondary}
        textPrimary={textPrimary}
        borderCol={borderCol}
        glowLight={glowLight}
        formInputClass={formInputClass}
        modalOrigin={modalOrigin}
        allData={allData}
        formRef={formRef}
      />

      {/* ── PAGE HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 border border-blue-500/30"><Database className="w-6 h-6" /></div>
          Manajemen Data Responden
        </h1>
        <p className={`mt-1 ${textSecondary}`}>Kelola dan lacak data diri seluruh penduduk yang terdaftar.</p>
      </motion.div>

      {/* ── FILTER TABS + ACTIONS ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className={`shadow-sm backdrop-blur-md rounded-xl p-1.5 flex items-center gap-1 border ${bgCard}`}>
          <Database className={`w-4 h-4 mx-2 ${textSecondary}`} />
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => handleTabChange(opt.key)}
              className={`relative px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${activeTab === opt.key ? ("text-gray-900") : "text-gray-500 hover:text-blue-500"}`}>
              {activeTab === opt.key && (
                <motion.div layoutId="active-data-filter" className={`absolute inset-0 rounded-lg ${"bg-gray-100"}`} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
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
                  {ALL_COLUMNS.map(col => (
                    <button key={col.key} onClick={() => toggleColumn(col.key)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${dropdownHover}`}>
                      <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${visibleColsSet.has(col.key) ? "bg-blue-500/80 border-blue-500/50 shadow-sm" : `border-gray-300 ${"bg-white"}`}`}>
                        {visibleColsSet.has(col.key) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={visibleColsSet.has(col.key) ? textPrimary : textSecondary}>{col.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm backdrop-blur-md border transition-all ${btnOutline}`}>
            <Download className="w-4 h-4" /> Export
          </button>

          {(userRole === "admin_web" || userRole === "kepala_dinsos") && (
            <button onClick={(e) => {
                if (activeTab !== "GAKIN") return;
                const rect = e.currentTarget.getBoundingClientRect(); setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }); setShowAddModal(true);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                activeTab === "GAKIN" ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500/50 shadow-lg shadow-blue-900/20" : `shadow-sm cursor-not-allowed opacity-50 ${btnOutline}`
              }`}>
              <Plus className="w-4 h-4" /> Tambah Data
            </button>
          )}
        </div>
      </motion.div>

      {/* ── SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input type="text" placeholder="Cari NIK atau nama..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full pl-10 pr-4 py-2.5 shadow-sm backdrop-blur-md border rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all outline-none ${"bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`} />
        </div>
        <div className={`flex items-center gap-3 text-sm ${textSecondary}`}>
          {(kecFilter || kelFilter) && (
            <button onClick={() => { setKecFilter(""); setKelFilter(""); setCurrentPage(1); }}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"><X className="w-3 h-3" /> Reset filter</button>
          )}
          {filteredData.length} data ditemukan
        </div>
      </div>

      {/* ── FIXED FILTER DROPDOWNS ── */}
      {showKecDropdown && (
        <div ref={kecDropdownRef} className={`fixed z-[200] w-48 border rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto ${dropdownBg}`} style={{ top: getDropdownPos(kecBtnRef).top, left: getDropdownPos(kecBtnRef).left }}>
          <button onClick={() => { setKecFilter(""); setShowKecDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${!kecFilter ? "text-blue-500" : dropdownHover}`}>Semua Kecamatan</button>
          {allKecamatans.map(k => <button key={k} onClick={() => { setKecFilter(k); setShowKecDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${kecFilter === k ? "text-blue-500" : dropdownHover}`}>{k}{kecFilter === k && <Check className="w-3 h-3 text-blue-500" />}</button>)}
        </div>
      )}
      {showKelDropdown && (
        <div ref={kelDropdownRef} className={`fixed z-[200] w-48 border rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto ${dropdownBg}`} style={{ top: getDropdownPos(kelBtnRef).top, left: getDropdownPos(kelBtnRef).left }}>
          <button onClick={() => { setKelFilter(""); setShowKelDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${!kelFilter ? "text-blue-500" : dropdownHover}`}>Semua Kelurahan</button>
          {allKelurahans.map(k => <button key={k} onClick={() => { setKelFilter(k); setShowKelDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${kelFilter === k ? "text-blue-500" : dropdownHover}`}>{k}{kelFilter === k && <Check className="w-3 h-3 text-blue-500" />}</button>)}
        </div>
      )}

      {/* ── DATA TABLE ── */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className={`shadow-sm backdrop-blur-xl rounded-2xl border overflow-hidden ${bgTableCard}`} onClick={() => { setShowKecDropdown(false); setShowKelDropdown(false); }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className={`uppercase font-semibold text-[11px] tracking-wider ${tableHeader}`}>
              <tr>
                <th className="px-6 py-4">No</th>
                {displayCols.map(col => <th key={col} className="px-6 py-4">{renderHeaderCell(col)}</th>)}
                {(userRole === "admin_web" || userRole === "kepala_dinsos") && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${"divide-gray-100"}`}>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <motion.tr key={`${animKey}-${item.id}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * index, duration: 0.4, ease: "easeOut" }}
                    onClick={() => navigate(`/admin/respondent/${item.nik}`)}
                    className={`transition-all group cursor-pointer ${rowHoverBg}`}>
                    <td className={`px-6 py-4 font-mono text-xs ${textSecondary}`}>{startIndex + index + 1}</td>
                    {displayCols.map(col => <td key={col} className="px-6 py-4">{renderCellContent(item, col)}</td>)}
                    {(userRole === "admin_web" || userRole === "kepala_dinsos") && (
                      <td className="px-6 py-4 text-center">
                        {(userRole === "admin_web" || (userRole === "kepala_dinsos" && item.type === "GAKIN")) && (
                          <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors group/btn">
                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={displayCols.length + ((userRole === "admin_web" || userRole === "kepala_dinsos") ? 2 : 1)} className={`px-6 py-16 text-center text-sm ${textSecondary}`}>
                    <div className="flex flex-col items-center justify-center gap-3"><Database className="w-10 h-10 opacity-30" /><p className="font-medium">Tidak ada data yang ditemukan.</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${borderCol}`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${textSecondary}`}>Rows</span>
            <div className="relative">
              <select value={rowsPerPage} onChange={(e) => handleRowsChange(Number(e.target.value))}
                className={`appearance-none shadow-sm backdrop-blur-md border text-sm font-semibold rounded-lg px-4 py-2 pr-8 cursor-pointer transition-all outline-none focus:ring-1 focus:ring-blue-500/50 ${btnOutline}`}>
                {ROWS_OPTIONS.map(n => <option key={n} value={n} className={"bg-white text-gray-900"}>{n}</option>)}
              </select>
              <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${textSecondary}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Previous</button>
            {getPaginationItems().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className={`w-9 h-9 flex items-center justify-center text-sm font-medium select-none ${textSecondary}`}>…</span>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 text-sm font-bold rounded-lg border transition-all ${currentPage === page ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20" : btnOutline}`}>{page}</button>
              )
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Next</button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
