import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRegionalStats, type RegionData } from "../../../hooks/useRegionalStats";

const CLUSTER_COLORS: Record<number, string> = {
  0: "bg-gray-200 text-gray-500 border-gray-300",
  1: "bg-blue-100 text-blue-700 border-blue-400",
  2: "bg-orange-100 text-orange-700 border-orange-400",
  3: "bg-yellow-100 text-yellow-700 border-yellow-400",
  4: "bg-green-100 text-green-700 border-green-400",
};

const DOT_COLORS: Record<number, string> = {
  0: "bg-gray-400",
  1: "bg-blue-500 shadow-blue-500/50",
  2: "bg-orange-500 shadow-orange-500/50",
  3: "bg-yellow-500 shadow-yellow-500/50",
  4: "bg-green-500 shadow-green-500/50",
};

export function SurabayaRegionMap() {
  const regions = useRegionalStats();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const cardBg = "bg-white/95 border-gray-300 shadow-md shadow-gray-200/50";
  const glowEffect = "bg-emerald-600/10";

  const renderRegionCard = (name: string, colClasses: string) => {
    const data = regions[name];
    if (!data) return null;
    
    const isSelected = selectedRegion === name;
    const dom = data.dominantCluster;
    const hasData = data.total > 0;

    return (
      <div 
        className={`${colClasses} flex items-center justify-center`}
        onClick={() => setSelectedRegion(isSelected ? null : name)}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative w-full h-full min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer border-2 transition-all duration-300
            ${isSelected ? 'ring-4 ring-emerald-500/30 scale-105 z-10' : 'hover:shadow-lg'}
            ${hasData ? CLUSTER_COLORS[dom] : CLUSTER_COLORS[0]}
          `}
        >
          {hasData && (
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full shadow-lg border-2 border-white animate-pulse ${DOT_COLORS[dom]}`} />
          )}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">{name}</span>
          {hasData ? (
            <span className="text-[10px] sm:text-xs font-medium opacity-80">Dominan: K{dom}</span>
          ) : (
             <span className="text-[10px] sm:text-xs font-medium opacity-60">Belum ada data</span>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className={`shadow-sm backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-lg border ${cardBg} h-full flex flex-col`}
    >
      <div className={`absolute top-0 left-0 w-64 h-64 ${glowEffect} blur-[80px] rounded-full pointer-events-none`} />
      
      <div className="relative z-10 flex flex-col h-full items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2 text-gray-900">
            <MapPin className="w-5 h-5 text-emerald-500" /> Peta Dominasi Wilayah
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">Surabaya</span>
        </div>
        
        <p className="text-xs text-gray-600 mb-6 text-center">Klik pada wilayah untuk melihat rincian jumlah responden tiap klaster.</p>

        {/* Abstract Map Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-3 sm:gap-4 w-full max-w-[320px] mx-auto flex-1 mb-8">
          {renderRegionCard("Utara", "col-start-2 row-start-1")}
          {renderRegionCard("Barat", "col-start-1 row-start-2")}
          {renderRegionCard("Pusat", "col-start-2 row-start-2")}
          {renderRegionCard("Timur", "col-start-3 row-start-2")}
          {renderRegionCard("Selatan", "col-start-2 row-start-3")}
        </div>

        {/* Selected Region Details Popover / Banner */}
        <AnimatePresence mode="wait">
          {selectedRegion && regions[selectedRegion] && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative shadow-inner">
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-sm text-gray-800 mb-3 border-b border-gray-200 pb-2">Rincian Wilayah {selectedRegion}</h4>
                
                {regions[selectedRegion].total > 0 ? (
                  <>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[1, 2, 3, 4].map(k => {
                        const count = regions[selectedRegion].clusterCounts[k - 1];
                        return (
                          <div key={k} className="bg-white border border-gray-100 rounded-lg p-2 text-center shadow-sm">
                            <div className="text-[10px] font-bold text-gray-500 mb-0.5">K {k}</div>
                            <div className={`text-sm md:text-base font-black ${count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{count}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-center text-gray-500">
                      Total Responden di {selectedRegion}: <span className="font-bold text-gray-700">{regions[selectedRegion].total}</span>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">Belum ada data responden dari area ini.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
