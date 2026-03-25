import { MapPin, Home } from "lucide-react";
import { SearchableSelect } from "../../../../components/shared/SearchableSelect";
import { KOTA_KABUPATEN_INDONESIA, KECAMATAN_SURABAYA, KELURAHAN_SURABAYA } from "../../../../data/indonesiaData";
import { PROVINSI_OPTIONS } from "../../../../entities/common";
import type { UserRecord } from "../../../../services/StorageService";

interface ProfileAddressProps {
  formData: UserRecord;
  update: (field: string, value: string) => void;
  isEditing: boolean;
  prefix: "Ktp" | "Domisili";
  disabledSection: boolean;
  labelClass: string;
  inputClass: string;
  inputNoIconClass: string;
}

export function ProfileAddress({
  formData, update, isEditing, prefix, disabledSection,
  labelClass, inputClass, inputNoIconClass,
}: ProfileAddressProps) {
  const alamatKey = `alamat${prefix}` as keyof UserRecord;
  const rtKey     = `rt${prefix}` as keyof UserRecord;
  const rwKey     = `rw${prefix}` as keyof UserRecord;
  const kelKey    = `kelurahan${prefix}` as keyof UserRecord;
  const kecKey    = `kecamatan${prefix}` as keyof UserRecord;
  const kotaKey   = `kota${prefix}` as keyof UserRecord;
  const provKey   = `provinsi${prefix}` as keyof UserRecord;
  const posKey    = `kodePos${prefix}` as keyof UserRecord;
  const isDisabled = disabledSection || !isEditing || formData.isSurabaya;
  const disabledStyle = (disabledSection && isEditing) || (isEditing && formData.isSurabaya)
    ? " bg-slate-50/50 text-gray-400 cursor-not-allowed border-blue-100" : "";
  const iconWrap = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";
  const upd = (key: keyof UserRecord, val: string) => update(String(key), val);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Alamat Lengkap {isEditing && <span className="text-blue-600">*</span>}</label>
        <div className="relative">
          <div className={iconWrap}><Home className="h-5 w-5 text-gray-400" /></div>
          <input type="text" value={(formData[alamatKey] as string) || ""}
            onChange={(e) => update(String(alamatKey), e.target.value)}
            className={inputClass + disabledStyle} placeholder="Jl. Jimerto No.28"
            required={isEditing} disabled={isDisabled} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>RT {isEditing && <span className="text-blue-600">*</span>}</label>
          <input type="text" value={(formData[rtKey] as string) || ""}
            onChange={(e) => update(String(rtKey), e.target.value)}
            className={inputNoIconClass + disabledStyle} placeholder="001" maxLength={3}
            required={isEditing} disabled={isDisabled} />
        </div>
        <div>
          <label className={labelClass}>RW {isEditing && <span className="text-blue-600">*</span>}</label>
          <input type="text" value={(formData[rwKey] as string) || ""}
            onChange={(e) => update(String(rwKey), e.target.value)}
            className={inputNoIconClass + disabledStyle} placeholder="005" maxLength={3}
            required={isEditing} disabled={isDisabled} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kelurahan / Desa {isEditing && <span className="text-blue-600">*</span>}</label>
          {isDisabled ? (
            <input type="text" value={(formData[kelKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
          ) : (
            <SearchableSelect options={KELURAHAN_SURABAYA} value={(formData[kelKey] as string) || ""}
              onChange={(v) => update(String(kelKey), v)} placeholder="Pilih Kelurahan"
              icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          )}
        </div>
        <div>
          <label className={labelClass}>Kecamatan {isEditing && <span className="text-blue-600">*</span>}</label>
          {isDisabled ? (
            <input type="text" value={(formData[kecKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
          ) : (
            <SearchableSelect options={KECAMATAN_SURABAYA} value={(formData[kecKey] as string) || ""}
              onChange={(v) => update(String(kecKey), v)} placeholder="Pilih Kecamatan"
              icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kota / Kabupaten {isEditing && <span className="text-blue-600">*</span>}</label>
          {isDisabled ? (
            <input type="text" value={(formData[kotaKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
          ) : (
            <SearchableSelect options={KOTA_KABUPATEN_INDONESIA} value={(formData[kotaKey] as string) || ""}
              onChange={(v) => update(String(kotaKey), v)} placeholder="Pilih Kota/Kabupaten"
              icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          )}
        </div>
        <div>
          <label className={labelClass}>Provinsi {isEditing && <span className="text-blue-600">*</span>}</label>
          {isDisabled ? (
            <input type="text" value={(formData[provKey] as string) || ""} className={inputNoIconClass + disabledStyle} disabled />
          ) : (
            <SearchableSelect options={PROVINSI_OPTIONS} value={(formData[provKey] as string) || ""}
              onChange={(v) => update(String(provKey), v)} placeholder="Pilih Provinsi"
              icon={<MapPin className="h-5 w-5 text-gray-400" />} required />
          )}
        </div>
      </div>

      <div className="sm:w-1/2">
        <label className={labelClass}>Kode Pos {isEditing && <span className="text-blue-600">*</span>}</label>
        <input type="text" value={(formData[posKey] as string) || ""}
          onChange={(e) => update(String(posKey), e.target.value)}
          className={inputNoIconClass + disabledStyle} placeholder="60111" maxLength={5}
          pattern="[0-9]{5}" title="Kode Pos harus 5 digit angka"
          required={isEditing} disabled={isDisabled} />
      </div>
    </div>
  );
}
