import { ReactNode, useEffect, useState } from "react";

interface UserHeaderProps {
  rightContent?: ReactNode;
}

export default function UserHeader({ rightContent }: UserHeaderProps) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("app_font_size");
    return saved ? parseInt(saved, 10) : 16;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("app_font_size", fontSize.toString());
  }, [fontSize]);

  const increaseFont = () => setFontSize(f => Math.min(f + 2, 22));
  const decreaseFont = () => setFontSize(f => Math.max(f - 2, 12));

  return (
    <header className="flex-none bg-blue-800 shadow-xl transition-colors duration-500 relative z-20">
      <div className="max-w-[1024px] mx-auto px-[12px] sm:px-[24px] lg:px-[32px] py-[12px] flex items-center justify-between gap-[8px] sm:gap-[12px]">
        
        {/* Logos & Titles */}
        <div className="flex items-center gap-[8px] flex-1 min-w-0">
          <div className="flex items-center gap-[6px] md:gap-[10px] px-[8px] sm:px-[12px] py-[6px] bg-white rounded-full shadow-sm flex-shrink-0">
            <img src="/assets/images/Pemkot Logo.png" alt="Pemkot Surabaya" className="h-[18px] w-[18px] sm:h-[24px] sm:w-[24px] md:h-[34px] md:w-[34px] object-cover object-left" />
            <div className="w-[1px] h-[12px] sm:h-[16px] md:h-[20px] bg-gray-300"></div>
            <img src="/assets/images/brida-logo-watermark.png" alt="BRIDA Surabaya" className="h-[18px] sm:h-[24px] md:h-[34px] object-contain" />
            
            <div className="hidden sm:block w-[1px] h-[16px] md:h-[20px] bg-gray-300"></div>
            <img src="/assets/images/Surabaya City Heroes Logo.png" alt="Surabaya City Heroes" className="hidden sm:block h-[24px] w-[48px] md:h-[34px] md:w-[68px] object-cover object-center" />
            <div className="hidden sm:block w-[1px] h-[16px] md:h-[20px] bg-gray-300"></div>
            <img src="/assets/images/Bangga Logo.png" alt="Bangga Surabaya" className="hidden sm:block h-[24px] md:h-[34px] ml-[2px] object-contain" />
          </div>
          <div className="flex-1 min-w-0 text-white text-left block">
            <p className="font-bold text-[12px] sm:text-[14px] leading-tight tracking-wide">BRIDA STEP</p>
            <p className="text-blue-200 text-[9px] sm:text-[12px] leading-tight">BRIDA Surabaya Talent Entrepreneurial Path</p>
          </div>
        </div>

        {/* Right Actions (Font Sizer + Content) */}
        <div className="flex items-center gap-[6px] sm:gap-[12px] flex-shrink-0">
          <div className="flex items-center bg-black/20 rounded-[8px] p-[2px] border border-white/10 shadow-inner">
            <button onClick={decreaseFont} className="px-[6px] sm:px-[8px] py-[4px] text-white/90 hover:bg-white/20 hover:text-white rounded-[4px] font-medium text-[10px] sm:text-[12px] transition-colors" title="Perkecil Teks">A-</button>
            <div className="w-[1px] h-[12px] bg-white/20 mx-[2px]"></div>
            <button onClick={increaseFont} className="px-[6px] sm:px-[8px] py-[4px] text-white/90 hover:bg-white/20 hover:text-white rounded-[4px] font-bold text-[12px] sm:text-[14px] transition-colors" title="Perbesar Teks">A+</button>
          </div>
          {rightContent}
        </div>
      </div>
    </header>
  );
}
