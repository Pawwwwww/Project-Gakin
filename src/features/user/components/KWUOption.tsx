// Extracted from Kuesioner.tsx — Plain radio option for KWU questions

export function KWUOption({ score, label, selected, onChange }: {
  score: number; label: string; selected: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selected
        ? "border-red-500 bg-red-50"
        : "border-gray-200 hover:border-red-300 hover:bg-red-50/40"
        }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${selected ? "border-red-600" : "border-gray-300"
            }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
        </div>
        <p className={`text-xs leading-relaxed ${selected ? "text-gray-900 font-medium" : "text-gray-700"}`}>{label}</p>
      </div>
    </button>
  );
}
