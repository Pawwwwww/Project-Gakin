import { useState, useRef, useEffect } from "react";
import { Search, ClipboardList, Users, SlidersHorizontal, Check, MapPin, ChevronDown } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { getUsers, getKuesionerResult } from "../../../../services/StorageService";
import type { UserRecord } from "../../../../services/StorageService";
import { useAdminTheme } from "../../hooks/AdminThemeContext";

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
  const users = getUsers();
  return users.map((u: UserRecord): DataItem => ({
    nik:      u.nik,
    nama:     u.fullName,
    kecamatan: u.kecamatanKtp || u.kecamatanDomisili || "-",
    kelurahan: u.kelurahanKtp || u.kelurahanDomisili || "-",
    type:     (u.gakinStatus as "GAKIN" | "Non-GAKIN") || "Non-GAKIN",
    usia:     calcUsia(u.tanggalLahir),
    jenisKelamin: u.jenisKelamin || "-",
    phone:    u.phone || "-",
    pendidikan: u.pendidikan || "-",
    agama:    u.agama || "-",
    hasFilledKuesioner: Boolean(getKuesionerResult(u.nik)),
  }));
}

type ColumnKey = "nama" | "nik" | "kecamatan" | "kelurahan" | "type" | "usia" | "jenisKelamin" | "phone" | "pendidikan" | "agama" | "status";
const ALL_COLUMNS: { key: ColumnKey; label: string; sortable?: boolean }[] = [
  { key: "nama", label: "Nama Lengkap" },
  { key: "nik", label: "NIK", sortable: true },
  { key: "type", label: "Tipe Data", sortable: true },
  { key: "usia", label: "Usia", sortable: true },
  { key: "jenisKelamin", label: "Jenis Kelamin" },
  { key: "kecamatan", label: "Kecamatan", sortable: true },
  { key: "kelurahan", label: "Kelurahan", sortable: true },
  { key: "phone", label: "No. Telepon" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "agama", label: "Agama" },
  { key: "status", label: "Status Kuesioner", sortable: true },
];

const DEFAULT_VISIBLE = new Set<ColumnKey>(["nama", "nik", "kecamatan", "type", "status"]);

export default function StatusKuesioner() {
  const { isDark } = useAdminTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCol, setSortCol] = useState<ColumnKey | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [visibleColsSet, setVisibleColsSet] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE));
  const [showColDropdown, setShowColDropdown] = useState(false);
  const colDropdownRef = useRef<HTMLDivElement>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_OPTIONS = [10, 25, 50];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colDropdownRef.current && !colDropdownRef.current.contains(target)) setShowColDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allData: DataItem[] = buildDataItems();
  const userRole = localStorage.getItem("role");
  const adminKecamatan = localStorage.getItem("adminKecamatan");

  let filteredData = allData.filter((item: DataItem) => {
    if (userRole === "camat" && adminKecamatan) {
      if (item.kecamatan.toLowerCase() !== adminKecamatan.toLowerCase()) return false;
    }
    return item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.nik.includes(searchTerm);
  });

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
  
  const getPageNumbers = () => { const p: number[] = []; for (let i = 1; i <= totalPages; i++) p.push(i); return p; };
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

  // ── THEME CLASSES ──
  const textPrimary   = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const bgTableCard   = isDark ? "bg-white/[0.02] border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const bgCard        = isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-300 shadow-xl";
  const borderCol     = isDark ? "border-white/10" : "border-gray-300";
  const dropdownHover = isDark ? "hover:bg-white/10" : "hover:bg-gray-50";
  const rowHoverBg    = isDark ? "hover:bg-white/5" : "hover:bg-gray-50 shadow-sm";
  const inputBg       = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-600 hover:border-gray-400";
  const btnOutline    = isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-sm";
  const tableHeader   = isDark ? "bg-white/5 text-gray-400 border-white/10" : "bg-gray-100/80 text-gray-600 border-gray-300";

  const renderCellContent = (item: DataItem, col: ColumnKey) => {
    switch (col) {
      case "nama": return <p className={`font-semibold transition-colors ${isDark ? "text-gray-100 group-hover:text-blue-400" : "text-gray-800 group-hover:text-blue-600"}`}>{item.nama}</p>;
      case "nik": return <span className={`font-mono text-xs shadow-sm px-2 py-1 rounded-md border ${isDark ? "bg-black/40 text-gray-400 border-white/10" : "bg-gray-50 text-gray-600 border-gray-200"}`}>{item.nik}</span>;
      case "kecamatan": return <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className={textSecondary}>{item.kecamatan}</span></div>;
      case "kelurahan": return <span className={textSecondary}>{item.kelurahan}</span>;
      case "type": return <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-sm shadow-sm ${item.type === "GAKIN" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{item.type}</span>;
      case "usia": return <span className={textSecondary}>{item.usia ? `${item.usia} thn` : "-"}</span>;
      case "jenisKelamin": return <span className={textSecondary}>{item.jenisKelamin || "-"}</span>;
      case "phone": return <span className={textSecondary}>{item.phone || "-"}</span>;
      case "pendidikan": return <span className={textSecondary}>{item.pendidikan || "-"}</span>;
      case "agama": return <span className={textSecondary}>{item.agama || "-"}</span>;
      case "status": {
        const filled = item.hasFilledKuesioner;
        return (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${!filled ? (isDark ? "bg-white/5 text-gray-400 border-white/10" : "bg-gray-100 text-gray-600 border-gray-300") : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
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
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${dropdownHover}`}>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${visibleColsSet.has(col.key) ? "bg-blue-500/80 border-blue-500/50 shadow-sm" : `border-gray-300 ${isDark ? "bg-black/20" : "bg-white"}`}`}>
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

      {/* ── TABLE ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`shadow-sm backdrop-blur-xl border rounded-2xl overflow-hidden ${bgTableCard}`}>
        <div className="overflow-x-auto dark-scrollbar pb-2">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead className={`border-b tracking-wider uppercase ${tableHeader}`}>
              <tr>
                {displayCols.map((colKey) => {
                  const colDef = ALL_COLUMNS.find(c => c.key === colKey)!;
                  const isSorted = sortCol === colKey;
                  return (
                    <th key={colKey} onClick={() => colDef.sortable && handleSort(colKey)}
                      className={`px-6 py-4 text-xs font-bold ${colDef.sortable ? `cursor-pointer ${isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-white hover:text-gray-900"} shadow-sm transition-colors select-none` : ""}`}>
                      <div className="flex items-center gap-2">
                        {colDef.label}
                        {colDef.sortable && (
                          <div className={`flex flex-col opacity-50 ${isDark ? "" : "text-gray-400"}`}>
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
            <tbody className={`divide-y text-sm ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
              {paginatedData.map((item) => (
                <motion.tr key={item.nik} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`transition-colors group ${rowHoverBg}`}>
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
        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${borderCol}`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${textSecondary}`}>Rows</span>
            <div className="relative">
              <select value={rowsPerPage} onChange={(e) => handleRowsChange(Number(e.target.value))}
                className={`appearance-none shadow-sm border text-sm font-semibold rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer ${btnOutline}`}>
                {ROWS_OPTIONS.map(opt => <option key={opt} value={opt} className={isDark ? "bg-[#111] text-white" : "bg-white text-gray-900"}>{opt}</option>)}
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium border shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Prev</button>
            <div className="flex gap-1 overflow-x-auto max-w-[150px] hide-scrollbar">
              {getPageNumbers().map(num => (
                <button key={num} onClick={() => setCurrentPage(num)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all min-w-[36px] ${currentPage === num ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20" : btnOutline}`}>
                  {num}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-medium border shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Next</button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
