import { AlertCircle, X } from "lucide-react";

interface AuthFormAlertProps {
  message: string;
  isExiting: boolean;
  onClose: () => void;
}

/** Floating liquid-glass error alert, shared across auth pages */
export function AuthFormAlert({ message, isExiting, onClose }: AuthFormAlertProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm transition-all duration-500 ease-in-out ${
        isExiting
          ? "opacity-0 -translate-y-8 blur-sm scale-95"
          : "animate-bounce-in opacity-100 translate-y-0 blur-none scale-100"
      }`}
    >
      <div className="backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-4 flex items-start gap-4 bg-red-500/20 shadow-red-500/20">
        <div className="p-2 rounded-xl backdrop-blur-md border border-white/30 shadow-inner flex-shrink-0 bg-red-500/30">
          <AlertCircle className="w-6 h-6 text-red-100" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1">Validasi Gagal!</h3>
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
