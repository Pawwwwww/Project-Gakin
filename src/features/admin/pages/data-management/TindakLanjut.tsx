import { useState, useMemo, useCallback, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { GlassDropdown } from "../../components/GlassDropdown";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardCheck, Search, Plus, Pencil, Trash2, X, Check, AlertCircle, Building2,
  Tag, FileText, Layers, MapPin, CalendarDays, CheckCircle2, History, Sparkles, ChevronDown
} from "lucide-react";
import { getMergedUsers, getMergedResults } from "../../../../data/mockData";
import { calcFullScore } from "../../../../services/ScoringService";
import { isOPDRole, getCurrentOPDName, getCurrentOPDKlasters } from "../../../../services/StorageService";
import {
  getAssignmentMap, assignToKegiatan, reassignToKegiatan, removeAssignment,
  completeActiveKegiatan, getActiveKegiatanByOPD, createActiveKegiatan,
  getRiwayatByNIK, getCustomKegiatanNames, addCustomKegiatanName, getPesertaCount,
  type KegiatanAssignment, type ActiveKegiatan,
} from "../../../../services/KegiatanService";
import { getTindakLanjutByOPD } from "../../../../data/tindakLanjutConfig";

// ── Types ────────────────────────────────────────────────────────
interface Row { nik: string; nama: string; klaster: number; kecamatan: string; kelurahan: string; }
type FilterStatus = "all" | "belum" | "sudah";

const ROWS_OPTIONS = [10, 25, 50, 100];
const KC: Record<number, { bg: string; text: string; border: string; dot: string }> = {
  1: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  2: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  3: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  4: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
};

export default function TindakLanjut() {
  const isOPD = isOPDRole();
  const opdNama = getCurrentOPDName();
  const opdKlasters = getCurrentOPDKlasters();

  // ── Respondent data ─────────────────────────────────────
  const rows: Row[] = useMemo(() => {
    const allUsers = getMergedUsers();
    const allResults = getMergedResults();
    const resultMap = new Map(allResults.map(r => [r.nik, r]));
    const out: Row[] = [];
    for (const u of allUsers) {
      if (u.gakinStatus !== "GAKIN") continue;
      const res = resultMap.get(u.nik);
      if (!res) continue;
      const s = calcFullScore(res.data);
      if (isOPD && !opdKlasters.includes(s.kluster)) continue;
      out.push({ nik: u.nik, nama: u.fullName, klaster: s.kluster, kecamatan: u.kecamatanKtp || "-", kelurahan: u.kelurahanKtp || "-" });
    }
    return out;
  }, [isOPD, opdKlasters]);

  const uKec = useMemo(() => [...new Set(rows.map(r => r.kecamatan).filter(k => k !== "-"))].sort(), [rows]);
  const uKel = useMemo(() => [...new Set(rows.map(r => r.kelurahan).filter(k => k !== "-"))].sort(), [rows]);
  const uKlaster = useMemo(() => [...new Set(rows.map(r => r.klaster))].sort(), [rows]);

  // ── State ───────────────────────────────────────────────
  const [aMap, setAMap] = useState<Record<string, KegiatanAssignment>>(() => getAssignmentMap());
  const [fStatus, setFStatus] = useState<FilterStatus>("all");
  const [fKlaster, setFKlaster] = useState("0");
  const [fKec, setFKec] = useState("");
  const [fKel, setFKel] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rpp, setRpp] = useState(15);
  const [modalNik, setModalNik] = useState<string | null>(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [selKegId, setSelKegId] = useState("");
  const [showNewKeg, setShowNewKeg] = useState(false);
  const [newKegName, setNewKegName] = useState("");
  const [newKegDate, setNewKegDate] = useState(new Date().toISOString().split("T")[0]);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [deleteNik, setDeleteNik] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [activeKeg, setActiveKeg] = useState<ActiveKegiatan[]>(() => isOPD ? getActiveKegiatanByOPD(opdNama) : []);

  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(t); } }, [msg]);

  const refresh = useCallback(() => {
    setAMap(getAssignmentMap());
    if (isOPD) setActiveKeg(getActiveKegiatanByOPD(opdNama));
  }, [isOPD, opdNama]);

  // ── Kegiatan name options (for creating new cards) ──────
  const getNameOptions = useCallback((klaster?: number): string[] => {
    if (!isOPD || !opdNama) return [];
    const all = new Set<string>();
    const klasters = klaster ? [klaster] : opdKlasters;
    for (const k of klasters) {
      for (const n of getTindakLanjutByOPD(k, opdNama)) all.add(n);
    }
    for (const c of getCustomKegiatanNames(opdNama)) all.add(c);
    return [...all];
  }, [isOPD, opdNama, opdKlasters]);

  // ── Filtering ───────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = rows;
    const fk = parseInt(fKlaster);
    if (fk > 0) d = d.filter(r => r.klaster === fk);
    if (fKec) d = d.filter(r => r.kecamatan === fKec);
    if (fKel) d = d.filter(r => r.kelurahan === fKel);
    if (fStatus === "belum") d = d.filter(r => !aMap[r.nik]);
    else if (fStatus === "sudah") d = d.filter(r => !!aMap[r.nik]);
    if (search.trim()) { const q = search.trim().toLowerCase(); d = d.filter(r => r.nama.toLowerCase().includes(q) || r.nik.includes(q)); }
    return d;
  }, [rows, fKlaster, fKec, fKel, fStatus, search, aMap]);

  const tp = Math.max(1, Math.ceil(filtered.length / rpp));
  const paged = useMemo(() => filtered.slice((page - 1) * rpp, page * rpp), [filtered, page, rpp]);
  useEffect(() => { setPage(1); }, [fKlaster, fKec, fKel, fStatus, search, rpp]);

  // ── Handlers ────────────────────────────────────────────
  const openAssign = (nik: string) => { setModalNik(nik); setModalEdit(false); setSelKegId(""); };
  const openEdit = (nik: string) => { setModalNik(nik); setModalEdit(true); setSelKegId(aMap[nik]?.kegiatanId || ""); };
  const closeModal = () => { setModalNik(null); setSelKegId(""); };

  const handleSave = () => {
    if (!selKegId || !modalNik) return;
    if (modalEdit) { reassignToKegiatan(modalNik, selKegId); setMsg("Berhasil diperbarui!"); }
    else { assignToKegiatan(modalNik, selKegId); setMsg("Berhasil di-assign!"); }
    refresh(); closeModal();
  };
  const handleDelete = (nik: string) => { removeAssignment(nik); refresh(); setDeleteNik(null); setMsg("Tindak lanjut dihapus!"); };
  const handleComplete = (id: string) => {
    const r = completeActiveKegiatan(id);
    setMsg(`"${r.kegiatanNama}" selesai! ${r.affected} peserta mendapat riwayat.`);
    refresh(); setCompleteId(null);
  };
  const handleAddKeg = () => {
    if (!newKegName.trim() || !newKegDate) return;
    createActiveKegiatan(newKegName.trim(), newKegDate, opdNama);
    setMsg(`Kegiatan "${newKegName.trim()}" ditambahkan!`);
    setNewKegName(""); setNewKegDate(new Date().toISOString().split("T")[0]);
    setShowNewKeg(false); refresh();
  };
  const handleAddCustomName = () => {
    const name = prompt("Masukkan nama kegiatan baru:");
    if (name?.trim()) { addCustomKegiatanName(opdNama, name.trim()); setMsg(`"${name.trim()}" ditambah ke daftar!`); }
  };

  const selRow = rows.find(r => r.nik === modalNik);
  const totalS = rows.filter(r => !!aMap[r.nik]).length;
  const totalB = rows.length - totalS;

  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };

  const pageNums = (): (number | "...")[] => {
    const p: (number | "...")[] = [];
    if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i); return p; }
    p.push(1);
    if (page > 3) p.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i);
    if (page < tp - 2) p.push("...");
    p.push(tp);
    return p;
  };

  // ── Active kegiatan dropdown options ────────────────────
  const kegDropdownOpts = activeKeg.map(k => ({ value: k.id, label: `${k.nama} — ${fmtDate(k.tanggal)}` }));

  // ══════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <AdminLayout title="Tindak Lanjut" headerIcon={<ClipboardCheck className="w-4 h-4" />}>
      {/* SUCCESS ALERT */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
            <div className="backdrop-blur-xl border border-emerald-500/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-emerald-900/30">
              <div className="p-2 rounded-xl bg-emerald-500/30 border border-white/20 shrink-0"><Check className="w-6 h-6 text-emerald-200" /></div>
              <div className="flex-1"><h3 className="text-white font-bold text-sm mb-1">Berhasil</h3><p className="text-white/80 text-xs">{msg}</p></div>
              <button onClick={() => setMsg("")} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3 text-gray-900">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 border border-blue-500/30"><ClipboardCheck className="w-6 h-6" /></div>
          Tindak Lanjut {isOPD ? `— ${opdNama.split(",")[0]}` : "Klaster"}
        </h1>
        <p className="mt-1 text-sm text-gray-600 max-w-2xl">
          {isOPD ? `Kelola kegiatan tindak lanjut untuk responden klaster ${opdKlasters.join(" & ")}.` : "Pantau seluruh tindak lanjut hasil klasterisasi responden berdasarkan OPD terkait."}
        </p>
      </motion.div>

      {/* STATS */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Responden", val: rows.length, icon: <ClipboardCheck className="w-5 h-5 text-blue-600" />, bgI: "bg-blue-50 border-blue-200" },
          { label: "Sudah Ditindaklanjuti", val: totalS, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bgI: "bg-emerald-50 border-emerald-200" },
          { label: "Belum Ditindaklanjuti", val: totalB, icon: <AlertCircle className="w-5 h-5 text-amber-600" />, bgI: "bg-amber-50 border-amber-200" },
        ].map(s => (
          <div key={s.label} className="bg-white/95 border border-gray-200 shadow-sm rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl border ${s.bgI}`}>{s.icon}</div>
            <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p><p className="text-2xl font-bold text-gray-900">{s.val}</p></div>
          </div>
        ))}
      </motion.div>

      {/* KEGIATAN CARDS (OPD only) */}
      {isOPD && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 text-gray-600"><Sparkles className="w-4 h-4" /> Kegiatan Aktif</h2>
          <div className="flex flex-wrap gap-3">
            {activeKeg.map(k => (
              <div key={k.id} className="bg-white/95 border border-gray-200 shadow-sm rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-all group min-w-[200px]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{k.nama}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {fmtDate(k.tanggal)} · {getPesertaCount(k.id)} peserta</p>
                </div>
                <button onClick={() => setCompleteId(k.id)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all opacity-0 group-hover:opacity-100">Selesai</button>
              </div>
            ))}
            {/* Add Kegiatan */}
            {!showNewKeg ? (
              <button onClick={() => setShowNewKeg(true)} className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 flex items-center gap-2 text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all">
                <Plus className="w-4 h-4" /><span className="text-sm font-medium">Tambah Kegiatan</span>
              </button>
            ) : (
              <div className="bg-white border border-blue-200 shadow-md rounded-xl p-4 min-w-[280px] space-y-2">
                <div className="flex items-center gap-2">
                  <select value={newKegName} onChange={e => setNewKegName(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500/50">
                    <option value="">Pilih kegiatan...</option>
                    {getNameOptions().map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button onClick={handleAddCustomName} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors" title="Tambah nama baru"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <input type="date" value={newKegDate} onChange={e => setNewKegDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500/50" />
                <div className="flex gap-2">
                  <button onClick={handleAddKeg} disabled={!newKegName} className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 transition-all"><Check className="w-3.5 h-3.5 inline mr-1" />Simpan</button>
                  <button onClick={() => { setShowNewKeg(false); setNewKegName(""); }} className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">Batal</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* FILTERS */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {/* Status tabs */}
        <div className="shadow-sm backdrop-blur-xl rounded-xl p-1.5 flex flex-wrap items-center gap-1 border bg-white/80 border-gray-200 mb-4">
          <Layers className="w-4 h-4 mx-2 text-gray-500" />
          {(["all", "belum", "sudah"] as FilterStatus[]).map(v => (
            <button key={v} onClick={() => setFStatus(v)}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 ${fStatus === v ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
              {fStatus === v && <motion.div layoutId="tl-status" className="absolute inset-0 rounded-lg bg-blue-500/15 border border-blue-500/20 shadow-sm backdrop-blur-md" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className="relative z-10">{{ all: "Semua", belum: "Belum", sudah: "Sudah" }[v]}</span>
            </button>
          ))}
        </div>
        {/* Search + Glass Dropdowns */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Cari Nama atau NIK..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 shadow-sm backdrop-blur-md border border-gray-200 bg-white/80 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all outline-none text-gray-900 placeholder:text-gray-500 hover:border-gray-400" />
          </div>
          <GlassDropdown value={fKlaster} onChange={setFKlaster} placeholder="Semua Klaster"
            options={[{ value: "0", label: "Semua Klaster" }, ...uKlaster.map(k => ({ value: String(k), label: `Klaster ${k}` }))]} />
          <GlassDropdown value={fKec} onChange={setFKec} placeholder="Semua Kecamatan" icon={<MapPin className="w-4 h-4 text-gray-400 shrink-0" />}
            options={[{ value: "", label: "Semua Kecamatan" }, ...uKec.map(k => ({ value: k, label: k }))]} />
          <GlassDropdown value={fKel} onChange={setFKel} placeholder="Semua Kelurahan"
            options={[{ value: "", label: "Semua Kelurahan" }, ...uKel.map(k => ({ value: k, label: k }))]} />
        </div>
        {/* Active chips */}
        {(parseInt(fKlaster) > 0 || fKec || fKel || fStatus !== "all" || search.trim()) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Filter:</span>
            {parseInt(fKlaster) > 0 && <Chip label={`Klaster ${fKlaster}`} color={KC[parseInt(fKlaster)]} onClear={() => setFKlaster("0")} />}
            {fKec && <Chip label={fKec} onClear={() => setFKec("")} />}
            {fKel && <Chip label={fKel} onClear={() => setFKel("")} />}
            {fStatus !== "all" && <Chip label={fStatus === "sudah" ? "Sudah" : "Belum"} onClear={() => setFStatus("all")} />}
            {search.trim() && <Chip label={`"${search}"`} onClear={() => setSearch("")} />}
            <button onClick={() => { setFKlaster("0"); setFKec(""); setFKel(""); setFStatus("all"); setSearch(""); }} className="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Reset</button>
          </div>
        )}
      </motion.div>

      {/* TABLE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="shadow-sm backdrop-blur-xl rounded-2xl border overflow-hidden bg-white/95 border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-gray-300 text-gray-700 bg-gray-100/50 font-semibold text-[13px]">
              <tr>
                <th className="px-5 py-3.5 w-12">No</th>
                <th className="px-5 py-3.5">Nama</th>
                <th className="px-5 py-3.5">NIK</th>
                <th className="px-5 py-3.5">Kecamatan</th>
                <th className="px-5 py-3.5">Kelurahan</th>
                <th className="px-5 py-3.5 w-24">Klaster</th>
                <th className="px-5 py-3.5">Status Tindak Lanjut</th>
                {isOPD && <th className="px-5 py-3.5 w-28 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr><td colSpan={isOPD ? 8 : 7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3"><FileText className="w-12 h-12 text-gray-300" /><p className="text-gray-500 font-medium">Tidak ada data</p></div>
                </td></tr>
              ) : paged.map((r, i) => {
                const a = aMap[r.nik];
                const rw = getRiwayatByNIK(r.nik);
                const kc = KC[r.klaster] || KC[1];
                const locked = isOPD && a && a.opd !== opdNama;
                const own = isOPD && a && a.opd === opdNama;
                return (
                  <tr key={r.nik} className="hover:bg-gray-100/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{(page - 1) * rpp + i + 1}</td>
                    <td className="px-5 py-3.5"><span className="font-semibold text-gray-800 capitalize">{r.nama.toLowerCase()}</span></td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded-md shadow-sm">{r.nik}</span></td>
                    <td className="px-5 py-3.5"><div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-600 text-xs">{r.kecamatan}</span></div></td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{r.kelurahan}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${kc.bg} ${kc.text} ${kc.border} border`}><span className={`w-1.5 h-1.5 rounded-full ${kc.dot}`} />{r.klaster}</span></td>
                    <td className="px-5 py-3.5">
                      {a ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Building2 className="w-3 h-3" />{a.opd.split(",")[0]}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600"><Tag className="w-3 h-3 text-emerald-500" /><span className="truncate max-w-[180px]">{a.kegiatan}</span></div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400"><CalendarDays className="w-3 h-3" />{fmtDate(a.tanggal)}</div>
                        </div>
                      ) : rw.length > 0 ? (
                        <div className="space-y-1">
                          {rw.slice(0, 2).map((h, j) => (
                            <div key={j} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <History className="w-3 h-3 text-gray-400" />Pernah: {h.kegiatan.substring(0, 25)}{h.kegiatan.length > 25 ? "…" : ""} · {fmtDate(h.tanggal)}
                            </div>
                          ))}
                          {rw.length > 2 && <span className="text-[10px] text-gray-400">+{rw.length - 2} lagi</span>}
                        </div>
                      ) : <span className="text-gray-400 text-xs italic">— Belum ada —</span>}
                    </td>
                    {isOPD && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {locked ? <span className="text-[10px] text-gray-400 italic">Diklaim OPD lain</span>
                            : own ? (<>
                              <button onClick={() => openEdit(r.nik)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteNik(r.nik)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </>)
                            : !a ? <button onClick={() => openAssign(r.nik)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all"><Plus className="w-3.5 h-3.5" /></button> : null}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-gray-300 bg-gray-50/50 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Rows</span>
              <GlassDropdown value={String(rpp)} onChange={v => setRpp(Number(v))} placeholder="15"
                options={ROWS_OPTIONS.map(n => ({ value: String(n), label: String(n) }))} />
              <span className="text-xs text-gray-500">{(page - 1) * rpp + 1}–{Math.min(page * rpp, filtered.length)} dari {filtered.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all disabled:opacity-30 bg-white border-gray-300 text-gray-800 hover:bg-gray-50">Previous</button>
              <div className="hidden sm:flex items-center gap-1">
                {pageNums().map((n, i) => n === "..." ? <span key={`d${i}`} className="w-9 h-9 flex items-center justify-center text-gray-500">…</span>
                  : <button key={n} onClick={() => setPage(n as number)} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === n ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>{n}</button>)}
              </div>
              <button onClick={() => setPage(p => Math.min(tp, p + 1))} disabled={page === tp} className="px-3 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all disabled:opacity-30 bg-white border-gray-300 text-gray-800 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ASSIGN/EDIT MODAL */}
      <AnimatePresence>
        {modalNik && selRow && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 overflow-hidden z-10">
              <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-5 border border-blue-500/30 shadow-inner">
                {modalEdit ? <Pencil className="w-8 h-8 text-blue-200" /> : <Plus className="w-8 h-8 text-blue-200" />}
              </div>
              <h2 className="text-xl font-bold text-white mb-1 text-center">{modalEdit ? "Edit Kegiatan" : "Assign Kegiatan"}</h2>
              <p className="text-sm text-blue-100/80 mb-6 text-center">Pilih kegiatan aktif untuk responden ini.</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 relative z-10 grid grid-cols-2 gap-3">
                <div><p className="text-[10px] uppercase font-semibold text-blue-200/60 tracking-wider mb-0.5">Nama</p><p className="text-sm font-semibold text-white capitalize">{selRow.nama.toLowerCase()}</p></div>
                <div><p className="text-[10px] uppercase font-semibold text-blue-200/60 tracking-wider mb-0.5">NIK</p><p className="text-sm font-mono text-white/80">{selRow.nik}</p></div>
                <div><p className="text-[10px] uppercase font-semibold text-blue-200/60 tracking-wider mb-0.5">Klaster</p><p className="text-sm font-bold text-white">{selRow.klaster}</p></div>
                <div><p className="text-[10px] uppercase font-semibold text-blue-200/60 tracking-wider mb-0.5">Kecamatan</p><p className="text-sm text-white/80">{selRow.kecamatan}</p></div>
              </div>
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs font-semibold text-blue-100 ml-1 flex items-center gap-1.5 mb-1.5"><Tag className="w-3.5 h-3.5" /> Kegiatan</label>
                  <select value={selKegId} onChange={e => setSelKegId(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm appearance-none cursor-pointer backdrop-blur-md">
                    <option value="" className="bg-gray-900">— Pilih Kegiatan —</option>
                    {kegDropdownOpts.map(o => <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>)}
                  </select>
                  {kegDropdownOpts.length === 0 && <p className="text-xs text-amber-300/80 mt-1">⚠ Belum ada kegiatan aktif. Buat dulu di card di atas.</p>}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                  <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">Batal</button>
                  <button onClick={handleSave} disabled={!selKegId} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 border border-blue-400/50 transition-all text-sm disabled:opacity-40">{modalEdit ? "Perbarui" : "Simpan"}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteNik && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteNik(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 text-center z-10">
              <div className="mx-auto w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30"><Trash2 className="w-7 h-7 text-red-300" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Hapus Tindak Lanjut?</h3>
              <p className="text-[13px] text-blue-100/80 mb-6">Responden bisa di-assign ulang.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteNik(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 text-sm">Batal</button>
                <button onClick={() => handleDelete(deleteNik)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/30 border border-red-400/50 text-sm">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPLETE KEGIATAN CONFIRM */}
      <AnimatePresence>
        {completeId && (() => { const ck = activeKeg.find(k => k.id === completeId); if (!ck) return null; return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompleteId(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 text-center z-10">
              <div className="mx-auto w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30"><CheckCircle2 className="w-7 h-7 text-emerald-300" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Selesaikan Kegiatan?</h3>
              <p className="text-[13px] text-white mb-1 font-semibold">"{ck.nama}"</p>
              <p className="text-[13px] text-blue-100/80 mb-6">{getPesertaCount(ck.id)} peserta akan mendapat label <strong className="text-emerald-300">riwayat</strong>. Kegiatan hilang dari dropdown.</p>
              <div className="flex gap-3">
                <button onClick={() => setCompleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 text-sm">Batal</button>
                <button onClick={() => handleComplete(completeId)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 border border-emerald-400/50 text-sm">Ya, Selesaikan</button>
              </div>
            </motion.div>
          </div>
        ); })()}
      </AnimatePresence>
    </AdminLayout>
  );
}

/* ── Small helper component ── */
function Chip({ label, color, onClear }: { label: string; color?: { bg: string; text: string; border: string; dot?: string }; onClear: () => void }) {
  const bg = color?.bg || "bg-gray-100";
  const txt = color?.text || "text-gray-700";
  const brd = color?.border || "border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bg} ${txt} ${brd} border`}>
      {color?.dot && <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />}
      {label}
      <button onClick={onClear} className="ml-0.5 hover:opacity-70"><X className="w-3 h-3" /></button>
    </span>
  );
}
