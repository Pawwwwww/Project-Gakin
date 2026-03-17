import { AdminLayout } from "../../components/AdminLayout";
import { motion } from "motion/react";
import { Shield, UserCog } from "lucide-react";
import { useAdminTheme } from "../../hooks/AdminThemeContext";

export default function AdminAccount() {
  const { isDark } = useAdminTheme();
  
  const textPrimary   = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const bgCard        = isDark ? "bg-[#111]/80 border-white/10" : "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";

  return (
    <AdminLayout title="Admin Account" headerIcon={<Shield className="w-4 h-4" />}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500 border border-red-500/30">
            <Shield className="w-6 h-6" />
          </div>
          Kelola Akun Admin
        </h1>
        <p className={`mt-1 ${textSecondary}`}>
          Manajemen akun administrator sistem.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`shadow-sm backdrop-blur-xl rounded-2xl p-12 border flex flex-col items-center justify-center min-h-[400px] ${bgCard}`}>
        <UserCog className={`w-16 h-16 mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
        <p className={`text-center font-medium text-lg ${textSecondary}`}>Admin Account Management</p>
        <p className={`text-sm text-center mt-2 ${textSecondary}`}>Halaman ini sedang dalam pengembangan.</p>
      </motion.div>
    </AdminLayout>
  );
}
