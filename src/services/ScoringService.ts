// ═══════════════════════════════════════════════════════════════
//  SCORING SERVICE
//  Semua logika perhitungan skor kuesioner
//  (GRIT, KWU, TIPI, dan penentuan Kluster)
// ═══════════════════════════════════════════════════════════════

import {
  GRIT_QUESTIONS,
  TIPI_THRESHOLDS,
  type KuesionerData,
  type TIPIAspect,
} from "../entities/respondent";

// ── GRIT Scoring ──────────────────────────────────────────────────────
// Item unfavorable (skor dibalik: 6 - nilai)
const GRIT_UF = new Set([2, 3, 5, 7, 8, 11]);

export function calcGritScore(grit: Record<number, number>): number {
  return GRIT_QUESTIONS.reduce((sum, q) => {
    const v = grit[q.id] || 0;
    return sum + (GRIT_UF.has(q.id) ? 6 - v : v);
  }, 0);
}

export function getGritCategory(score: number): {
  label: string; color: string; bg: string; desc: string;
} {
  if (score > 44)
    return {
      label: "Tinggi", color: "text-green-700",
      bg: "bg-green-100 border-green-300",
      desc: "Memiliki ketekunan dan semangat yang kuat dalam mencapai tujuan jangka panjang.",
    };
  if (score > 28)
    return {
      label: "Sedang", color: "text-yellow-700",
      bg: "bg-yellow-100 border-yellow-300",
      desc: "Cukup gigih namun masih perlu penguatan dalam mempertahankan konsistensi.",
    };
  return {
    label: "Rendah", color: "text-red-700",
    bg: "bg-red-100 border-red-300",
    desc: "Perlu intervensi untuk membangun fondasi ketekunan dan disiplin diri.",
  };
}

// ── KWU Scoring ───────────────────────────────────────────────────────
export function calcKwuScore(kwu: Record<number, number>): number {
  return Object.values(kwu).reduce((sum, v) => sum + v, 0);
}

export function getKwuCategory(score: number): {
  label: string; color: string; bg: string; desc: string;
} {
  if (score > 45)
    return {
      label: "Tinggi", color: "text-green-700",
      bg: "bg-green-100 border-green-300",
      desc: "Memiliki kompetensi kewirausahaan yang matang dan siap mengembangkan usaha mandiri.",
    };
  if (score >= 37.5)
    return {
      label: "Sedang", color: "text-blue-700",
      bg: "bg-blue-100 border-blue-300",
      desc: "Memiliki kemampuan wirausaha yang cukup dengan potensi berkembang lebih jauh.",
    };
  if (score >= 30)
    return {
      label: "Dasar", color: "text-orange-700",
      bg: "bg-orange-100 border-orange-300",
      desc: "Memiliki keterampilan dasar namun membutuhkan penguatan kapasitas usaha.",
    };
  return {
    label: "Rendah", color: "text-red-700",
    bg: "bg-red-100 border-red-300",
    desc: "Perlu pelatihan dan pendampingan intensif untuk membangun kompetensi wirausaha.",
  };
}

// ── TIPI Scoring ──────────────────────────────────────────────────────
export function calcTIPIAspects(tipi: Record<number, number>): Record<TIPIAspect, number> {
  const s = (id: number) => tipi[id] || 0;
  const r = (id: number) => 8 - (tipi[id] || 0);
  return {
    extraversion:      (s(1) + r(6)) / 2,
    agreeableness:     (s(2) + r(7)) / 2,
    conscientiousness: (s(3) + r(8)) / 2,
    neuroticism:       (s(4) + r(9)) / 2,
    openness:          (s(5) + r(10)) / 2,
  };
}

export function getTIPICategoryLabel(aspect: TIPIAspect, score: number): string {
  const [t1, t2, t3, t4] = TIPI_THRESHOLDS[aspect];
  if (score <  t1) return "Rendah";
  if (score <  t2) return "Dibawah Rerata";
  if (score <  t3) return "Rerata";
  if (score <= t4) return "Diatas Rerata";
  return "Tinggi";
}

// ── Cluster Determination ─────────────────────────────────────────────
export function determineKluster(
  gritLabel: string,
  kwuLabel: string,
  tipiCats: Record<TIPIAspect, string>
): number {
  const n = tipiCats.neuroticism;
  const isNeuroticLow  = n === "Rendah" || n === "Dibawah Rerata";
  const isNeuroticHigh = n === "Tinggi" || n === "Diatas Rerata" || n === "Rerata";

  const isGritHighOrMid  = gritLabel === "Tinggi" || gritLabel === "Sedang";
  const isKwuHighOrMid   = kwuLabel  === "Tinggi" || kwuLabel  === "Sedang";
  const isGritLow        = gritLabel === "Rendah";
  const isKwuLowOrBase   = kwuLabel  === "Rendah" || kwuLabel  === "Dasar";

  const tHigh = ["Tinggi", "Diatas Rerata", "Rerata"];
  const isOtherTipiHigh =
    tHigh.includes(tipiCats.extraversion) &&
    tHigh.includes(tipiCats.agreeableness) &&
    tHigh.includes(tipiCats.conscientiousness) &&
    tHigh.includes(tipiCats.openness);

  if (isNeuroticHigh) return 1;

  if (isNeuroticLow && isGritHighOrMid && isKwuHighOrMid && isOtherTipiHigh)  return 4;
  if (isNeuroticLow && isGritHighOrMid && isKwuHighOrMid && !isOtherTipiHigh) return 3;
  if (isNeuroticLow && (isGritLow || isKwuLowOrBase)) return 2;

  // Fallback
  return 1;
}

// ── Convenience: Full score from KuesionerData ─────────────────────────
export interface FullScoreResult {
  gritScore: number;
  gritCategory: ReturnType<typeof getGritCategory>;
  kwuScore: number;
  kwuCategory: ReturnType<typeof getKwuCategory>;
  tipiAspects: Record<TIPIAspect, number>;
  tipiCategories: Record<TIPIAspect, string>;
  kluster: number;
}

export function calcFullScore(data: KuesionerData): FullScoreResult {
  const gritScore    = calcGritScore(data.grit);
  const gritCategory = getGritCategory(gritScore);
  const kwuScore     = calcKwuScore(data.kwu);
  const kwuCategory  = getKwuCategory(kwuScore);
  const tipiAspects  = calcTIPIAspects(data.tipi);
  const tipiCategories = (Object.keys(tipiAspects) as TIPIAspect[]).reduce(
    (acc, a) => { acc[a] = getTIPICategoryLabel(a, tipiAspects[a]); return acc; },
    {} as Record<TIPIAspect, string>
  );
  const kluster = determineKluster(gritCategory.label, kwuCategory.label, tipiCategories);
  return { gritScore, gritCategory, kwuScore, kwuCategory, tipiAspects, tipiCategories, kluster };
}
