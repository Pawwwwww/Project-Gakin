import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function DashboardWelcomeBanner() {  const location = useLocation() as any;
  const [time, setTime] = useState(new Date());
  const [adminName, setAdminName] = useState("Administrator");
  const [greeting, setGreeting] = useState("Selamat datang");

  useEffect(() => {
    const greetings = [
      "Selamat datang",
      "Gimana kabarmu hari ini",
      "Halo",
      "Senang melihatmu lagi",
      "Semangat kerjanya"
    ];
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);

    const name = localStorage.getItem("adminName");
    if (name) setAdminName(name);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [location.key]);

  const formatDate = (d: Date) => d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatTime = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = "text-gray-900";
  const dateCardBg = "bg-gray-50 border-gray-300 text-gray-800 shadow-sm";
  const glowEffect = "bg-blue-600/10";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`shadow-sm backdrop-blur-xl rounded-2xl p-8 relative overflow-hidden shadow-lg border ${cardBg}`}
    >
      <div className={`absolute -top-24 -right-24 w-64 h-64 ${glowEffect} blur-[80px] rounded-full pointer-events-none`} />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md shadow-inner border ${"bg-white border-gray-200"}`}>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-blue-500 text-sm mb-1 font-medium tracking-wide uppercase">DASHBOARD IKHTISAR</p>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm ${textPrimary}`}>
              {greeting}, {adminName}
            </h1>
          </div>
        </div>
        <div className={`mt-4 sm:mt-0 px-4 py-2 rounded-xl backdrop-blur-md border inline-flex items-center justify-center sm:text-right w-fit sm:w-auto self-start sm:self-auto shadow-inner ${dateCardBg}`}>
          <p className="text-sm font-medium tabular-nums tracking-wide">
            {formatDate(time)} <span className="text-gray-400 mx-2">|</span> <span className="text-blue-500">{formatTime(time)}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
