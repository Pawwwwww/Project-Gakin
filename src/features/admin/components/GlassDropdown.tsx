import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DropdownOption {
  value: string;
  label: string;
}

interface GlassDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}

export function GlassDropdown({ value, onChange, options, placeholder, icon, className = "" }: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-gray-200 shadow-sm rounded-xl text-sm font-medium transition-all hover:border-gray-400 hover:shadow-md cursor-pointer focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none"
      >
        {icon}
        <span className={`flex-1 text-left truncate ${selected ? "text-gray-800" : "text-gray-500"}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-full min-w-[200px] max-h-[280px] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-gray-200 shadow-2xl shadow-gray-300/40 rounded-2xl py-2 z-50"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between gap-2 ${
                  value === opt.value
                    ? "text-blue-600 bg-blue-50/80 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </button>
            ))}
            {options.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400 italic text-center">Tidak ada opsi</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
