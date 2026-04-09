import { useState, useMemo } from "react";
import { getUsers, getAllKuesionerResults } from "../../../services/StorageService";
import { calcFullScore } from "../../../services/ScoringService";

export type TimeFilter = "mingguan" | "bulanan" | "tahunan";

export interface TrendFilterState {
  timeFilter: TimeFilter;
  startDate: string;
  endDate: string;
  region: string;
  kecamatan: string;
  kelurahan: string;
  isComparing: boolean;
  compareRegion: string;
  compareKecamatan: string;
  compareKelurahan: string;
}

export type MonthlyTrend = {
  label: string;
  // If comparing by klaster
  klaster1?: number;
  klaster2?: number;
  klaster3?: number;
  klaster4?: number;
  // If comparing by wilayah
  pusat?: number;
  timur?: number;
  barat?: number;
  utara?: number;
  selatan?: number;
};

export function useTrendAnalytics() {
  const [filters, setFilters] = useState<TrendFilterState>({
    timeFilter: "bulanan",
    startDate: "",
    endDate: "",
    region: "",
    kecamatan: "",
    kelurahan: "",
    isComparing: false,
    compareRegion: "",
    compareKecamatan: "",
    compareKelurahan: ""
  });

  const rawData = useMemo(() => {
    return {
      users: getUsers(),
      results: getAllKuesionerResults()
    };
  }, []);

  const trendData = useMemo(() => {
    const { users, results } = rawData;
    const map: Record<string, { k: [number, number, number, number], w: { pusat: number, timur: number, barat: number, utara: number, selatan: number } }> = {};

    results.forEach((r) => {
      const user = users.find(u => u.nik === r.nik);
      if (!user) return;

      // Apply Region/Kecamatan/Kelurahan Filters
      if (filters.region) {
        let isMatch = false;
        // Region mapping
        if (filters.region === "SURABAYA PUSAT" && ["TEGALSARI", "SIMOKERTO", "GENTENG", "BUBUTAN"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.region === "SURABAYA TIMUR" && ["GUBENG", "GUNUNG ANYAR", "SUKOLILO", "TAMBAKSARI", "MULYOREJO", "RUNGKUT", "TENGGILIS MEJOYO"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.region === "SURABAYA BARAT" && ["BENOWO", "PAKAL", "ASEMROWO", "SUKOMANUNGGAL", "TANDES", "SAMBIKEREP", "LAKARSANTRI"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.region === "SURABAYA UTARA" && ["BULAK", "KENJERAN", "SEMAMPIR", "PABEAN CANTIAN", "KREMBANGAN"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.region === "SURABAYA SELATAN" && ["WONOKROMO", "WONOCOLO", "WIYUNG", "KARANG PILANG", "JAMBANGAN", "GAYUNGAN", "DUKUH PAKIS", "SAWAHAN"].includes(user.kecamatanKtp || "")) isMatch = true;
        
        if (!isMatch) return;
      }

      if (filters.kecamatan && user.kecamatanKtp !== filters.kecamatan) return;
      if (filters.kelurahan && user.kelurahanKtp !== filters.kelurahan) return;

      const dateStr = r.tanggal;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      // Apply Date Filters
      if (filters.startDate && date < new Date(filters.startDate)) return;
      if (filters.endDate && date > new Date(filters.endDate)) return;

      // Build key based on timeFilter
      let key = "";
      if (filters.timeFilter === "tahunan") {
        key = date.getFullYear().toString();
      } else if (filters.timeFilter === "bulanan") {
        key = `${date.toLocaleDateString("id-ID", { month: "short" })} ${date.getFullYear().toString().slice(-2)}`;
      } else if (filters.timeFilter === "mingguan") {
        // simplified week logic: getWeek override or just 'Minggu X Bulan Y'
        const w = Math.ceil(date.getDate() / 7);
        key = `Mg ${w} ${date.toLocaleDateString("id-ID", { month: "short" })}`;
      }

      if (!map[key]) map[key] = { k: [0,0,0,0], w: { pusat:0, timur:0, barat:0, utara:0, selatan:0 } };
      
      const score = calcFullScore(r.data);
      const klasterIdx = (score.kluster || 1) - 1;
      
      // Accumulate for cluster
      if (klasterIdx >= 0 && klasterIdx < 4) {
        map[key].k[klasterIdx]++;
      }

      // Accumulate for wilayah
      const kec = user.kecamatanKtp || "";
      if (["TEGALSARI", "SIMOKERTO", "GENTENG", "BUBUTAN"].includes(kec)) map[key].w.pusat++;
      else if (["GUBENG", "GUNUNG ANYAR", "SUKOLILO", "TAMBAKSARI", "MULYOREJO", "RUNGKUT", "TENGGILIS MEJOYO"].includes(kec)) map[key].w.timur++;
      else if (["BENOWO", "PAKAL", "ASEMROWO", "SUKOMANUNGGAL", "TANDES", "SAMBIKEREP", "LAKARSANTRI"].includes(kec)) map[key].w.barat++;
      else if (["BULAK", "KENJERAN", "SEMAMPIR", "PABEAN CANTIAN", "KREMBANGAN"].includes(kec)) map[key].w.utara++;
      else if (["WONOKROMO", "WONOCOLO", "WIYUNG", "KARANG PILANG", "JAMBANGAN", "GAYUNGAN", "DUKUH PAKIS", "SAWAHAN"].includes(kec)) map[key].w.selatan++;
    });

    const keys = Object.keys(map).sort(); // very basic sort, enough for generated demo data
    const finalData: MonthlyTrend[] = keys.map(k => {
      const entry = map[k];
      return {
        label: k,
        klaster1: entry.k[0],
        klaster2: entry.k[1],
        klaster3: entry.k[2],
        klaster4: entry.k[3],
        pusat: entry.w.pusat,
        timur: entry.w.timur,
        barat: entry.w.barat,
        utara: entry.w.utara,
        selatan: entry.w.selatan
      };
    });

    return finalData;
  }, [rawData, filters]);

  const compareTrendData = useMemo(() => {
    if (!filters.isComparing) return [];
    
    const { users, results } = rawData;
    const map: Record<string, { k: [number, number, number, number], w: { pusat: number, timur: number, barat: number, utara: number, selatan: number } }> = {};

    results.forEach((r) => {
      const user = users.find(u => u.nik === r.nik);
      if (!user) return;

      // Apply Region/Kecamatan/Kelurahan Filters for COMPARE
      if (filters.compareRegion) {
        let isMatch = false;
        if (filters.compareRegion === "SURABAYA PUSAT" && ["TEGALSARI", "SIMOKERTO", "GENTENG", "BUBUTAN"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.compareRegion === "SURABAYA TIMUR" && ["GUBENG", "GUNUNG ANYAR", "SUKOLILO", "TAMBAKSARI", "MULYOREJO", "RUNGKUT", "TENGGILIS MEJOYO"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.compareRegion === "SURABAYA BARAT" && ["BENOWO", "PAKAL", "ASEMROWO", "SUKOMANUNGGAL", "TANDES", "SAMBIKEREP", "LAKARSANTRI"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.compareRegion === "SURABAYA UTARA" && ["BULAK", "KENJERAN", "SEMAMPIR", "PABEAN CANTIAN", "KREMBANGAN"].includes(user.kecamatanKtp || "")) isMatch = true;
        if (filters.compareRegion === "SURABAYA SELATAN" && ["WONOKROMO", "WONOCOLO", "WIYUNG", "KARANG PILANG", "JAMBANGAN", "GAYUNGAN", "DUKUH PAKIS", "SAWAHAN"].includes(user.kecamatanKtp || "")) isMatch = true;
        
        if (!isMatch) return;
      }

      if (filters.compareKecamatan && user.kecamatanKtp !== filters.compareKecamatan) return;
      if (filters.compareKelurahan && user.kelurahanKtp !== filters.compareKelurahan) return;

      const dateStr = r.tanggal;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      if (filters.startDate && date < new Date(filters.startDate)) return;
      if (filters.endDate && date > new Date(filters.endDate)) return;

      let key = "";
      if (filters.timeFilter === "tahunan") {
        key = date.getFullYear().toString();
      } else if (filters.timeFilter === "bulanan") {
        key = `${date.toLocaleDateString("id-ID", { month: "short" })} ${date.getFullYear().toString().slice(-2)}`;
      } else if (filters.timeFilter === "mingguan") {
        const w = Math.ceil(date.getDate() / 7);
        key = `Mg ${w} ${date.toLocaleDateString("id-ID", { month: "short" })}`;
      }

      if (!map[key]) map[key] = { k: [0,0,0,0], w: { pusat:0, timur:0, barat:0, utara:0, selatan:0 } };
      
      const score = calcFullScore(r.data);
      const klasterIdx = (score.kluster || 1) - 1;
      
      if (klasterIdx >= 0 && klasterIdx < 4) map[key].k[klasterIdx]++;
    });

    const keys = Object.keys(map).sort();
    return keys.map(k => {
      const entry = map[k];
      return {
        label: k,
        klaster1: entry.k[0],
        klaster2: entry.k[1],
        klaster3: entry.k[2],
        klaster4: entry.k[3]
      };
    });
  }, [rawData, filters]);

  // Aggregate stats
  const aggregateValue = useMemo(() => {
    return trendData.reduce((acc, obj) => {
      acc.k1 += obj.klaster1 || 0;
      acc.k2 += obj.klaster2 || 0;
      acc.k3 += obj.klaster3 || 0;
      acc.k4 += obj.klaster4 || 0;
      return acc;
    }, { k1: 0, k2: 0, k3:0, k4:0 });
  }, [trendData]);

  const compareAggregateValue = useMemo(() => {
    if (!filters.isComparing) return { k1: 0, k2: 0, k3:0, k4:0 };
    return compareTrendData.reduce((acc, obj) => {
      acc.k1 += obj.klaster1 || 0;
      acc.k2 += obj.klaster2 || 0;
      acc.k3 += obj.klaster3 || 0;
      acc.k4 += obj.klaster4 || 0;
      return acc;
    }, { k1: 0, k2: 0, k3:0, k4:0 });
  }, [compareTrendData, filters.isComparing]);

  return {
    filters,
    setFilters,
    trendData,
    compareTrendData,
    aggregateValue,
    compareAggregateValue,
  };
}
