import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  icon: LucideIcon;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  icon: Icon,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0, rotateX: 10, filter: "blur(4px)" }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.8, y: 30, opacity: 0, rotateX: -10, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
            className="relative w-full max-w-[280px] xs:max-w-xs sm:max-w-sm bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-5 sm:p-8 text-center overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-x-0 -top-20 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-5 border border-blue-500/30 shadow-inner">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-blue-100/80 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600/90 hover:bg-blue-500 shadow-lg shadow-blue-600/30 border border-blue-500/50 transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
