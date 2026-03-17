import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface GlassDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  required?: boolean;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);

export function GlassDatePicker({ value, onChange, required }: GlassDatePickerProps) {
  const [day, setDay] = useState<string>(() => {
    if (!value) return "";
    return String(parseInt(value.split("-")[2]));
  });
  const [month, setMonth] = useState<string>(() => {
    if (!value) return "";
    return String(parseInt(value.split("-")[1]));
  });
  const [year, setYear] = useState<string>(() => {
    if (!value) return "";
    return value.split("-")[0];
  });

  const triggerChange = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const dd = String(d).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      onChange(`${y}-${mm}-${dd}`);
    } else {
      onChange("");
    }
  };

  const handleDay = (v: string) => { setDay(v); triggerChange(v, month, year); };
  const handleMonth = (v: string) => {
    setMonth(v);
    // Reset day if out of range
    const maxDay = v && year ? getDaysInMonth(parseInt(v), parseInt(year)) : 31;
    const newDay = parseInt(day) > maxDay ? "" : day;
    if (parseInt(day) > maxDay) setDay("");
    triggerChange(newDay, v, year);
  };
  const handleYear = (v: string) => { setYear(v); triggerChange(day, month, v); };

  const daysInMonth = month && year ? getDaysInMonth(parseInt(month), parseInt(year)) : 31;
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  const triggerClass = `
    block w-full text-left py-2.5 px-3 border rounded-lg transition-colors text-sm
    border-white/50 bg-white/50 backdrop-blur-md focus:outline-none
    focus:border-red-500 focus:ring-2 focus:ring-red-500
    appearance-none
  `;

  return (
    <div className="relative">
      {/* Hidden input for form validation */}
      <input
        type="text"
        tabIndex={-1}
        readOnly
        value={value}
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-center gap-2 p-3 border border-white/50 bg-white/50 backdrop-blur-md rounded-lg shadow-sm">
        {/* Calendar Icon */}
        <Calendar className="h-5 w-5 text-gray-400 shrink-0" />

        {/* Day */}
        <div className="relative flex-1">
          <select
            value={day}
            onChange={(e) => handleDay(e.target.value)}
            className={triggerClass + " pr-7 cursor-pointer"}
          >
            <option value="">Hari</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Month */}
        <div className="relative flex-[2]">
          <select
            value={month}
            onChange={(e) => handleMonth(e.target.value)}
            className={triggerClass + " pr-7 cursor-pointer"}
          >
            <option value="">Bulan</option>
            {MONTHS.map((m, idx) => (
              <option key={m} value={String(idx + 1)}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Year */}
        <div className="relative flex-[1.5]">
          <select
            value={year}
            onChange={(e) => handleYear(e.target.value)}
            className={triggerClass + " pr-7 cursor-pointer"}
          >
            <option value="">Tahun</option>
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
