// Extracted from Kuesioner.tsx — Plain radio option for KWU questions

export function KWUOption({ score, label, selected, onChange }: {
  score: number; label: string; selected: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all shadow-sm ${selected
        ? "border-blue-700 bg-blue-700 text-white shadow-md transform scale-[1.02]"
        : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${selected ? "border-white" : "border-gray-300"
            }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
        <p className={`text-xs leading-relaxed ${selected ? "text-white font-bold" : "text-gray-700"}`}>{label}</p>
      </div>
    </button>
  );
}
