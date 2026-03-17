// Extracted from Kuesioner.tsx — Result screen after kuesioner submission

import { useState, useEffect } from "react";
import { Check, Home, Target, Zap, Brain, Award, Download } from "lucide-react";
import { motion } from "framer-motion";
import { generateRaporPDF } from "../../../utils/pdfGenerator";
import { findUserByNIK, UserRecord, KuesionerSubmission } from "../../../services/StorageService";
import {
  KLUSTER_INFO_RESULT,
  TIPI_ASPECT_LABELS, TIPI_DESCRIPTIONS, TIPI_CATEGORY_META,
  type KuesionerData, type TIPIAspect,
} from "../../../entities/respondent";
import {
  calcGritScore, getGritCategory, calcKwuScore, getKwuCategory,
  calcTIPIAspects, getTIPICategoryLabel, determineKluster,
} from "../../../services/ScoringService";
import { TIPICard } from "./TIPICard";

const KLUSTER_INFO = KLUSTER_INFO_RESULT;

export function ResultScreen({ data, userNIK, userName, onBack }: {
  data: KuesionerData; userNIK: string; userName: string; onBack: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [completeUser, setCompleteUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    const user = findUserByNIK(userNIK);
    if (user) setCompleteUser(user);
  }, [userNIK]);

  const handleDownload = async () => {
    if (!completeUser || isDownloading) return;
    setIsDownloading(true);
    try {
      // Simulate real KuesionerSubmission based on passed data
      const kuesionerResult: KuesionerSubmission = {
        nik: completeUser.nik,
        nama: completeUser.fullName,
        data: data,
        tanggal: new Date().toISOString(),
      };

      await generateRaporPDF(completeUser, kuesionerResult);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

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

  const tipiRows: { aspect: TIPIAspect; cat: string }[] =
    (Object.keys(tipiAspects) as TIPIAspect[]).map((aspect) => ({
      aspect,
      cat: getTIPICategoryLabel(aspect, tipiAspects[aspect]),
    }));

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
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
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
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl p-6 shadow-lg transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/50 backdrop-blur-md border border-white/60 shadow-md">
            <Award className={`w-7 h-7 ${klusterInfo.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hasil Pengisian Anda</p>
            <h3 className={`text-xl font-bold ${klusterInfo.color}`}>{klusterInfo.subtitle}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">{klusterInfo.desc}</p>
          </div>
        </div>
      </motion.div>

      {/* Hasil Per Variabel */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GRIT Box */}
        <div className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-red-700" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">Tingkat Ketekunan (GRIT)</h4>
          </div>
          <p className="text-xs text-gray-500 mb-2">Ketekunan & Semangat</p>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/50">
            <p className={`text-base font-bold ${gritCat.color}`}>{gritCat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{gritCat.desc}</p>
          </div>
        </div>

        {/* KWU Box */}
        <div className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-700" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">Kompetensi Wirausaha</h4>
          </div>
          <p className="text-xs text-gray-500 mb-2">Ide, Sumber Daya & Aksi</p>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/50">
            <p className={`text-base font-bold ${kwuCat.color}`}>{kwuCat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kwuCat.desc}</p>
          </div>
        </div>
      </motion.div>

      {/* TIPI */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl p-5 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-blue-700" />
          </div>
          <h4 className="text-sm font-bold text-gray-800">Profil Kepribadian (TIPI)</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {tipiRows.map(({ aspect, cat }) => (
            <TIPICard key={aspect} aspect={aspect} cat={cat} />
          ))}
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
          onClick={handleDownload}
          disabled={!completeUser || isDownloading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-red-900 border border-red-900/10 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-red-900/30 border-t-red-900 rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          Unduh Rapor PDF
        </button>

        <button
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-700/90 backdrop-blur-sm hover:bg-red-800 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-700/20"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </motion.div>
    </motion.div>
  );
}
