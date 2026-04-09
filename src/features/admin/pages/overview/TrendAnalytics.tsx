import { useState, useMemo } from "react";
import { ArrowLeft, TrendingUp, Calendar, MapPin, Filter } from "lucide-react";
import { Link, useLocation } from "react-router";
import { AdminLayout } from "../../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";
import { useTrendAnalytics, TimeFilter } from "../../hooks/useTrendAnalytics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getUsers } from "../../../../services/StorageService";

const CLUSTER_COLORS = {
  k1: "#3b82f6",
  k2: "#8b5cf6",
  k3: "#d946ef",
  k4: "#ec4899",
};

export default function TrendAnalytics() {
  const { filters, setFilters, trendData, compareTrendData, aggregateValue, compareAggregateValue } = useTrendAnalytics();
  const location = useLocation() as any;

  // Derive available options from real data
  const { allKecamatan, allKelurahanByKecamatan } = useMemo(() => {
    const users = getUsers();
    const kecs = new Set<string>();
    const kelMap: Record<string, Set<string>> = {};

    users.forEach((u: any) => {
      if (u.kecamatanKtp) {
        kecs.add(u.kecamatanKtp);
        if (!kelMap[u.kecamatanKtp]) kelMap[u.kecamatanKtp] = new Set();
        if (u.kelurahanKtp) kelMap[u.kecamatanKtp].add(u.kelurahanKtp);
      }
    });

    return { 
      allKecamatan: Array.from(kecs).sort(), 
      allKelurahanByKecamatan: (kec: string) => kelMap[kec] ? Array.from(kelMap[kec]).sort() : [] 
    };
  }, []);

  const bgCard = "bg-white/95 border-gray-300 shadow-md";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";

  return (
    <AdminLayout title="Trend Analysis" headerIcon={<TrendingUp className="w-4 h-4" />}>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to="/admin/analytics" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Analytics Utama
        </Link>
        <h1 className={`text-2xl font-bold flex items-center gap-3 ${textPrimary}`}>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
            <TrendingUp className="w-6 h-6 shadow-inner" />
          </div>
          Analisis Tren Klaster
        </h1>
        <p className={`mt-1 ${textSecondary}`}>Perkembangan komposisi GAKIN dari waktu ke waktu berdasarkan filter geografis.</p>
      </motion.div>

      {/* FILTER PANEL */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-5 rounded-2xl border mb-6 ${bgCard}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-gray-800 text-sm">Filter Spesifik</h3>
          </div>
          <button 
            onClick={() => setFilters({ ...filters, isComparing: !filters.isComparing })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filters.isComparing ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {filters.isComparing ? "Tutup Perbandingan" : "+ Bandingkan Tren"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Filter Settings (Shared) */}
          <div className="space-y-3">
             <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Grouping Waktu</label>
              <div className="shadow-sm backdrop-blur-md rounded-2xl p-1.5 flex items-center gap-1 border relative overflow-hidden bg-white/95 border-gray-300">
                {(["mingguan", "bulanan", "tahunan"] as TimeFilter[]).map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setFilters({ ...filters, timeFilter: t })} 
                    className={`relative flex-1 px-4 py-2 text-xs font-bold capitalize transition-colors duration-300 z-10 ${
                      filters.timeFilter === t ? 'text-blue-700' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {filters.timeFilter === t && (
                      <>
                        <motion.div
                          layoutId="active-time-filter"
                          className="absolute inset-0 bg-blue-100/60 backdrop-blur-md border border-blue-200/50 rounded-xl shadow-inner shadow-blue-500/10"
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        {/* Bubbles / Liquid effect */}
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
                        >
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute bg-blue-400/20 rounded-full blur-[1px]"
                              style={{ 
                                width: Math.random() * 6 + 4, 
                                height: Math.random() * 6 + 4,
                                left: `${10 + Math.random() * 80}%`,
                                bottom: '-10%'
                              }}
                              animate={{ 
                                y: [-10, -50], 
                                x: [0, (Math.random() - 0.5) * 20],
                                opacity: [0, 0.8, 0],
                                scale: [0.5, 1.2, 0.8]
                              }}
                              transition={{ 
                                duration: 2 + Math.random() * 2, 
                                repeat: Infinity, 
                                delay: Math.random() * 2,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </motion.div>
                      </>
                    )}
                    <span className="relative z-10">{t}</span>
                  </button>
                ))}
              </div>
             
             <div className="flex gap-2 items-center mt-2">
               <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-gray-200 text-gray-700 bg-gray-50" />
               <span className="text-xs text-gray-400">-</span>
               <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-gray-200 text-gray-700 bg-gray-50" />
             </div>
          </div>
          
          <div className="hidden lg:block"></div>

          {/* Geo Filters 1 */}
          <div className="space-y-3 p-4 rounded-xl border bg-gray-50/50">
             <label className="text-xs font-bold text-blue-600 mb-1 block">Area Utama</label>
             <select value={filters.region} onChange={e => setFilters({...filters, region: e.target.value, kecamatan: "", kelurahan: ""})} className="w-full text-sm p-2 rounded-lg border border-gray-200 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
               <option value="">Semua Area Surabaya</option>
               <option value="SURABAYA PUSAT">Surabaya Pusat</option>
               <option value="SURABAYA TIMUR">Surabaya Timur</option>
               <option value="SURABAYA BARAT">Surabaya Barat</option>
               <option value="SURABAYA UTARA">Surabaya Utara</option>
               <option value="SURABAYA SELATAN">Surabaya Selatan</option>
             </select>

             <select value={filters.kecamatan} onChange={e => setFilters({...filters, kecamatan: e.target.value, kelurahan: ""})} className="w-full text-sm p-2 rounded-lg border border-gray-200 text-gray-700 bg-white disabled:opacity-50">
               <option value="">Semua Kecamatan</option>
               {allKecamatan.map(k => <option key={k} value={k}>{k}</option>)}
             </select>
             
             <select value={filters.kelurahan} onChange={e => setFilters({...filters, kelurahan: e.target.value})} disabled={!filters.kecamatan} className="w-full text-sm p-2 rounded-lg border border-gray-200 text-gray-700 bg-white disabled:opacity-50">
               <option value="">Semua Kelurahan</option>
               {filters.kecamatan && allKelurahanByKecamatan(filters.kecamatan).map(k => <option key={k} value={k}>{k}</option>)}
             </select>
          </div>

          {/* Geo Filters 2 */}
          {filters.isComparing && (
            <div className="space-y-3 p-4 rounded-xl border bg-purple-50/30 border-purple-100">
               <label className="text-xs font-bold text-purple-600 mb-1 block">Area Pembanding</label>
               <select value={filters.compareRegion} onChange={e => setFilters({...filters, compareRegion: e.target.value, compareKecamatan: "", compareKelurahan: ""})} className="w-full text-sm p-2 rounded-lg border border-purple-200 text-gray-700 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                 <option value="">Semua Area Surabaya</option>
                 <option value="SURABAYA PUSAT">Surabaya Pusat</option>
                 <option value="SURABAYA TIMUR">Surabaya Timur</option>
                 <option value="SURABAYA BARAT">Surabaya Barat</option>
                 <option value="SURABAYA UTARA">Surabaya Utara</option>
                 <option value="SURABAYA SELATAN">Surabaya Selatan</option>
               </select>
  
               <select value={filters.compareKecamatan} onChange={e => setFilters({...filters, compareKecamatan: e.target.value, compareKelurahan: ""})} className="w-full text-sm p-2 rounded-lg border border-purple-200 text-gray-700 bg-white disabled:opacity-50">
                 <option value="">Semua Kecamatan</option>
                 {allKecamatan.map(k => <option key={k} value={k}>{k}</option>)}
               </select>
               
               <select value={filters.compareKelurahan} onChange={e => setFilters({...filters, compareKelurahan: e.target.value})} disabled={!filters.compareKecamatan} className="w-full text-sm p-2 rounded-lg border border-purple-200 text-gray-700 bg-white disabled:opacity-50">
                 <option value="">Semua Kelurahan</option>
                 {filters.compareKecamatan && allKelurahanByKecamatan(filters.compareKecamatan).map(k => <option key={k} value={k}>{k}</option>)}
               </select>
            </div>
          )}

          <div className="lg:col-span-2">
            <button 
              onClick={() => setFilters({timeFilter: "bulanan", startDate: "", endDate: "", region: "", kecamatan: "", kelurahan: "", isComparing: false, compareRegion: "", compareKecamatan: "", compareKelurahan: ""})}
              className="w-full py-2 rounded-lg border border-red-200 text-red-600 font-medium text-xs hover:bg-red-50 transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      </motion.div>

      {/* CHARTS CONTAINER */}
      <div className={`grid grid-cols-1 ${filters.isComparing ? 'xl:grid-cols-2' : ''} gap-6`}>

        {/* CHART 1: KLASTER UTAMA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-2xl border ${bgCard}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
             <div>
               <h3 className="font-bold text-gray-900 text-lg">Pertumbuhan Klaster {filters.isComparing ? "(Utama)" : ""}</h3>
               <p className="text-sm text-gray-500">Area: {filters.kelurahan || filters.kecamatan || filters.region || "Semua Area"}</p>
             </div>
             
             <div className="flex gap-4 mt-4 sm:mt-0">
               <div className="text-center px-3 border-r border-gray-200">
                 <span className="block text-[10px] text-gray-500 uppercase font-black">Kls 1 / Kls 2</span>
                 <span className="text-sm font-bold text-gray-800">{aggregateValue.k1} / {aggregateValue.k2}</span>
               </div>
               <div className="text-center px-3">
                 <span className="block text-[10px] text-gray-500 uppercase font-black">Kls 3 / Kls 4</span>
                 <span className="text-sm font-bold text-gray-800">{aggregateValue.k3} / {aggregateValue.k4}</span>
               </div>
             </div>
          </div>

          <div className="h-[350px] w-full">
            {trendData.length > 0 ? (
              <motion.div 
                key={`${filters.timeFilter}-${filters.region}-${filters.kecamatan}-${filters.kelurahan}`}
                initial={{ clipPath: "inset(0 100% 0 0)" }} 
                animate={{ clipPath: "inset(0 0% 0 0)" }} 
                transition={{ duration: 1.2, ease: "easeOut" }} 
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {[1, 2, 3, 4].map((k) => (
                        <linearGradient key={`colorK${k}`} id={`colorK${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CLUSTER_COLORS[`k${k}` as keyof typeof CLUSTER_COLORS]} stopOpacity={0.5}/>
                          <stop offset="95%" stopColor={CLUSTER_COLORS[`k${k}` as keyof typeof CLUSTER_COLORS]} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                    <XAxis dataKey="label" fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Legend iconType="circle" />
                    
                    <Area isAnimationActive={false} type="monotone" dataKey="klaster4" name="Klaster 4" stroke={CLUSTER_COLORS.k4} fillOpacity={1} fill="url(#colorK4)" strokeWidth={2} />
                    <Area isAnimationActive={false} type="monotone" dataKey="klaster3" name="Klaster 3" stroke={CLUSTER_COLORS.k3} fillOpacity={1} fill="url(#colorK3)" strokeWidth={2} />
                    <Area isAnimationActive={false} type="monotone" dataKey="klaster2" name="Klaster 2" stroke={CLUSTER_COLORS.k2} fillOpacity={1} fill="url(#colorK2)" strokeWidth={2} />
                    <Area isAnimationActive={false} type="monotone" dataKey="klaster1" name="Klaster 1" stroke={CLUSTER_COLORS.k1} fillOpacity={1} fill="url(#colorK1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                 <Filter className="w-8 h-8 mb-2 opacity-50" />
                 <p className="text-sm font-medium">Tidak ada data tren klaster.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* CHART 2: KLASTER PEMBANDING */}
        {filters.isComparing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-6 rounded-2xl border ${bgCard} border-purple-200`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
               <div>
                 <h3 className="font-bold text-gray-900 text-lg">Pertumbuhan Klaster (Pembanding)</h3>
                 <p className="text-sm text-gray-500">Area: {filters.compareKelurahan || filters.compareKecamatan || filters.compareRegion || "Semua Area"}</p>
               </div>

               <div className="flex gap-4 mt-4 sm:mt-0">
                 <div className="text-center px-3 border-r border-gray-200">
                   <span className="block text-[10px] text-gray-500 uppercase font-black">Kls 1 / Kls 2</span>
                   <span className="text-sm font-bold text-gray-800">{compareAggregateValue.k1} / {compareAggregateValue.k2}</span>
                 </div>
                 <div className="text-center px-3">
                   <span className="block text-[10px] text-gray-500 uppercase font-black">Kls 3 / Kls 4</span>
                   <span className="text-sm font-bold text-gray-800">{compareAggregateValue.k3} / {compareAggregateValue.k4}</span>
                 </div>
               </div>
            </div>

            <div className="h-[350px] w-full">
              {compareTrendData.length > 0 ? (
                <motion.div 
                  key={`${filters.timeFilter}-${filters.compareRegion}-${filters.compareKecamatan}-${filters.compareKelurahan}`}
                  initial={{ clipPath: "inset(0 100% 0 0)" }} 
                  animate={{ clipPath: "inset(0 0% 0 0)" }} 
                  transition={{ duration: 1.2, ease: "easeOut" }} 
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={compareTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        {[1, 2, 3, 4].map((k) => (
                          <linearGradient key={`colorC${k}`} id={`colorC${k}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CLUSTER_COLORS[`k${k}` as keyof typeof CLUSTER_COLORS]} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={CLUSTER_COLORS[`k${k}` as keyof typeof CLUSTER_COLORS]} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                      <XAxis dataKey="label" fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} stroke="#6b7280" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                      <Legend iconType="circle" />
                      
                      <Area isAnimationActive={false} type="monotone" dataKey="klaster4" name="Klaster 4" stroke={CLUSTER_COLORS.k4} fillOpacity={1} fill="url(#colorC4)" strokeWidth={2} />
                      <Area isAnimationActive={false} type="monotone" dataKey="klaster3" name="Klaster 3" stroke={CLUSTER_COLORS.k3} fillOpacity={1} fill="url(#colorC3)" strokeWidth={2} />
                      <Area isAnimationActive={false} type="monotone" dataKey="klaster2" name="Klaster 2" stroke={CLUSTER_COLORS.k2} fillOpacity={1} fill="url(#colorC2)" strokeWidth={2} />
                      <Area isAnimationActive={false} type="monotone" dataKey="klaster1" name="Klaster 1" stroke={CLUSTER_COLORS.k1} fillOpacity={1} fill="url(#colorC1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                   <Filter className="w-8 h-8 mb-2 opacity-50" />
                   <p className="text-sm font-medium">Tidak ada data tren klaster pembanding.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </AdminLayout>
  );
}
