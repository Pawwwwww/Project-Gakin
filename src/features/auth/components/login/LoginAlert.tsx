import { AlertCircle } from "lucide-react";

interface LoginAlertProps {
  error: { type: string; message: string };
  isExiting: boolean;
  onClose: () => void;
}

const COLOR_MAP: Record<string, { bg: string; iconBg: string; iconColor: string; title: string }> = {
  not_number:      { bg: "bg-slate-900/70 shadow-black/30", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", title: "Format Tidak Valid" },
  length:          { bg: "bg-slate-900/70 shadow-black/30",    iconBg: "bg-blue-500/20",    iconColor: "text-blue-400",   title: "Panjang Tidak Sesuai" },
  not_registered:  { bg: "bg-slate-900/70 shadow-black/30",      iconBg: "bg-blue-500/20",     iconColor: "text-blue-400",    title: "Akses Ditolak" },
};

/** Floating colored error alert for Login page */
export function LoginAlert({ error, isExiting, onClose }: LoginAlertProps) {
  const isAdminEmpty = error.type.startsWith("admin_empty");
  const style = isAdminEmpty
    ? { bg: "bg-slate-900/70 shadow-black/30", iconBg: "bg-yellow-500/20", iconColor: "text-yellow-400", title: "Data Tidak Lengkap" }
    : (COLOR_MAP[error.type] ?? { bg: "bg-slate-900/70 shadow-black/30", iconBg: "bg-blue-500/20", iconColor: "text-blue-400", title: "Login Gagal" });

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm transition-all duration-500 ease-in-out ${
      isExiting ? "opacity-0 -translate-y-8 blur-sm scale-95" : "animate-bounce-in opacity-100 translate-y-0 blur-none scale-100"
    }`}>
      <div className={`backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex items-start gap-4 ${style.bg}`}>
        <div className={`p-2 rounded-xl backdrop-blur-md border border-white/30 shadow-inner flex-shrink-0 ${style.iconBg}`}>
          <AlertCircle className={`w-6 h-6 ${style.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1">{style.title}</h3>
          <p className="text-white/80 text-xs font-medium leading-relaxed">{error.message}</p>
        </div>
        <button type="button" onClick={onClose} className="text-white/50 hover:text-white transition-colors" aria-label="Tutup">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
