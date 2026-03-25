import { MapPin, Home } from "lucide-react";
import { SearchableSelect } from "../../../../components/shared/SearchableSelect";
import {
  KOTA_KABUPATEN_INDONESIA,
  KECAMATAN_SURABAYA,
  KELURAHAN_SURABAYA,
} from "../../../../data/indonesiaData";
import { PROVINSI_OPTIONS } from "../../../../entities/common";

const inputClass =
  "block w-full pl-10 pr-3 py-3 border border-white/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-gray-400";
const inputNoIconClass =
  "block w-full px-3 py-3 border border-white/50 bg-white/50 backdrop-blur-md rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
const iconWrap = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";

interface RegisterAddressFieldsProps {
  prefix: "Ktp" | "Domisili";
  disabled: boolean;
  formData: Record<string, any>;
  onChange: (field: string, value: string) => void;
}

/** Address block shared between KTP and Domisili sections of the Register form */
export function RegisterAddressFields({ prefix, disabled, formData, onChange }: RegisterAddressFieldsProps) {
  const alamatKey = `alamat${prefix}`;
  const rtKey     = `rt${prefix}`;
  const rwKey     = `rw${prefix}`;
  const kelKey    = `kelurahan${prefix}`;
  const kecKey    = `kecamatan${prefix}`;
  const kotaKey   = `kota${prefix}`;
  const provKey   = `provinsi${prefix}`;
  const posKey    = `kodePos${prefix}`;
  const dis = disabled ? " bg-gray-50 text-gray-400 cursor-not-allowed" : "";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Alamat Lengkap {!disabled && <span className="text-blue-500">*</span>}</label>
        <div className="relative">
          <div className={iconWrap}><Home className="h-5 w-5 text-gray-400" /></div>
          <input type="text" value={formData[alamatKey] || ""} onChange={(e) => onChange(alamatKey, e.target.value)}
            className={inputClass + dis} placeholder="Jl. Jimerto No.28" required={!disabled} disabled={disabled} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>RT {!disabled && <span className="text-blue-500">*</span>}</label>
          <input type="text" value={formData[rtKey]} onChange={(e) => onChange(rtKey, e.target.value)}
            className={inputNoIconClass + dis} placeholder="001" maxLength={3} required disabled={disabled} />
        </div>
        <div>
          <label className={labelClass}>RW {!disabled && <span className="text-blue-500">*</span>}</label>
          <input type="text" value={formData[rwKey]} onChange={(e) => onChange(rwKey, e.target.value)}
            className={inputNoIconClass + dis} placeholder="005" maxLength={3} required disabled={disabled} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kelurahan / Desa {!disabled && <span className="text-blue-500">*</span>}</label>
          {disabled
            ? <input type="text" value={formData[kelKey]} className={inputNoIconClass + dis} disabled />
            : <SearchableSelect options={KELURAHAN_SURABAYA} value={formData[kelKey]}
                onChange={(v) => onChange(kelKey, v)} placeholder="Pilih Kelurahan"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          }
        </div>
        <div>
          <label className={labelClass}>Kecamatan {!disabled && <span className="text-blue-500">*</span>}</label>
          {disabled
            ? <input type="text" value={formData[kecKey]} className={inputNoIconClass + dis} disabled />
            : <SearchableSelect options={KECAMATAN_SURABAYA} value={formData[kecKey]}
                onChange={(v) => onChange(kecKey, v)} placeholder="Pilih Kecamatan"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          }
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kota / Kabupaten {!disabled && <span className="text-blue-500">*</span>}</label>
          {disabled
            ? <input type="text" value={formData[kotaKey]} className={inputNoIconClass + dis} disabled />
            : <SearchableSelect options={KOTA_KABUPATEN_INDONESIA} value={formData[kotaKey]}
                onChange={(v) => onChange(kotaKey, v)} placeholder="Pilih Kota/Kabupaten"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          }
        </div>
        <div>
          <label className={labelClass}>Provinsi {!disabled && <span className="text-blue-500">*</span>}</label>
          {disabled
            ? <input type="text" value={formData[provKey]} className={inputNoIconClass + dis} disabled />
            : <SearchableSelect options={PROVINSI_OPTIONS} value={formData[provKey]}
                onChange={(v) => onChange(provKey, v)} placeholder="Pilih Provinsi"
                icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          }
        </div>
      </div>

      <div className="sm:w-1/2">
        <label className={labelClass}>Kode Pos {!disabled && <span className="text-blue-500">*</span>}</label>
        <input type="text" value={formData[posKey]} onChange={(e) => onChange(posKey, e.target.value)}
          className={inputNoIconClass + dis} placeholder="60111" maxLength={5}
          pattern="[0-9]{5}" title="Kode Pos harus 5 digit angka" required disabled={disabled} />
      </div>
    </div>
  );
}
