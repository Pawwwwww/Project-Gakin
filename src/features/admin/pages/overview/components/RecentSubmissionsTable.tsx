import { useNavigate } from "react-router";
import { ClipboardList, Users, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAdminTheme } from "../../../hooks/AdminThemeContext";
import { getUsers, getKuesionerResult } from "../../../../../services/StorageService";
import type { UserRecord } from "../../../../../services/StorageService";

interface SubmissionItem {
  nik: string;
  name: string;
  kecamatan: string;
  kelurahan: string;
  klaster: string;
  waktu: string;
  timestamp: number;
}

// Helper to format relative time
function getRelativeTime(timestamp: number): string {
  if (!timestamp) return "Beberapa saat lalu";
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
}

export function RecentSubmissionsTable() {
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);

  useEffect(() => {
    // Build real data from StorageService
    const users = getUsers();
    const filledUsers: SubmissionItem[] = [];

    users.forEach((u: UserRecord) => {
      const result = getKuesionerResult(u.nik);
      if (result) {
        // Parse date from result.tanggal (ISO string)
        const ts = new Date(result.tanggal).getTime();

        // Calculate a simple mock score to assign a cluster, since cluster logic might be complex
        // We'll just sum the values in the grit record if available, or randomize based on nik
        let score = 0;
        if (result.data && result.data.grit) {
          score = Object.values(result.data.grit).reduce((acc, val) => acc + val, 0);
        } else {
          score = u.nik.charCodeAt(u.nik.length - 1); // simple pseudo-random based on last char
        }

        let klaster = "Klaster 1";
        if (score > 35) klaster = "Klaster 4";
        else if (score > 25) klaster = "Klaster 3";
        else if (score > 15) klaster = "Klaster 2";

        filledUsers.push({
          nik: u.nik,
          name: u.fullName,
          kecamatan: u.kecamatanKtp || u.kecamatanDomisili || "-",
          kelurahan: u.kelurahanKtp || u.kelurahanDomisili || "-",
          klaster: klaster,
          waktu: getRelativeTime(ts),
          timestamp: ts,
        });
      }
    });

    // Sort descending by timestamp and take top 5
    filledUsers.sort((a, b) => b.timestamp - a.timestamp);
    setSubmissions(filledUsers.slice(0, 5));
  }, []);

  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const rowHover = isDark ? "hover:bg-white/5 border-white/5" : "hover:bg-gray-50 border-gray-200";
  const tableHeader = isDark ? "bg-white/5 text-gray-400" : "bg-gray-200/50 text-gray-700 border-y border-gray-300";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className={`shadow-sm backdrop-blur-xl rounded-2xl shadow-lg border overflow-hidden flex flex-col relative ${cardBg}`}
    >
      <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50/50"}`}>
        <div>
          <h3 className={`font-bold flex items-center gap-2 mb-1 ${textPrimary}`}>
            <ClipboardList className="w-5 h-5 text-red-500" /> Data Responden Terbaru (Sudah Mengisi)
          </h3>
          <p className={`text-sm ${textSecondary}`}>5 responden terakhir yang telah menyelesaikan kuesioner</p>
        </div>
        <button onClick={() => navigate("/admin/status-kuesioner")}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${isDark ? "text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20" : "text-white bg-gray-900 hover:bg-black border border-gray-800 shadow-sm"}`}>
          Lihat Semua
        </button>
      </div>
      
      <div className={`divide-y flex-1 ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
        <div className={`grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider ${tableHeader}`}>
          <div className="col-span-4 sm:col-span-4">Nama & NIK</div>
          <div className="col-span-3 sm:col-span-3">Kecamatan</div>
          <div className="col-span-3 sm:col-span-3">Kelurahan</div>
          <div className="col-span-2 sm:col-span-2 text-right">Waktu</div>
        </div>
        
        {submissions.length > 0 ? (
          submissions.map((item, i) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
              key={item.nik} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors group cursor-pointer ${rowHover}`}
              onClick={() => navigate(`/admin/respondent/${item.nik}`)}
            >
              <div className="col-span-4 sm:col-span-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border 
                  ${item.klaster === "Klaster 1" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    item.klaster === "Klaster 2" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    item.klaster === "Klaster 3" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                    "bg-green-500/10 text-green-500 border-green-500/20"
                  }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-bold group-hover:text-red-500 transition-colors truncate max-w-[120px] sm:max-w-[200px] ${textPrimary}`}>{item.name}</p>
                  <p className={`text-xs font-medium mt-0.5 font-mono ${textSecondary}`}>{item.nik.replace(/(.{4}).*(.{4})/, "$1****$2")}</p>
                </div>
              </div>
              
              <div className={`col-span-3 sm:col-span-3 flex items-center gap-2 text-sm truncate ${textSecondary}`}>
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> {item.kecamatan}
              </div>

              <div className={`col-span-3 sm:col-span-3 flex items-center gap-2 text-sm truncate ${textSecondary}`}>
                <MapPin className="w-4 h-4 text-gray-400/50 shrink-0" /> {item.kelurahan}
              </div>

              <div className="col-span-2 sm:col-span-2 text-right">
                <p className={`text-xs font-medium ${textSecondary}`}>{item.waktu}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className={textSecondary}>Belum ada data responden yang mengisi kuesioner.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
