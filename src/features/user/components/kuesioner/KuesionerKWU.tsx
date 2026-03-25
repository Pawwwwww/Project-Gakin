import { KWU_ITEMS, KWU_GROUPS, KWU_GROUP_LABELS, KWU_GROUP_COLORS } from "../../../../entities/respondent";
import type { KuesionerData } from "../../../../entities/respondent";
import { KWUOption } from "./KWUOption";

interface KuesionerKWUProps {
  data: KuesionerData;
  setKwu: (id: number, v: number) => void;
  answered: number;
}

export function KuesionerKWU({ data, setKwu, answered }: KuesionerKWUProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm mb-2">Bagian II</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Kompetensi Wirausaha adalah keterampilan yang diperlukan untuk menjadi wirausahawan yang berhasil.
          Skala pengukuran ini digunakan untuk mengukur tingkat kompetensi wirausaha seseorang.
          <br />Setiap nomor terdapat empat pernyataan yang menggambarkan tingkat kompetensi dari rendah ke tinggi.
          Pilihlah <strong>satu pernyataan</strong> yang paling sesuai dan menggambarkan diri Anda.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{answered} dari 15 pernyataan dijawab</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full overflow-hidden transition-all duration-500 ease-out rounded-full" style={{ width: `${(answered / 15) * 100}%` }}>
            <div className="h-full w-32 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700" />
          </div>
        </div>
      </div>

      {KWU_GROUPS.map((grp) => {
        const items = KWU_ITEMS.filter((item) => item.kategori === grp);
        return (
          <div key={grp}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 bg-gradient-to-r ${KWU_GROUP_COLORS[grp]}`}>
              <span className="text-white text-xs font-bold uppercase tracking-wide">{KWU_GROUP_LABELS[grp]}</span>
              <span className="text-white/60 text-xs">({grp})</span>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} id={`kwu-q-${item.id}`} className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:border-purple-100 transition-all">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      <span className="text-blue-600 mr-1">{item.id}.</span>{item.aspek}
                    </p>
                    <p className="text-xs text-gray-400 italic">{item.aspekEn}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.options.map((opt, optIdx) => (
                      <KWUOption
                        key={optIdx}
                        score={optIdx + 1}
                        label={opt}
                        selected={data.kwu[item.id] === optIdx + 1}
                        onChange={() => setKwu(item.id, optIdx + 1)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
