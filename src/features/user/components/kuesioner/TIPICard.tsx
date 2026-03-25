// Extracted from Kuesioner.tsx — Flip card for TIPI personality results

import { useState } from "react";
import {
  TIPI_CATEGORY_META, TIPI_DESCRIPTIONS, TIPI_ASPECT_LABELS,
  type TIPIAspect,
} from "../../../../entities/respondent";

export function TIPICard({ aspect, cat }: { aspect: TIPIAspect; cat: string }) {
  const [flipped, setFlipped] = useState(false);
  const meta = TIPI_CATEGORY_META[cat] || { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
  const description = TIPI_DESCRIPTIONS[aspect]?.[cat] || "";
  const title = TIPI_ASPECT_LABELS[aspect].split(" (")[0];

  return (
    <div
      className="relative w-full h-36 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="w-full h-full transition-transform duration-500 ease-in-out shadow-sm rounded-xl"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/50 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-xs font-semibold text-gray-700 mb-2 leading-tight">
            {title}
          </p>
          <span className={`inline-block text-xs font-bold px-2 py-1.5 rounded-full ${meta.color} ${meta.bg}`}>
            {cat}
          </span>
          <p className="text-[10px] text-gray-400 mt-auto animate-pulse">Klik melihat deskripsi</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-blue-50/80 backdrop-blur-md rounded-xl p-3 border border-blue-200 shadow-inner flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-xs font-semibold text-blue-900 mb-1">{title}</p>
          <p className="text-[11px] font-medium text-gray-700 leading-snug">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
