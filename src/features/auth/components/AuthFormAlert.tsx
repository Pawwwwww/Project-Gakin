import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface AuthFormAlertProps {
  title?: string;
  message: string;
  type?: "error" | "success";
  isExiting: boolean;
  onClose: () => void;
}

/** Floating liquid-glass alert, shared across auth pages */
export function AuthFormAlert({ title, message, type = "error", isExiting, onClose }: AuthFormAlertProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[200] w-[92%] sm:w-[90%] max-w-sm transition-all duration-500 ease-in-out ${
        isExiting
          ? "opacity-0 -translate-y-8 blur-sm scale-95"
          : "animate-bounce-in opacity-100 translate-y-0 blur-none scale-100"
      }`}
    >
      <div className="backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-slate-900/70 shadow-black/30">
        <div className={`p-2 rounded-xl backdrop-blur-md border border-white/30 shadow-inner flex-shrink-0 ${isSuccess ? "bg-green-500/30" : "bg-blue-500/30"}`}>
          {isSuccess ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-blue-400" />}
        </div>
        <div className="flex-1 mt-0.5">
          <h3 className="text-white font-bold text-sm mb-1">{title || (isSuccess ? "Berhasil" : "Validasi Gagal!")}</h3>
          <p className="text-white/80 text-xs font-medium leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
