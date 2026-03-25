import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, User, Home } from "lucide-react";
import type { DataItem } from "../../../../../data/mockRespondents";

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;

  textSecondary: string;
  textPrimary: string;
  borderCol: string;
  glowLight: string;
  formInputClass: string;
  modalOrigin: { x: number; y: number };
  allData: DataItem[];
  formRef: React.RefObject<HTMLFormElement | null>;
}

export function AddDataModal({
  isOpen, onClose, onSubmit, textSecondary, textPrimary,
  borderCol, glowLight, formInputClass, modalOrigin, formRef,
}: AddDataModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 perspective-[1000px]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="absolute -inset-10 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: 45 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.1, x: modalOrigin.x - window.innerWidth / 2, y: modalOrigin.y - window.innerHeight / 2, filter: "blur(10px)", rotateX: -45 }}
            transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
            className="w-full max-w-lg md:max-w-xl relative z-10 origin-center rounded-2xl overflow-hidden">
            <div className={`shadow-2xl border backdrop-blur-2xl relative flex flex-col ${"bg-white/95 border-gray-200"}`} style={{ maxHeight: "85vh" }}>
              <div className={`absolute -top-24 -right-24 w-64 h-64 ${glowLight} blur-[80px] rounded-full pointer-events-none`} />

              {/* Header */}
              <div className={`flex items-center justify-between p-6 pb-4 relative z-10 border-b shrink-0 ${borderCol}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${textPrimary}`}>Tambah Data GAKIN</h2>
                    <p className={`text-xs ${textSecondary}`}>Masukkan data diri responden baru.</p>
                  </div>
                </div>
                <button onClick={onClose} className={`${textSecondary} hover:${textPrimary} transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar" style={{ maxHeight: "calc(85vh - 140px)" }}>
                <form ref={formRef} id="addGakinForm" onSubmit={onSubmit} className="space-y-6 relative z-10">
                  <div>
                    <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Data Diri
                    </h3>
                    <div className="space-y-3">
                      <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>NIK <span className="text-blue-500">*</span></label><input name="nik" type="text" placeholder="Masukkan NIK (16 digit)" className={formInputClass} maxLength={16} required /></div>
                      <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Nama Lengkap <span className="text-blue-500">*</span></label><input name="nama" type="text" placeholder="Masukkan nama lengkap" className={formInputClass} required /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Jenis Kelamin <span className="text-blue-500">*</span></label>
                          <select name="jenisKelamin" className={formInputClass} required>
                            <option value="" className={"bg-white"}>Pilih</option>
                            <option value="Laki-laki" className={"bg-white"}>Laki-laki</option>
                            <option value="Perempuan" className={"bg-white"}>Perempuan</option>
                          </select>
                        </div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>No. Telepon <span className="text-blue-500">*</span></label><input name="phone" type="tel" placeholder="08xxxxxxxxxx" className={formInputClass} required /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Tempat Lahir <span className="text-blue-500">*</span></label><input name="tempatLahir" type="text" placeholder="Kota/Kabupaten" className={formInputClass} required /></div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Tanggal Lahir <span className="text-blue-500">*</span></label><input name="tanggalLahir" type="date" className={formInputClass} required /></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Home className="w-3.5 h-3.5" /> Alamat KTP
                    </h3>
                    <div className="space-y-3">
                      <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Alamat Lengkap <span className="text-blue-500">*</span></label><input type="text" placeholder="Jl. Contoh No. 123" className={formInputClass} required /></div>
                      <div className="grid grid-cols-4 gap-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>RT</label><input type="text" placeholder="001" className={formInputClass} maxLength={3} /></div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>RW</label><input type="text" placeholder="005" className={formInputClass} maxLength={3} /></div>
                        <div className="col-span-2"><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kecamatan <span className="text-blue-500">*</span></label><input name="kecamatan" type="text" placeholder="Kecamatan" className={formInputClass} required /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kelurahan <span className="text-blue-500">*</span></label><input name="kelurahan" type="text" placeholder="Kelurahan" className={formInputClass} required /></div>
                        <div><label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Kode Pos</label><input type="text" placeholder="60285" className={formInputClass} maxLength={5} /></div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t shrink-0 relative z-10 ${borderCol}`}>
                <button type="submit" form="addGakinForm" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 text-sm font-bold rounded-lg transition-colors">
                  Tambahkan Data GAKIN
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
