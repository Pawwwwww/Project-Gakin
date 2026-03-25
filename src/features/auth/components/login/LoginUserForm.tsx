import { User } from "lucide-react";

interface LoginUserFormProps {
  nik: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRegister: () => void;
}

/** Front face card: user logs in with NIK */
export function LoginUserForm({ nik, onChange, onSubmit, onRegister }: LoginUserFormProps) {
  return (
    <div className="rounded-2xl shadow-2xl p-8 border border-white/40 dark:border-white/20 bg-white/30 dark:bg-slate-800/60 backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 dark:bg-slate-700/50 backdrop-blur-md border border-white/60 dark:border-slate-600 rounded-full mb-4 shadow-lg">
          <User className="w-8 h-8 text-blue-700 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Selamat Datang</h1>
        <p className="text-gray-500 dark:text-gray-300 text-sm"><i>Sudah siap berkembang dengan BRIDA-STEP</i> ?</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">NIK</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={nik}
              onChange={(e) => onChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-white/50 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-md dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 shadow-sm"
              placeholder="Masukkan NIK Anda"
              maxLength={16}
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700/90 backdrop-blur-sm text-white py-3 rounded-lg font-semibold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-700/20"
        >
          Lanjutkan
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={onRegister}
          className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
        >
          Daftar Sekarang
        </button>
      </p>
    </div>
  );
}
