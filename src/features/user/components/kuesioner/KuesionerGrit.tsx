import { GRIT_QUESTIONS, GRIT_LABELS } from "../../../../entities/respondent";
import type { KuesionerData } from "../../../../entities/respondent";

interface KuesionerGritProps {
  data: KuesionerData;
  setGrit: (id: number, v: number) => void;
  answered: number;
}

export function KuesionerGrit({ data, setGrit, answered }: KuesionerGritProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm mb-2">Bagian I</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          GRIT (<b>Guts, Resilience, Initiative, and Tenacity</b>) merupakan skala pengukuruan ketekunan seseorang.
          GRIT adalah karakter yang mencerminkan perpaduan antara ketekunan (<i>perseverance</i>) dan konsistensi
          minat dalam mencapai tujuan jangka panjang (<i>passion for long-term goals</i>).
          <br />
          Pernyataan-pernyataan berikut berkaitan dengan kondisi diri Anda saat ini. Pilihlah jawaban yang
          paling sesuai dengan diri Anda.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-1 text-xs">
          {[
            { n: 1, label: "Tidak Sesuai",   cls: "bg-purple-50 text-purple-600" },
            { n: 2, label: "Kurang Sesuai",  cls: "bg-purple-100/50 text-purple-700" },
            { n: 3, label: "Agak Sesuai",    cls: "bg-purple-100 text-purple-700" },
            { n: 4, label: "Cukup Sesuai",   cls: "bg-purple-200 text-purple-800" },
            { n: 5, label: "Sangat Sesuai",  cls: "bg-purple-300 text-purple-900" },
          ].map((item) => (
            <div key={item.n} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${item.cls}`}>
              <span className="font-bold">{item.n}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{answered} dari 12 pernyataan dijawab</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full overflow-hidden transition-all duration-500 ease-out rounded-full" style={{ width: `${(answered / 12) * 100}%` }}>
            <div className="h-full w-32 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700" />
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:grid md:grid-cols-[2fr_repeat(5,52px)] gap-1 px-2 text-center">
        <div />
        {GRIT_LABELS.map((l, i) => (
          <div key={i} className="text-xs text-gray-500 leading-tight whitespace-pre-line">{l}</div>
        ))}
      </div>

      {GRIT_QUESTIONS.map((q, idx) => (
        <div key={q.id} id={`grit-q-${q.id}`} className={`rounded-xl border transition-all ${data.grit[q.id] ? "border-purple-200 bg-purple-50/30" : "border-gray-100 hover:border-purple-100"}`}>
          {/* Mobile */}
          <div className="md:hidden p-3 sm:p-4">
            <p className="text-xs sm:text-sm mb-3 text-gray-700">
              <span className="text-blue-600 font-bold mr-1">{idx + 1}.</span>{q.text}
            </p>
            <div className="flex justify-between items-center gap-1">
              <span className="text-xs text-gray-400 hidden xs:block">TS</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setGrit(q.id, n)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${data.grit[q.id] === n ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-blue-400"}`}>
                  {n}
                </button>
              ))}
              <span className="text-xs text-gray-400 hidden xs:block">SS</span>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-[2fr_repeat(5,52px)] gap-1 p-3 items-center">
            <p className="text-sm pr-2 text-gray-700">
              <span className="text-blue-600 font-semibold mr-1">{idx + 1}.</span>{q.text}
            </p>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex justify-center">
                <button type="button" onClick={() => setGrit(q.id, n)}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${data.grit[q.id] === n ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-gray-300 text-gray-500 hover:border-blue-400"}`}>
                  {n}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
