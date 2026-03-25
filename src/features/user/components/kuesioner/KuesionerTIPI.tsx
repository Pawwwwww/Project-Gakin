import { TIPI_QUESTIONS, TIPI_LABELS } from "../../../../entities/respondent";
import type { KuesionerData } from "../../../../entities/respondent";

interface KuesionerTIPIProps {
  data: KuesionerData;
  setTipi: (id: number, v: number) => void;
  answered: number;
}

export function KuesionerTIPI({ data, setTipi, answered }: KuesionerTIPIProps) {
  return (
    <div className="space-y-5">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm mb-2">Bagian III</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          TIPI (<i>Ten Item Personality Inventory</i>) adalah skala pengukuran kepribadian yang dirancang
          untuk mengukur sepuluh aspek penting dari kepribadian seseorang.
          <br />
          Berikut ini adalah sepuluh pernyataan tentang sifat/kepribadian. Pilihlah nomor yang paling sesuai
          menggambarkan diri Anda.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-1 text-xs">
          {[
            { n: 1, label: "Sangat Tidak Setuju",  cls: "bg-purple-50 text-purple-600" },
            { n: 2, label: "Tidak Setuju",          cls: "bg-purple-50/50 text-purple-600" },
            { n: 3, label: "Agak Tidak Setuju",     cls: "bg-purple-100/50 text-purple-700" },
            { n: 4, label: "Netral",                cls: "bg-purple-100 text-purple-700" },
            { n: 5, label: "Agak Setuju",           cls: "bg-purple-200/50 text-purple-800" },
            { n: 6, label: "Setuju",                cls: "bg-purple-200 text-purple-800" },
            { n: 7, label: "Sangat Sesuai",         cls: "bg-purple-300 text-purple-900" },
          ].map((item) => (
            <div key={item.n} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${item.cls}`}>
              <span className="font-bold">{item.n}</span>
              <span className="leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{answered} dari 10 pernyataan dijawab</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full overflow-hidden transition-all duration-500 ease-out rounded-full" style={{ width: `${(answered / 10) * 100}%` }}>
            <div className="h-full w-32 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700" />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 italic">"Saya adalah seseorang yang..."</p>

      {/* Desktop column header */}
      <div className="hidden lg:grid lg:grid-cols-[2fr_repeat(7,44px)] gap-1 px-2 text-center">
        <div />
        {TIPI_LABELS.map((_l, i) => (
          <div key={i} className="text-xs text-gray-400">{i + 1}</div>
        ))}
      </div>

      {TIPI_QUESTIONS.map((q, idx) => {
        const isUF = q.id >= 6;
        return (
          <div key={q.id} id={`tipi-q-${q.id}`} className={`rounded-xl border transition-all ${data.tipi[q.id] ? "border-purple-200 bg-purple-50/30" : "border-gray-100 hover:border-purple-100"}`}>
            {/* Mobile */}
            <div className="lg:hidden p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-700 mb-1">
                <span className={`font-bold mr-1 ${isUF ? "text-blue-500" : "text-blue-600"}`}>{idx + 1}.</span>
                {q.text}
              </p>
              <div className="grid grid-cols-7 gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button key={n} type="button" onClick={() => setTipi(q.id, n)}
                    className={`h-8 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all hover:scale-110 ${data.tipi[q.id] === n ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-blue-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] sm:text-xs text-gray-400">Sangat Tidak Setuju</span>
                <span className="text-[9px] sm:text-xs text-gray-400">Sangat Sesuai</span>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden lg:grid lg:grid-cols-[2fr_repeat(7,44px)] gap-1 p-3 items-center">
              <p className="text-sm text-gray-700 pr-2">
                <span className={`font-semibold mr-1 ${isUF ? "text-blue-500" : "text-blue-600"}`}>{idx + 1}.</span>
                {q.text}
              </p>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div key={n} className="flex justify-center">
                  <button type="button" onClick={() => setTipi(q.id, n)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${data.tipi[q.id] === n ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-blue-400"}`}>
                    {n}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
