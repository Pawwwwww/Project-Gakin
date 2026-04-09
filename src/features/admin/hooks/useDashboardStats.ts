import { useState, useEffect, useCallback } from "react";
import { getUsers, getAllKuesionerResults } from "../../../services/StorageService";
import { calcFullScore } from "../../../services/ScoringService";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalResponden: 0,
    gakinFilled: 0,
    gakinTarget: 0,
    nonGakinFilled: 0,
    nonGakinTarget: 0,
    usiaProduktifCount: 0,
    usiaProduktifPct: 0,
    klasterTerbanyak: 1,
    klasterTerbanyakPct: 0,
    clusterCounts: [0, 0, 0, 0], // K1, K2, K3, K4
    clusterProportions: [
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
    ],
  });

  const recalculate = useCallback(() => {
    const users = getUsers();
    const results = getAllKuesionerResults();

    // Target = jumlah user di localStorage (real-time)
    const gakinTarget = users.filter(u => u.gakinStatus === "GAKIN").length;
    const nonGakinTarget = users.filter(u => u.gakinStatus !== "GAKIN").length;

    const totalFilled = results.length;
    let gakinFilled = 0;
    let nonGakinFilled = 0;
    let usiaProduktifFilled = 0;

    const clusterStats = [0, 0, 0, 0];
    const clusterProps = [
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
    ];

    const currentYear = new Date().getFullYear();

    results.forEach((r) => {
      const user = users.find((u) => u.nik === r.nik);
      const isGakin = user?.gakinStatus === "GAKIN";
      
      if (isGakin) gakinFilled++;
      else nonGakinFilled++;

      // Usia Produktif
      if (user?.tanggalLahir) {
        const birthYear = new Date(user.tanggalLahir).getFullYear();
        const age = currentYear - birthYear;
        if (age >= 15 && age <= 64) {
          usiaProduktifFilled++;
        }
      }

      // Cluster calculations
      const score = calcFullScore(r.data);
      const kIndex = score.kluster - 1; 
      
      if (kIndex >= 0 && kIndex < 4) {
        clusterStats[kIndex]++;
        if (isGakin) clusterProps[kIndex].gakin++;
        else clusterProps[kIndex].nonGakin++;
      }
    });

    const denom = totalFilled || 1; 
    let maxCluster = 1;
    let maxCount = -1;

    clusterStats.forEach((count, idx) => {
      if (count > maxCount) {
        maxCount = count;
        maxCluster = idx + 1;
      }
    });

    setStats({
      totalResponden: totalFilled,
      gakinFilled,
      gakinTarget,
      nonGakinFilled,
      nonGakinTarget,
      usiaProduktifCount: usiaProduktifFilled,
      usiaProduktifPct: totalFilled > 0 ? Math.round((usiaProduktifFilled / totalFilled) * 100) : 0,
      klasterTerbanyak: maxCluster,
      klasterTerbanyakPct: Math.round((maxCount / denom) * 100),
      clusterCounts: clusterStats,
      clusterProportions: clusterProps,
    });
  }, []);

  useEffect(() => {
    // Initial calculation
    recalculate();

    // Listen for storage changes (from other tabs or dispatched events)
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "users" || e.key === "kuesioner_results") {
        recalculate();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [recalculate]);

  return stats;
}
