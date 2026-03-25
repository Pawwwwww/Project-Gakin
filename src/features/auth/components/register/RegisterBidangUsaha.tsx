import { SearchableSelect } from "../../../../components/shared/SearchableSelect";
import {
  BIDANG_USAHA_OPTIONS, BIDANG_USAHA_DESKRIPSI,
  PENGHASILAN_OPTIONS, LAMA_BERUSAHA_OPTIONS, GANTI_USAHA_OPTIONS,
} from "../../../../entities/common";

const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
const inputNoIconClass =
  "block w-full px-3 py-3 border border-white/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-gray-400";

interface RegisterBidangUsahaProps {
  bidangUsaha: string;
  bidangUsahaLainnya: string;
  penghasilanPerHari: string;
  lamaBerusaha: string;
  gantiUsaha: string;
  onChange: (field: string, value: string) => void;
}

/** Bidang usaha detail section, shown when user already has a business */
export function RegisterBidangUsaha({
  bidangUsaha, bidangUsahaLainnya, penghasilanPerHari, lamaBerusaha, gantiUsaha, onChange,
}: RegisterBidangUsahaProps) {
  return (
    <div className="space-y-4 bg-blue-50/50 rounded-xl p-5 border border-blue-100 animate-fadeIn">

      {/* Pilihan Bidang */}
      <div>
        <label className={labelClass}>Bidang Usaha <span className="text-blue-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BIDANG_USAHA_OPTIONS.map((opt) => (
            <label key={opt}
              className={`flex flex-col items-center justify-center text-center p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                bidangUsaha === opt
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  : "border-gray-200 bg-white hover:border-blue-300 text-gray-600"
              }`}
            >
              <input type="radio" name="bidangUsaha" value={opt}
                checked={bidangUsaha === opt}
                onChange={(e) => onChange("bidangUsaha", e.target.value)}
                className="sr-only" />
              <span className="font-medium">{opt}</span>
              <span className="text-[11px] text-gray-400 mt-0.5 leading-tight">{BIDANG_USAHA_DESKRIPSI[opt]}</span>
            </label>
          ))}
        </div>

        {bidangUsaha === "Lainnya" && (
          <div className="mt-3">
            <label className={labelClass}>Sebutkan bidang usaha Anda <span className="text-blue-500">*</span></label>
            <input type="text" value={bidangUsahaLainnya}
              onChange={(e) => onChange("bidangUsahaLainnya", e.target.value)}
              className={inputNoIconClass} placeholder="Contoh: Fotografi, Percetakan, dll" required />
          </div>
        )}
      </div>

      {/* Penghasilan */}
      <div>
        <label className={labelClass}>Penghasilan Bersih / Hari <span className="text-blue-500">*</span></label>
        <SearchableSelect options={PENGHASILAN_OPTIONS} value={penghasilanPerHari}
          onChange={(v) => onChange("penghasilanPerHari", v)}
          placeholder="Pilih rentang penghasilan" showSearch={false} required />
      </div>

      {/* Lama Berusaha & Ganti Usaha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Lama Berusaha <span className="text-blue-500">*</span></label>
          <SearchableSelect options={LAMA_BERUSAHA_OPTIONS} value={lamaBerusaha}
            onChange={(v) => onChange("lamaBerusaha", v)} placeholder="Pilih" showSearch={false} required />
        </div>
        <div>
          <label className={labelClass}>Berapa Kali Ganti Usaha <span className="text-blue-500">*</span></label>
          <SearchableSelect options={GANTI_USAHA_OPTIONS} value={gantiUsaha}
            onChange={(v) => onChange("gantiUsaha", v)} placeholder="Pilih" showSearch={false} required />
        </div>
      </div>
    </div>
  );
}
