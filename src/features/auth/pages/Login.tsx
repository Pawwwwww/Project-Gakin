import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { LoginMode } from "../../../entities/admin";
import { loginUser, loginAdmin } from "../../../services/AuthService";
import { seedDummyUser } from "../../../services/StorageService";

// ── Components ──────────────────────────────────────────────────────
import { AuthBackground }  from "../components/AuthBackground";
import { LoginUserForm }   from "../components/login/LoginUserForm";
import { LoginAdminForm }  from "../components/login/LoginAdminForm";
import { LoginAlert }      from "../components/login/LoginAlert";

// ── Page ────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode]                   = useState<LoginMode>("nik");
  const [nik, setNik]                     = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]                 = useState<{ type: string; message: string } | null>(null);
  const [isExiting, setIsExiting]         = useState(false);

  // Auto-hide error after 3.5s
  useEffect(() => {
    if (error) {
      setIsExiting(false);
      const timerHide   = setTimeout(() => setIsExiting(true), 3500);
      const timerRemove = setTimeout(() => { setError(null); setIsExiting(false); }, 4000);
      return () => { clearTimeout(timerHide); clearTimeout(timerRemove); };
    }
  }, [error]);

  // Seed dummy user on mount
  useEffect(() => { seedDummyUser(); }, []);

  // ── Handlers ────────────────────────────────────────────────────
  const handleNikSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nikVal = nik.trim();
    if (nikVal !== "") {
      const result = loginUser(nikVal);
      if (!result.success) { setError(result.error!); return; }
      sessionStorage.setItem("showPasswordAlert", "false");
      navigate("/welcome");
    } else {
      setMode("admin");
      setError(null);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginAdmin(adminUsername, password);
    if (!result.success) { setError(result.error!); return; }
    sessionStorage.setItem("showPasswordAlert", result.isDefaultPassword ? "true" : "false");
    navigate("/admin");
  };

  const handleBack = () => {
    setMode("nik");
    setAdminUsername("");
    setPassword("");
    setError(null);
  };

  const isFlipped = mode === "admin";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-y-auto transition-colors duration-700 ${
      isFlipped
        ? "bg-gradient-to-br from-gray-800 to-blue-900"
        : "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    }`}>

      <AuthBackground dark={isFlipped} />

      <div className="w-full max-w-md relative z-10">

        {/* Floating Alert */}
        {error && (
          <LoginAlert
            error={error}
            isExiting={isExiting}
            onClose={() => setIsExiting(true)}
          />
        )}

        {/* Flip Container */}
        <div style={{ perspective: "1200px", WebkitPerspective: "1200px" }}>
          <div style={{
            position: "relative", width: "100%", minHeight: "420px",
            transition: "transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)",
            WebkitTransition: "-webkit-transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}>

            {/* Front: User Login */}
            <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", position: "relative", zIndex: isFlipped ? 0 : 2 }}>
              <LoginUserForm
                nik={nik}
                onChange={setNik}
                onSubmit={handleNikSubmit}
                onRegister={() => navigate("/register")}
              />
            </div>

            {/* Back: Admin Login */}
            <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}>
              <LoginAdminForm
                adminUsername={adminUsername}
                password={password}
                showPassword={showPassword}
                onChangeUsername={(v) => { setAdminUsername(v); setError(null); }}
                onChangePassword={(v) => { setPassword(v); setError(null); }}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleAdminSubmit}
                onBack={handleBack}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
