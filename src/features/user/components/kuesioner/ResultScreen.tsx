// Extracted from Kuesioner.tsx — Result screen after kuesioner submission

import { useState, useEffect } from "react";
import { Check, Home, Award } from "lucide-react";
import { motion } from "framer-motion";
import { findUserByNIK, UserRecord } from "../../../../services/StorageService";
import {
  KLUSTER_INFO_RESULT,
  type KuesionerData, type TIPIAspect,
} from "../../../../entities/respondent";
import {
  calcGritScore, getGritCategory, calcKwuScore, getKwuCategory,
  calcTIPIAspects, getTIPICategoryLabel, determineKluster,
} from "../../../../services/ScoringService";

const KLUSTER_INFO = KLUSTER_INFO_RESULT;

export function ResultScreen({ data, userNIK, userName, onBack }: {
  data: KuesionerData; userNIK: string; userName: string; onBack: () => void;
}) {
  // We no longer need completeUser on result screen
  // useEffect(() => {
  //   const user = findUserByNIK(userNIK);
  //   if (user) setCompleteUser(user);
  // }, [userNIK]);

  const gritScore = calcGritScore(data.grit);
  const gritCat = getGritCategory(gritScore);
  const kwuScore = calcKwuScore(data.kwu);
  const kwuCat = getKwuCategory(kwuScore);
  const tipiAspects = calcTIPIAspects(data.tipi);
  const tipiCats = (Object.keys(tipiAspects) as TIPIAspect[]).reduce((acc, aspect) => {
    acc[aspect] = getTIPICategoryLabel(aspect, tipiAspects[aspect]);
    return acc;
  }, {} as Record<TIPIAspect, string>);

  const kluster = determineKluster(gritCat.label, kwuCat.label, tipiCats);
  const klusterInfo = KLUSTER_INFO[kluster];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="rounded-2xl shadow-2xl border border-white/40 bg-white/30 backdrop-blur-xl overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Kuesioner Berhasil Dikirim</h2>
            <p className="text-green-100 text-sm">{userName} · NIK: {userNIK}</p>
          </div>
        </div>
        <div className="px-6 py-3 bg-white/20 backdrop-blur-sm border-t border-white/30">
          <p className="text-xs text-gray-600">
            Tanggal Pengisian:{" "}
            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* Hasil Asesmen (Cluster) */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl p-4 sm:p-6 shadow-lg transition-colors">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/50 backdrop-blur-md border border-white/60 shadow-md">
            <Award className={`w-6 h-6 sm:w-7 sm:h-7 ${klusterInfo.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hasil Pengisian Anda</p>
            <h3 className={`text-lg sm:text-xl font-bold ${klusterInfo.color}`}>{klusterInfo.subtitle}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2">{klusterInfo.desc}</p>
          </div>
        </div>
      </motion.div>
      {/* Footer note */}
      <motion.div variants={itemVariants} className="rounded-xl border border-white/40 bg-white/20 backdrop-blur-xl p-4 text-center">
        <p className="text-xs text-gray-500">
          Hasil ini bersifat rahasia dan hanya digunakan untuk pengembangan dan evaluasi Program Pemerintah Kota Surabaya.
          Data Anda terlindungi sesuai peraturan yang berlaku.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <button
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-700/90 backdrop-blur-sm hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-700/20"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </motion.div>
    </motion.div>
  );
}
