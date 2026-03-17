import { ReactNode } from "react";

interface UserHeaderProps {
  rightContent?: ReactNode;
}

export default function UserHeader({ rightContent }: UserHeaderProps) {
  return (
    <header className="flex-none bg-red-700 shadow-md transition-colors duration-500 relative z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white rounded-full shadow-sm">
            <img src="/assets/images/Pemkot Logo.png" alt="Pemkot Surabaya" className="h-10 w-10 object-cover object-left" />
            <div className="w-px h-6 bg-gray-300"></div>
            <img src="/assets/images/brida-logo-watermark.png" alt="BRIDA Surabaya" className="h-10 object-contain" />
            <div className="w-px h-6 bg-gray-300"></div>
            <img src="/assets/images/Surabaya City Heroes Logo.png" alt="Surabaya City Heroes" className="h-10 w-20 object-cover object-center" />
            <div className="w-px h-6 bg-gray-300"></div>
            <img src="/assets/images/Bangga Logo.png" alt="Bangga Surabaya" className="h-10 ml-1 object-contain" />
          </div>
          <div className="hidden md:block ml-2 text-white text-left">
            <p className="font-bold text-sm leading-tight tracking-wide">BRIDA Surabaya</p>
            <p className="text-red-200 text-xs">Kuesioner Kemampuan Pengembangan Bakat dan Keterampilan Berwirausaha</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      </div>
    </header>
  );
}
