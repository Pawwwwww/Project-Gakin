// ═══════════════════════════════════════════════════════════════
//  KEGIATAN SERVICE
//  Manages: active kegiatan, assignments, riwayat, custom names
//  Storage: localStorage
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────

/** Active kegiatan card (name + date bundled) */
export interface ActiveKegiatan {
  id: string;
  nama: string;
  tanggal: string;       // YYYY-MM-DD
  opd: string;
  createdAt: string;
}

/** Assignment links respondent → active kegiatan */
export interface KegiatanAssignment {
  nik: string;
  opd: string;
  kegiatan: string;      // Kegiatan name
  tanggal: string;       // Kegiatan date
  kegiatanId: string;    // Links to ActiveKegiatan.id
  assignedAt: string;
}

/** History record after kegiatan is completed */
export interface RiwayatKegiatan {
  nik: string;
  opd: string;
  kegiatan: string;
  tanggal: string;
  completedAt: string;
}

// ── Storage Keys ─────────────────────────────────────────────────
const ACTIVE_KEY = "active_kegiatan_list";
const ASSIGNMENT_KEY = "kegiatan_assignments";
const RIWAYAT_KEY = "riwayat_kegiatan";
const CUSTOM_KEGIATAN_KEY = "custom_kegiatan_templates";

// ── Helpers ──────────────────────────────────────────────────────
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ═══════════════════════════════════════════════════════════════
//  ACTIVE KEGIATAN (Cards with name + date)
// ═══════════════════════════════════════════════════════════════

/** Get all active kegiatan */
export function getAllActiveKegiatan(): ActiveKegiatan[] {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || "[]"); }
  catch { return []; }
}

/** Get active kegiatan for a specific OPD */
export function getActiveKegiatanByOPD(opd: string): ActiveKegiatan[] {
  return getAllActiveKegiatan().filter(k => k.opd === opd);
}

/** Create a new active kegiatan (card) */
export function createActiveKegiatan(nama: string, tanggal: string, opd: string): ActiveKegiatan {
  const list = getAllActiveKegiatan();
  const entry: ActiveKegiatan = {
    id: genId(),
    nama,
    tanggal,
    opd,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(list));
  return entry;
}

/** Complete an active kegiatan:
 *  1. Move all assigned respondents to riwayat
 *  2. Remove the active kegiatan card
 *  Returns count of affected respondents
 */
export function completeActiveKegiatan(kegiatanId: string): { affected: number; kegiatanNama: string } {
  const list = getAllActiveKegiatan();
  const kegiatan = list.find(k => k.id === kegiatanId);
  if (!kegiatan) return { affected: 0, kegiatanNama: "" };

  // Move assignments to riwayat
  const map = getAssignmentMap();
  const riwayat = getRiwayatList();
  const now = new Date().toISOString();
  let count = 0;

  for (const nik of Object.keys(map)) {
    if (map[nik].kegiatanId === kegiatanId) {
      riwayat.push({
        nik,
        opd: kegiatan.opd,
        kegiatan: kegiatan.nama,
        tanggal: kegiatan.tanggal,
        completedAt: now,
      });
      delete map[nik];
      count++;
    }
  }

  // Remove active kegiatan
  const updated = list.filter(k => k.id !== kegiatanId);
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(updated));
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(map));
  localStorage.setItem(RIWAYAT_KEY, JSON.stringify(riwayat));

  return { affected: count, kegiatanNama: kegiatan.nama };
}

/** Get peserta count for an active kegiatan */
export function getPesertaCount(kegiatanId: string): number {
  const map = getAssignmentMap();
  return Object.values(map).filter(a => a.kegiatanId === kegiatanId).length;
}

// ═══════════════════════════════════════════════════════════════
//  ASSIGNMENTS (Links respondent → active kegiatan)
// ═══════════════════════════════════════════════════════════════

export function getAssignmentMap(): Record<string, KegiatanAssignment> {
  try { return JSON.parse(localStorage.getItem(ASSIGNMENT_KEY) || "{}"); }
  catch { return {}; }
}

export function getAssignment(nik: string): KegiatanAssignment | null {
  return getAssignmentMap()[nik] || null;
}

/** Assign respondent to an active kegiatan */
export function assignToKegiatan(nik: string, kegiatanId: string): boolean {
  const map = getAssignmentMap();
  if (map[nik]) return false; // Already assigned

  const kegiatan = getAllActiveKegiatan().find(k => k.id === kegiatanId);
  if (!kegiatan) return false;

  map[nik] = {
    nik,
    opd: kegiatan.opd,
    kegiatan: kegiatan.nama,
    tanggal: kegiatan.tanggal,
    kegiatanId,
    assignedAt: new Date().toISOString(),
  };
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(map));
  return true;
}

/** Reassign respondent to different active kegiatan */
export function reassignToKegiatan(nik: string, kegiatanId: string): boolean {
  const map = getAssignmentMap();
  if (!map[nik]) return false;

  const kegiatan = getAllActiveKegiatan().find(k => k.id === kegiatanId);
  if (!kegiatan) return false;

  map[nik] = {
    ...map[nik],
    kegiatan: kegiatan.nama,
    tanggal: kegiatan.tanggal,
    kegiatanId,
  };
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(map));
  return true;
}

/** Remove assignment (free up respondent) */
export function removeAssignment(nik: string): boolean {
  const map = getAssignmentMap();
  if (!map[nik]) return false;
  delete map[nik];
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(map));
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  RIWAYAT (History of completed kegiatan)
// ═══════════════════════════════════════════════════════════════

export function getRiwayatList(): RiwayatKegiatan[] {
  try { return JSON.parse(localStorage.getItem(RIWAYAT_KEY) || "[]"); }
  catch { return []; }
}

export function getRiwayatByNIK(nik: string): RiwayatKegiatan[] {
  return getRiwayatList().filter(r => r.nik === nik);
}

// ═══════════════════════════════════════════════════════════════
//  CUSTOM KEGIATAN NAMES (additional names beyond config defaults)
// ═══════════════════════════════════════════════════════════════

export function getCustomKegiatanNames(opd: string): string[] {
  try {
    const all = JSON.parse(localStorage.getItem(CUSTOM_KEGIATAN_KEY) || "{}");
    return all[opd] || [];
  } catch { return []; }
}

export function addCustomKegiatanName(opd: string, nama: string): boolean {
  try {
    const all = JSON.parse(localStorage.getItem(CUSTOM_KEGIATAN_KEY) || "{}");
    if (!all[opd]) all[opd] = [];
    if (all[opd].includes(nama)) return false;
    all[opd].push(nama);
    localStorage.setItem(CUSTOM_KEGIATAN_KEY, JSON.stringify(all));
    return true;
  } catch { return false; }
}
