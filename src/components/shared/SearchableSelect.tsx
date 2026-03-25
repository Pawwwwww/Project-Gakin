import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  icon,
  required,
  disabled,
  showSearch = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (isOpen) setSearch("");
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden native input for form validation */}
      <input
        type="text"
        tabIndex={-1}
        readOnly
        value={value}
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          block w-full text-left py-3 border rounded-lg transition-colors bg-white text-sm
          ${icon ? "pl-10 pr-8" : "pl-3 pr-8"}
          ${!value ? "text-gray-400" : "text-gray-900"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
          ${isOpen
            ? "border-blue-500 ring-2 ring-blue-500"
            : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        {value || placeholder}
      </button>

      {/* Left icon */}
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}

      {/* Chevron */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
          style={{ minWidth: "100%" }}
        >
          {/* Search box */}
          {showSearch && (
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  placeholder="Ketik untuk mencari..."
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div ref={listRef} className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                Tidak ditemukan
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full text-left px-3 py-2.5 text-sm transition-colors
                    ${
                      option === value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }
                  `}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}