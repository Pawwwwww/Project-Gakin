/** Liquid-glass animated background blobs shared between Login & Register pages */
interface AuthBackgroundProps {
  dark?: boolean;
}

export function AuthBackground({ dark = false }: AuthBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-700 ${
        dark ? "bg-red-900/30" : "bg-red-300/30"
      }`} />
      <div className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-700 ${
        dark ? "bg-red-800/20" : "bg-red-400/20"
      }`} style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
    </div>
  );
}
