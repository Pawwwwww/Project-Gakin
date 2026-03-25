import { useState } from "react";
import { motion } from "motion/react";
import { Info, HelpCircle, BrainCircuit, Target, Lightbulb, Users } from "lucide-react";

const INFO_DATA = [
  {
    title: "Sistem Klaster",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    gradient: "from-blue-500/20 to-transparent",
    shortDesc: "Pengelompokan Responden",
    description: "Responden dikelompokkan menjadi 4 klaster utama bersadarkan total skor akumulasi dari variabel GRIT, TIPI, dan KWU untuk menentukan prioritas intervensi."
  },
  {
    title: "Skala GRIT",
    icon: Target,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    gradient: "from-blue-500/20 to-transparent",
    shortDesc: "Ketekunan & Minat Jangka Panjang",
    description: "GRIT mengukur kemampuan individu dalam mempertahankan ketekunan (perseverance) dan semangat (passion) untuk mencapai tujuan jangka panjang, terlepas dari berbagai rintangan, kegagalan, dan hambatan kemajuan."
  },
  {
    title: "Kepribadian TIPI",
    icon: BrainCircuit,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    gradient: "from-emerald-500/20 to-transparent",
    shortDesc: "Ten-Item Personality Inventory",
    description: "TIPI adalah alat ukur kepribadian singkat yang menilai 5 dimensi besar (Big Five): Extraversion, Agreeableness, Conscientiousness, Emotional Stability, dan Openness to Experience."
  },
  {
    title: "Kewirausahaan (KWU)",
    icon: Lightbulb,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    gradient: "from-orange-500/20 to-transparent",
    shortDesc: "Potensi & Niat Usaha",
    description: "KWU mengukur kecenderungan sikap proaktif, keinovatifan, pengambilan risiko, serta niat seseorang untuk memulai dan mengembangkan usaha mandiri secara berkelanjutan."
  }
];

function FlippableCard({ data }: { data: typeof INFO_DATA[0] }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-500";

  return (
    <div 
      className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-64 cursor-pointer perspective-[1000px] group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT SIDE */}
        <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 rounded-2xl border ${cardBg} shadow-sm backdrop-blur-xl group-hover:border-blue-400/30 transition-colors`}>
          <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${data.gradient} opacity-20 rounded-2xl pointer-events-none`} />
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border mb-4 ${data.color} transition-transform group-hover:scale-110`}>
            <data.icon className="w-6 h-6" />
          </div>
          <h3 className={`font-bold text-center text-lg mb-1 ${textPrimary}`}>{data.title}</h3>
          <p className={`text-xs text-center font-medium ${textSecondary}`}>{data.shortDesc}</p>
          <div className={`absolute bottom-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${"bg-gray-100 text-gray-400"}`}>
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className={`absolute inset-0 backface-hidden flex flex-col p-6 rounded-2xl border overflow-y-auto custom-scrollbar ${cardBg} shadow-lg backdrop-blur-xl`}
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className={`w-4 h-4 ${data.color.split(" ")[1]}`} />
            <h4 className={`font-bold text-sm ${textPrimary}`}>{data.title}</h4>
          </div>
          <p className={`text-sm leading-relaxed ${textSecondary}`}>{data.description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function FeatureInfoCards() {  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
      <div className="mb-6">
        <h3 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
          <Info className="w-5 h-5 text-blue-500" /> Informasi Kuesioner
        </h3>
        <p className={`text-sm mt-1 ${textSecondary}`}>Klik kartu di bawah ini untuk melihat detail istilah yang digunakan dalam analisis.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {INFO_DATA.map((data, idx) => (
          <FlippableCard key={idx} data={data} />
        ))}
      </div>
    </motion.div>
  );
}
