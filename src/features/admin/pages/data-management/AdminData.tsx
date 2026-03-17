import { useState, useRef, useEffect } from "react";
import { Search, Database, ChevronDown, MapPin, Plus, X, User, Home, BookOpen, Briefcase, CheckCircle, Download, SlidersHorizontal, Check, ArrowUpDown, Filter, Trash2, AlertTriangle } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useAdminTheme } from "../../hooks/AdminThemeContext";

const INITIAL_DATA = [
  { id: 1, nik: "3578012345670001", nama: "Andi Wijaya", kecamatan: "Kenjeran", kelurahan: "Tambak Wedi", usia: 34, type: "GAKIN", jenisKelamin: "Laki-laki", phone: "081234567001", pendidikan: "S1", agama: "Islam" },
  { id: 2, nik: "3578012345670002", nama: "Sari Dewi Lestari", kecamatan: "Bulak", kelurahan: "Kedung Cowek", usia: 28, type: "Non-GAKIN", jenisKelamin: "Perempuan", phone: "081234567002", pendidikan: "SMA / SMK", agama: "Islam" },
  { id: 3, nik: "3578012345670003", nama: "Budi Santoso", kecamatan: "Tambaksari", kelurahan: "Ploso", usia: 45, type: "GAKIN", jenisKelamin: "Laki-laki", phone: "081234567003", pendidikan: "S1", agama: "Islam" },
  { id: 4, nik: "3578012345670004", nama: "Rina Cahyani", kecamatan: "Semampir", kelurahan: "Ampel", usia: 31, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567004", pendidikan: "D3", agama: "Islam" },
  { id: 5, nik: "3578012345670005", nama: "Hendra Putra Pratama", kecamatan: "Pabean Cantikan", kelurahan: "Bongkaran", usia: 39, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567005", pendidikan: "S1", agama: "Kristen" },
  { id: 6, nik: "3578012345670006", nama: "Dewi Lestari Sari", kecamatan: "Krembangan", kelurahan: "Morokrembangan", usia: 26, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567006", pendidikan: "SMA / SMK", agama: "Islam" },
  { id: 7, nik: "3578012345670007", nama: "Ahmad Fauzi Rahman", kecamatan: "Kenjeran", kelurahan: "Bulak Banteng", usia: 52, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567007", pendidikan: "SD", agama: "Islam" },
  { id: 8, nik: "3578012345670008", nama: "Siti Aminah", kecamatan: "Gubeng", kelurahan: "Mojo", usia: 29, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567008", pendidikan: "S1", agama: "Islam" },
  { id: 9, nik: "3578012345670009", nama: "Rudi Hermawan", kecamatan: "Sukolilo", kelurahan: "Keputih", usia: 37, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567009", pendidikan: "S2", agama: "Katolik" },
  { id: 10, nik: "3578012345670010", nama: "Maya Puspita Dewi", kecamatan: "Rungkut", kelurahan: "Kalirungkut", usia: 24, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567010", pendidikan: "SMA / SMK", agama: "Islam" },
  { id: 11, nik: "3578012345670011", nama: "Dimas Prasetyo", kecamatan: "Wonokromo", kelurahan: "Darmo", usia: 41, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567011", pendidikan: "S1", agama: "Islam" },
  { id: 12, nik: "3578012345670012", nama: "Wulan Sari Ningrum", kecamatan: "Tegalsari", kelurahan: "Dr. Soetomo", usia: 33, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567012", pendidikan: "D3", agama: "Hindu" },
  { id: 13, nik: "3578012345670013", nama: "Agus Setiawan", kecamatan: "Sawahan", kelurahan: "Putat Jaya", usia: 47, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567013", pendidikan: "SMP", agama: "Islam" },
  { id: 14, nik: "3578012345670014", nama: "Lina Marlina", kecamatan: "Genteng", kelurahan: "Embong Kaliasin", usia: 30, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567014", pendidikan: "S1", agama: "Islam" },
  { id: 15, nik: "3578012345670015", nama: "Fajar Nugroho", kecamatan: "Bubutan", kelurahan: "Tembok Dukuh", usia: 36, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567015", pendidikan: "S1", agama: "Kristen" },
  { id: 16, nik: "3578012345670016", nama: "Yeni Fitriani", kecamatan: "Simokerto", kelurahan: "Sidodadi", usia: 27, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567016", pendidikan: "SMA / SMK", agama: "Islam" },
  { id: 17, nik: "3578012345670017", nama: "Bambang Susilo", kecamatan: "Pabean Cantikan", kelurahan: "Perak Timur", usia: 55, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567017", pendidikan: "SD", agama: "Islam" },
  { id: 18, nik: "3578012345670018", nama: "Ratna Kumala Sari", kecamatan: "Tandes", kelurahan: "Karangpoh", usia: 32, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567018", pendidikan: "D3", agama: "Islam" },
  { id: 19, nik: "3578012345670019", nama: "Eko Prasetyo Wibowo", kecamatan: "Lakarsantri", kelurahan: "Lidah Kulon", usia: 43, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567019", pendidikan: "S1", agama: "Islam" },
  { id: 20, nik: "3578012345670020", nama: "Indah Permata Sari", kecamatan: "Wiyung", kelurahan: "Jajar Tunggal", usia: 25, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567020", pendidikan: "SMA / SMK", agama: "Islam" },
  { id: 21, nik: "3578012345670021", nama: "Surya Adi Putra", kecamatan: "Dukuh Pakis", kelurahan: "Dukuh Kupang", usia: 38, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567021", pendidikan: "S1", agama: "Buddha" },
  { id: 22, nik: "3578012345670022", nama: "Putri Amelia", kecamatan: "Gayungan", kelurahan: "Gayungan", usia: 22, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567022", pendidikan: "SMA / SMK", agama: "Islam" },
  { id: 23, nik: "3578012345670023", nama: "Wahyu Hidayat", kecamatan: "Jambangan", kelurahan: "Jambangan", usia: 49, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567023", pendidikan: "SMP", agama: "Islam" },
  { id: 24, nik: "3578012345670024", nama: "Nurul Hasanah", kecamatan: "Tenggilis Mejoyo", kelurahan: "Panjang Jiwo", usia: 35, type: "GAKIN", jenisKelamin: "Perempuan", phone: "081234567024", pendidikan: "S1", agama: "Islam" },
  { id: 25, nik: "3578012345670025", nama: "Rizki Ramadhan", kecamatan: "Mulyorejo", kelurahan: "Manyar Sabrangan", usia: 40, type: "Non-GAKIN", jenisKelamin: "Laki-laki", phone: "081234567025", pendidikan: "S2", agama: "Islam" },
];

type FilterTab = "Keseluruhan" | "GAKIN" | "Non-GAKIN";
type DataItem = typeof INITIAL_DATA[0];

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
  const { isDark } = useAdminTheme();
  
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
  const getPageNumbers = () => { const p: number[] = []; for (let i = 1; i <= totalPages; i++) p.push(i); return p; };

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
  const textPrimary   = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const bgCard        = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-sm";
  const bgTableCard   = isDark ? "bg-white/[0.02] border-white/10" : "bg-white/95 border-gray-300 shadow-md";
  const tableHeader   = isDark ? "border-b border-white/10 text-gray-400 bg-white/5" : "border-b border-gray-300 text-gray-700 bg-gray-100/50";
  const borderCol     = isDark ? "border-white/10" : "border-gray-300";
  const rowHoverBg    = isDark ? "hover:bg-white/5" : "hover:bg-gray-100/50";
  const dropdownBg    = isDark ? "bg-[#111] border-white/10 text-gray-300" : "bg-white border-gray-300 text-gray-800 shadow-xl";
  const dropdownHover = isDark ? "hover:bg-white/10" : "hover:bg-gray-50";
  const inputBg       = isDark ? "bg-black/30 border-white/20 text-white placeholder:text-gray-500 focus:border-red-500/50" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-red-500 hover:border-gray-400";
  const btnOutline    = isDark ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-sm";
  const glowLight     = isDark ? "bg-red-600/10" : "bg-red-600/5";

  // Reusable classes based on theme
  const formInputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-red-500/50 outline-none shadow-inner transition-all ${inputBg}`;

  const renderCellContent = (item: DataItem, col: ColumnKey) => {
    switch (col) {
      case "nama": return <p className={`font-semibold transition-colors ${isDark ? "text-gray-100 group-hover:text-red-400" : "text-gray-800 group-hover:text-red-500"}`}>{item.nama}</p>;
      case "nik": return <span className={`font-mono text-xs shadow-sm px-2 py-1 rounded-md border ${isDark ? "bg-black/40 text-gray-400 border-white/10" : "bg-gray-50 text-gray-600 border-gray-200"}`}>{item.nik}</span>;
      case "kecamatan": return <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className={textSecondary}>{item.kecamatan}</span></div>;
      case "kelurahan": return <span className={textSecondary}>{item.kelurahan}</span>;
      case "type": return <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-sm ${item.type === "GAKIN" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>{item.type}</span>;
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
          className="flex items-center gap-1 hover:text-red-400 transition-colors">
          {label} {kecFilter && <span className="text-red-500 text-[10px]">●</span>}
          <Filter className="w-3 h-3" />
        </button>
      );
    }
    if (col === "kelurahan") {
      return (
        <button ref={kelBtnRef} onClick={(e) => { e.stopPropagation(); setShowKelDropdown(!showKelDropdown); setShowKecDropdown(false); }}
          className="flex items-center gap-1 hover:text-red-400 transition-colors">
          {label} {kelFilter && <span className="text-red-500 text-[10px]">●</span>}
          <Filter className="w-3 h-3" />
        </button>
      );
    }
    return (
      <button onClick={() => handleSort(col)} className="flex items-center gap-1 hover:text-red-400 transition-colors outline-none">
        {label}<ArrowUpDown className={`w-3 h-3 ${sortCol === col ? "text-red-500" : ""}`} />
      </button>
    );
  };

  return (
    <AdminLayout title="Data Responden" headerIcon={<Database className="w-4 h-4" />}>

      {/* ── SUCCESS ALERT ── */}
      {showSuccessAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm transition-all duration-500 ease-in-out ${isAlertExiting ? 'opacity-0 -translate-y-8 blur-sm scale-95' : 'animate-bounce-in opacity-100 translate-y-0 blur-none scale-100'}`}>
          <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
            <div className={`p-2 rounded-xl backdrop-blur-md border shadow-inner flex-shrink-0 ${isDark ? "bg-emerald-500/30 border-white/10" : "bg-emerald-100 border-emerald-200"}`}><CheckCircle className={`w-6 h-6 ${isDark ? "text-emerald-200" : "text-emerald-600"}`} /></div>
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
              className={`w-full max-w-sm relative z-10 border rounded-2xl shadow-2xl p-6 text-center ${isDark ? "bg-[#111] border-white/20" : "bg-white border-gray-200"}`}>
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Hapus Data?</h3>
              <p className={`text-sm mb-6 ${textSecondary}`}>Anda yakin ingin menghapus data responden <span className={`font-semibold ${textPrimary}`}>{itemToDelete.nama}</span>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setItemToDelete(null)} className={`flex-1 py-2.5 rounded-xl border shadow-sm font-semibold transition-colors ${btnOutline}`}>Batal</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-900/20">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD DATA MODAL (Genie Effect) ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 perspective-[1000px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: 45 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: -45 }}
              transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
              className="w-full max-w-lg md:max-w-xl relative z-10 origin-center rounded-2xl overflow-hidden">
              <div className={`shadow-2xl border backdrop-blur-2xl relative flex flex-col ${isDark ? "bg-[#111]/95 border-white/20" : "bg-white/95 border-gray-200"}`} style={{ maxHeight: "85vh" }}>
                <div className={`absolute -top-24 -right-24 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />
                <div className={`flex items-center justify-between p-6 pb-4 relative z-10 border-b shrink-0 ${borderCol}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shadow-inner"><Plus className="w-5 h-5 text-red-500" /></div>
                    <div><h2 className={`text-lg font-bold ${textPrimary}`}>Tambah Data GAKIN</h2><p className={`text-xs ${textSecondary}`}>Masukkan data diri responden baru.</p></div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className={`${textSecondary} hover:${textPrimary} transition-colors`}><X className="w-5 h-5" /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar" style={{ maxHeight: "calc(85vh - 140px)" }}>
                  <form ref={formRef} id="addGakinForm" onSubmit={handleAddSubmit} className="space-y-6 relative z-10">
                    <div>
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Data Diri</h3>
                      <div className="space-y-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>NIK <span className="text-red-500">*</span></label><input name="nik" type="text" placeholder="Masukkan NIK (16 digit)" className={formInputClass} maxLength={16} required /></div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Nama Lengkap <span className="text-red-500">*</span></label><input name="nama" type="text" placeholder="Masukkan nama lengkap" className={formInputClass} required /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Jenis Kelamin <span className="text-red-500">*</span></label>
                            <select name="jenisKelamin" className={formInputClass} required>
                              <option value="" className={isDark ? "bg-[#1a1a1a]" : "bg-white"}>Pilih</option>
                              <option value="Laki-laki" className={isDark ? "bg-[#1a1a1a]" : "bg-white"}>Laki-laki</option>
                              <option value="Perempuan" className={isDark ? "bg-[#1a1a1a]" : "bg-white"}>Perempuan</option>
                            </select>
                          </div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>No. Telepon <span className="text-red-500">*</span></label><input name="phone" type="tel" placeholder="08xxxxxxxxxx" className={formInputClass} required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Tempat Lahir <span className="text-red-500">*</span></label><input name="tempatLahir" type="text" placeholder="Kota/Kabupaten" className={formInputClass} required /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Tanggal Lahir <span className="text-red-500">*</span></label><input name="tanggalLahir" type="date" className={formInputClass} required /></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Home className="w-3.5 h-3.5" /> Alamat KTP</h3>
                      <div className="space-y-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Alamat Lengkap <span className="text-red-500">*</span></label><input type="text" placeholder="Jl. Contoh No. 123" className={formInputClass} required /></div>
                        <div className="grid grid-cols-4 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>RT</label><input type="text" placeholder="001" className={formInputClass} maxLength={3} /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>RW</label><input type="text" placeholder="005" className={formInputClass} maxLength={3} /></div>
                          <div className="col-span-2"><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kecamatan <span className="text-red-500">*</span></label><input name="kecamatan" type="text" placeholder="Kecamatan" className={formInputClass} required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kelurahan <span className="text-red-500">*</span></label><input name="kelurahan" type="text" placeholder="Kelurahan" className={formInputClass} required /></div>
                          <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kode Pos</label><input type="text" placeholder="60285" className={formInputClass} maxLength={5} /></div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className={`px-6 py-4 border-t shrink-0 relative z-10 ${borderCol}`}>
                  <button type="submit" form="addGakinForm" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 text-sm font-bold rounded-lg transition-colors">Tambahkan Data GAKIN</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PAGE HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500 border border-red-500/30"><Database className="w-6 h-6" /></div>
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
              className={`relative px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${activeTab === opt.key ? (isDark ? "text-white" : "text-gray-900") : "text-gray-500 hover:text-red-500"}`}>
              {activeTab === opt.key && (
                <motion.div layoutId="active-data-filter" className={`absolute inset-0 rounded-lg ${isDark ? "bg-white/10" : "bg-gray-100"}`} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
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
                      <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${visibleColsSet.has(col.key) ? "bg-red-500/80 border-red-500/50 shadow-sm" : `border-gray-300 ${isDark ? "bg-black/20" : "bg-white"}`}`}>
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
                activeTab === "GAKIN" ? "bg-red-600 hover:bg-red-700 text-white border-red-500/50 shadow-lg shadow-red-900/20" : `shadow-sm cursor-not-allowed opacity-50 ${btnOutline}`
              }`}>
              <Plus className="w-4 h-4" /> Tambah Data
            </button>
          )}
        </div>
      </motion.div>

      {/* ── SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          <input type="text" placeholder="Cari NIK atau nama..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full pl-10 pr-4 py-2.5 shadow-sm backdrop-blur-md border rounded-xl focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-sm transition-all outline-none ${isDark ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`} />
        </div>
        <div className={`flex items-center gap-3 text-sm ${textSecondary}`}>
          {(kecFilter || kelFilter) && (
            <button onClick={() => { setKecFilter(""); setKelFilter(""); setCurrentPage(1); }}
              className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"><X className="w-3 h-3" /> Reset filter</button>
          )}
          {filteredData.length} data ditemukan
        </div>
      </div>

      {/* ── FIXED FILTER DROPDOWNS ── */}
      {showKecDropdown && (
        <div ref={kecDropdownRef} className={`fixed z-[200] w-48 border rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto ${dropdownBg}`} style={{ top: getDropdownPos(kecBtnRef).top, left: getDropdownPos(kecBtnRef).left }}>
          <button onClick={() => { setKecFilter(""); setShowKecDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${!kecFilter ? "text-red-500" : dropdownHover}`}>Semua Kecamatan</button>
          {allKecamatans.map(k => <button key={k} onClick={() => { setKecFilter(k); setShowKecDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${kecFilter === k ? "text-red-500" : dropdownHover}`}>{k}{kecFilter === k && <Check className="w-3 h-3 text-red-500" />}</button>)}
        </div>
      )}
      {showKelDropdown && (
        <div ref={kelDropdownRef} className={`fixed z-[200] w-48 border rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto ${dropdownBg}`} style={{ top: getDropdownPos(kelBtnRef).top, left: getDropdownPos(kelBtnRef).left }}>
          <button onClick={() => { setKelFilter(""); setShowKelDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${!kelFilter ? "text-red-500" : dropdownHover}`}>Semua Kelurahan</button>
          {allKelurahans.map(k => <button key={k} onClick={() => { setKelFilter(k); setShowKelDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${kelFilter === k ? "text-red-500" : dropdownHover}`}>{k}{kelFilter === k && <Check className="w-3 h-3 text-red-500" />}</button>)}
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
            <tbody className={`divide-y text-sm ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
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
                          <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors group/btn">
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
                className={`appearance-none shadow-sm backdrop-blur-md border text-sm font-semibold rounded-lg px-4 py-2 pr-8 cursor-pointer transition-all outline-none focus:ring-1 focus:ring-red-500/50 ${btnOutline}`}>
                {ROWS_OPTIONS.map(n => <option key={n} value={n} className={isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-900"}>{n}</option>)}
              </select>
              <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${textSecondary}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Previous</button>
            {getPageNumbers().map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 text-sm font-bold rounded-lg border transition-all ${currentPage === page ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" : btnOutline}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium rounded-lg border shadow-sm backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnOutline}`}>Next</button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
