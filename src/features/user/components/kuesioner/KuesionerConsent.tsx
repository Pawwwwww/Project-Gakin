import { Check } from "lucide-react";
import type { KuesionerData } from "../../../../entities/respondent";

interface KuesionerConsentProps {
  data: KuesionerData;
  onToggleConsent: () => void;
}

export function KuesionerConsent({ data, onToggleConsent }: KuesionerConsentProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <p className="text-sm text-gray-700 mb-2">Salam Sejahtera,</p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Bapak/Ibu/Saudara/i yang kami hormati, Kami mengundang Anda untuk mengisi kuesioner ini
          guna memperoleh gambaran pengalaman dalam bekerja serta mengembangkan usaha/bisnis selama ini.
          Tidak ada jawaban yang benar atau salah. Kami berharap Bapak/Ibu/Saudara/i dapat menjawab
          setiap pertanyaan sesuai dengan kondisi yang sebenarnya/dirasakan. Seluruh data dan informasi
          yang diberikan akan dijaga kerahasiaannya dan hanya digunakan untuk kepentingan pengembangan
          dan evaluasi program Pemerintah Kota Surabaya.
        </p>
        <p className="text-sm text-gray-700">
          Kami sampaikan terima kasih atas kesediaan dan bantuan Bapak/Ibu/Saudara/i
        </p>
      </div>

      <div id="consent-box" className="border border-blue-100 rounded-xl p-4 sm:p-5 bg-blue-50">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
          Lembar Persetujuan <span className="italic font-normal">(Informed Consent)</span>
        </h3>
        <ol className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
          {[
            "Saya mengisi secara sukarela dan tanpa paksaan.",
            "Kerahasiaan data yang saya berikan terjamin.",
            "Saya mengisi dengan benar dan sesuai dengan kondisi yang saya alami.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
              <span className="font-semibold text-blue-700 flex-shrink-0">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onToggleConsent}
          className={`flex items-center gap-2 sm:gap-3 w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
            data.consent ? "border-green-500 bg-green-50" : "border-gray-300 bg-white hover:border-blue-300"
          }`}
        >
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0 ${data.consent ? "bg-green-600" : "border-2 border-gray-300"}`}>
            {data.consent && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">Saya Menyetujui Lembar Persetujuan di Atas</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Centang kotak ini untuk melanjutkan pengisian kuesioner</p>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">Kuesioner ini terdiri dari 3 bagian:</p>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• <strong>Bagian I </strong> berisikan 12 pernyataan, dengan skala 1–5</li>
          <li>• <strong>Bagian II </strong> berisikan 15 pernyataan, dengan skala 1–4</li>
          <li>• <strong>Bagian III </strong> berisikan 10 pernyataan, dengan skala 1–7</li>
        </ul>
      </div>
    </div>
  );
}
