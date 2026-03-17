import { ArrowLeft, Eye, EyeOff, Lock, Shield, User } from "lucide-react";

interface LoginAdminFormProps {
  adminUsername: string;
  password: string;
  showPassword: boolean;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

/** Back face card: admin logs in with username + password */
export function LoginAdminForm({
  adminUsername, password, showPassword,
  onChangeUsername, onChangePassword, onTogglePassword,
  onSubmit, onBack,
}: LoginAdminFormProps) {
  return (
    <div className="rounded-2xl shadow-2xl p-8 border border-white/20 bg-gray-900/60 backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-full mb-4 shadow-lg shadow-red-900/30">
          <Shield className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Akses Administrator</h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-full mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <p className="text-yellow-400 text-xs font-medium">Mode Admin Terdeteksi</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => onChangeUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm placeholder:text-gray-500 shadow-sm"
              placeholder="Masukkan username"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Password Admin</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              style={!showPassword ? ({ WebkitTextSecurity: "disc" } as React.CSSProperties) : {}}
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-white/10 bg-white/5 backdrop-blur-md text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm placeholder:text-gray-500 shadow-sm"
              placeholder="Masukkan password admin"
              autoComplete="off"
            />
            <button type="button" onClick={onTogglePassword} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPassword
                ? <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                : <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600/80 backdrop-blur-sm text-white py-3 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-lg shadow-red-900/30"
        >
          Masuk sebagai Admin
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 mx-auto mt-5 text-gray-400 hover:text-gray-200 text-sm transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Kembali / Login sebagai User
      </button>
    </div>
  );
}
