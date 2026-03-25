import { useState, useEffect } from "react";
import { getUsers, getAllKuesionerResults, type UserRecord } from "../../../services/StorageService";
import { calcFullScore } from "../../../services/ScoringService";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalResponden: 0,
    gakinCount: 0,
    nonGakinCount: 0,
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

  useEffect(() => {
    const users = getUsers();
    const results = getAllKuesionerResults();

    const total = users.length;
    let gakin = 0;
    let nonGakin = 0;
    let usiaProduktif = 0;

    const clusterStats = [0, 0, 0, 0];
    const clusterProps = [
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
      { gakin: 0, nonGakin: 0 },
    ];

    const currentYear = new Date().getFullYear();

    users.forEach((u) => {
      // 1. Gakin counts
      if (u.gakinStatus === "GAKIN") gakin++;
      else nonGakin++;

      // 2. Usia Produktif (15 - 64)
      if (u.tanggalLahir) {
        const birthYear = new Date(u.tanggalLahir).getFullYear();
        const age = currentYear - birthYear;
        if (age >= 15 && age <= 64) {
          usiaProduktif++;
        }
      }
    });

    // 3. Cluster calculations
    results.forEach((r) => {
      const user = users.find((u) => u.nik === r.nik);
      const isGakin = user?.gakinStatus === "GAKIN";
      const score = calcFullScore(r.data);
      const kIndex = score.kluster - 1; // 0 for K1, 1 for K2...
      
      if (kIndex >= 0 && kIndex < 4) {
        clusterStats[kIndex]++;
        if (isGakin) clusterProps[kIndex].gakin++;
        else clusterProps[kIndex].nonGakin++;
      }
    });

    const totalFilled = results.length || 1; // prevent div by zero
    let maxCluster = 1;
    let maxCount = -1;

    clusterStats.forEach((count, idx) => {
      if (count > maxCount) {
        maxCount = count;
        maxCluster = idx + 1;
      }
    });

    setStats({
      totalResponden: total,
      gakinCount: gakin,
      nonGakinCount: nonGakin,
      usiaProduktifCount: usiaProduktif,
      usiaProduktifPct: total > 0 ? Math.round((usiaProduktif / total) * 100) : 0,
      klasterTerbanyak: maxCluster,
      klasterTerbanyakPct: Math.round((maxCount / totalFilled) * 100),
      clusterCounts: clusterStats,
      clusterProportions: clusterProps,
    });
  }, []);

  return stats;
}
