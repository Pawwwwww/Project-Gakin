import { CheckCircle2 } from "lucide-react";

interface RegisterSuccessModalProps {
  onLogin: () => void;
}

/** Full-screen liquid-glass success overlay shown after registration */
export function RegisterSuccessModal({ onLogin }: RegisterSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-10 text-center max-w-sm w-full animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 shadow-inner border border-green-500/30 rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-300" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-md">Registrasi Berhasil!</h2>
        <p className="text-white/90 mb-8 font-medium">
          Akun Anda telah terdaftar dalam sistem. Silakan login menggunakan NIK Anda.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="w-full bg-red-600/80 backdrop-blur-sm text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 shadow-lg border border-red-500/50 transition-all hover:scale-105 hover:shadow-red-600/40"
        >
          Login
        </button>
      </div>
    </div>
  );
}
