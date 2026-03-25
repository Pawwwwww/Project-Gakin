import { useState, useEffect } from "react";
import { getUsers, getAllKuesionerResults } from "../../../services/StorageService";
import { calcFullScore } from "../../../services/ScoringService";

const REGION_MAPPING: Record<string, string> = {
  // Pusat
  'TEGALSARI': 'Pusat', 'SIMOKERTO': 'Pusat', 'GENTENG': 'Pusat', 'BUBUTAN': 'Pusat',
  // Barat
  'BENOWO': 'Barat', 'PAKAL': 'Barat', 'ASEMROWO': 'Barat', 'SUKOMANUNGGAL': 'Barat', 'TANDES': 'Barat', 'SAMBIKEREP': 'Barat', 'LAKARSANTRI': 'Barat',
  // Selatan
  'WONOKROMO': 'Selatan', 'WONOCOLO': 'Selatan', 'WIYUNG': 'Selatan', 'KARANG PILANG': 'Selatan', 'JAMBANGAN': 'Selatan', 'GAYUNGAN': 'Selatan', 'DUKUH PAKIS': 'Selatan', 'SAWAHAN': 'Selatan',
  // Timur
  'GUBENG': 'Timur', 'GUNUNG ANYAR': 'Timur', 'SUKOLILO': 'Timur', 'TAMBAKSARI': 'Timur', 'MULYOREJO': 'Timur', 'RUNGKUT': 'Timur', 'TENGGILIS MEJOYO': 'Timur',
  // Utara
  'BULAK': 'Utara', 'KENJERAN': 'Utara', 'SEMAMPIR': 'Utara', 'PABEAN CANTIAN': 'Utara', 'KREMBANGAN': 'Utara'
};

export type RegionData = {
  name: string;
  total: number;
  clusterCounts: [number, number, number, number]; // K1, K2, K3, K4
  dominantCluster: number;
};

export function useRegionalStats() {
  const [regions, setRegions] = useState<Record<string, RegionData>>({
    Utara: { name: 'Utara', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
    Timur: { name: 'Timur', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
    Selatan: { name: 'Selatan', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
    Barat: { name: 'Barat', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
    Pusat: { name: 'Pusat', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
  });

  useEffect(() => {
    const users = getUsers();
    const results = getAllKuesionerResults();

    const regionMap: Record<string, RegionData> = {
      Utara: { name: 'Utara', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
      Timur: { name: 'Timur', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
      Selatan: { name: 'Selatan', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
      Barat: { name: 'Barat', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
      Pusat: { name: 'Pusat', total: 0, clusterCounts: [0, 0, 0, 0], dominantCluster: 1 },
    };

    results.forEach((r) => {
      const user = users.find((u) => u.nik === r.nik);
      const score = calcFullScore(r.data);
      const kIndex = (score.kluster || 1) - 1;

      // Extract kecamatan, default fallback if user doesn't have one
      const rawKec = user?.kecamatanKtp?.trim().toUpperCase() || "SUKOLILO"; 
      let mappedRegion = REGION_MAPPING[rawKec] || "Timur"; // Default if not found

      if (kIndex >= 0 && kIndex < 4) {
        regionMap[mappedRegion].total++;
        regionMap[mappedRegion].clusterCounts[kIndex]++;
      }
    });

    // Compute dominant cluster
    Object.keys(regionMap).forEach((key) => {
      const reg = regionMap[key];
      let maxCount = -1;
      let maxCluster = 1;
      reg.clusterCounts.forEach((count, idx) => {
        if (count > maxCount) {
          maxCount = count;
          maxCluster = idx + 1;
        }
      });
      reg.dominantCluster = maxCount === 0 ? 0 : maxCluster;
    });

    setRegions(regionMap);
  }, []);

  return regions;
}
