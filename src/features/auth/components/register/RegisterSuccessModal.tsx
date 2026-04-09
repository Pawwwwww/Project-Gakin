import { CheckCircle2 } from "lucide-react";

interface RegisterSuccessModalProps {
  onLogin: () => void;
}

/** Full-screen liquid-glass success overlay shown after registration */
export function RegisterSuccessModal({ onLogin }: RegisterSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-3xl p-10 text-center max-w-sm w-full animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 shadow-inner border border-emerald-500/20 rounded-full mb-6 relative">
          <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full animate-pulse" />
          <CheckCircle2 className="w-10 h-10 text-emerald-600 relative z-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3 drop-shadow-sm">Registrasi Berhasil!</h2>
        <p className="text-gray-600 mb-8 font-medium text-sm leading-relaxed">
          Akun Anda telah terdaftar dalam sistem. Silakan login menggunakan NIK Anda untuk melanjutkan.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          Lanjut ke Login
        </button>
      </div>
    </div>
  );
}
