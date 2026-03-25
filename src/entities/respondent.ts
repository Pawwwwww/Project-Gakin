// ═══════════════════════════════════════════════════════════════
//  RESPONDENT ENTITIES
//  Semua konstanta kuesioner dan tipe data responden
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────────
export interface KuesionerData {
  consent: boolean;
  grit: Record<number, number>;
  kwu: Record<number, number>;
  tipi: Record<number, number>;
}

export type TIPIAspect = "extraversion" | "agreeableness" | "conscientiousness" | "neuroticism" | "openness";

export const KUESIONER_INITIAL: KuesionerData = {
  consent: false,
  grit: {},
  kwu: {},
  tipi: {},
};

// ── GRIT ─────────────────────────────────────────────────────────────
export const GRIT_QUESTIONS = [
  { id: 1,  text: "Saya mampu mengatasi hambatan untuk menyelesaikan tantangan yang sulit.", fav: true },
  { id: 2,  text: "Kadang-kadang ide-ide baru membuat saya kehilangan fokus pada kegiatan yang sedang dikerjakan.", fav: false },
  { id: 3,  text: "Minat saya berubah dari tahun ke tahun.", fav: false },
  { id: 4,  text: "Hambatan tidak membuat saya berkecil hati.", fav: true },
  { id: 5,  text: "Saya pernah terobsesi dengan ide atau kegiatan tertentu untuk waktu singkat tetapi kemudian kehilangan minat untuk hal itu.", fav: false },
  { id: 6,  text: "Saya seorang pekerja keras.", fav: true },
  { id: 7,  text: "Saya sering menetapkan suatu tujuan tetapi kemudian memilih untuk mengejar tujuan yang berbeda.", fav: false },
  { id: 8,  text: "Saya sulit untuk tetap fokus pada kegiatan yang memerlukan waktu lebih dari beberapa bulan untuk diselesaikan.", fav: false },
  { id: 9,  text: "Saya menyelesaikan apa pun yang saya mulai.", fav: true },
  { id: 10, text: "Saya pernah mencapai tujuan yang memerlukan kerja keras bertahun-tahun.", fav: true },
  { id: 11, text: "Saya tertarik pada hal-hal baru setiap beberapa bulan.", fav: false },
  { id: 12, text: "Saya adalah orang yang rajin.", fav: true },
];

export const GRIT_LABELS = [
  "Tidak\nSesuai",
  "Kurang\nSesuai",
  "Agak\nSesuai",
  "Cukup\nSesuai",
  "Sangat\nSesuai",
];

// ── KWU ──────────────────────────────────────────────────────────────
export interface KWUItem {
  id: number;
  aspek: string;
  aspekEn: string;
  kategori: string;
  options: [string, string, string, string];
}

export const KWU_ITEMS: KWUItem[] = [
  {
    id: 1, aspek: "Mengenali Peluang", aspekEn: "Spotting opportunities", kategori: "Ideas and Opportunities",
    options: [
      "Saya tidak pernah punya ide usaha/bisnis.",
      "Saya sulit menemukan ide usaha/bisnis.",
      "Saya memiliki ide usaha/bisnis yang menarik.",
      "Saya selalu dapat mendapatkan ide usaha/bisnis baru dan menarik.",
    ],
  },
  {
    id: 2, aspek: "Kreativitas", aspekEn: "Creativity", kategori: "Ideas and Opportunities",
    options: [
      "Saya tidak tahu apa yang harus saya kerjakan untuk menambah penghasilan.",
      "Saya lebih suka pekerjaan yang mudah dikerjakan.",
      "Saya senang bekerja yang mengharuskan saya belajar hal-hal yang baru.",
      "Saya lebih suka mengerjakan pekerjaan yang sulit dan menantang.",
    ],
  },
  {
    id: 3, aspek: "Visi", aspekEn: "Vision", kategori: "Ideas and Opportunities",
    options: [
      "Saya bekerja apa saja yang penting tidak menganggur.",
      "Bagi saya tidak penting bekerja apa, yang penting tetap mendapatkan upah.",
      "Saya bekerja sekarang ini supaya usaha saya lebih berkembang.",
      "Saya sekarang bekerja untuk membuat usaha/bisnis saya lebih besar dan maju.",
    ],
  },
  {
    id: 4, aspek: "Menghargai Ide", aspekEn: "Valuing ideas", kategori: "Ideas and Opportunities",
    options: [
      "Saya tidak memiliki ide usaha.",
      "Saya hanya melakukan pekerjaan yang biasa saya kerjakan.",
      "Keberhasilan usaha/bisnis ditentukan pada kemampuan merencanakan pekerjaan.",
      "Satu usaha/bisnis akan berkembang jika kita selalu menemukan ide-ide baru.",
    ],
  },
  {
    id: 5, aspek: "Berpikir Etis & Berkelanjutan", aspekEn: "Ethical and sustainable thinking", kategori: "Ideas and Opportunities",
    options: [
      "Bagi saya yang penting bekerja dapat uang, saya tidak peduli pekerjaannya baik atau tidak.",
      "Saya tetap mengerjakan pekerjaan meskipun hanya sedikit orang yang mengerjakannya.",
      "Saya hanya bekerja jika tahu pekerjaannya baik.",
      "Saya hanya bekerja dan mengerjakan pekerjaan yang saya pastikan baik.",
    ],
  },
  {
    id: 6, aspek: "Kesadaran Diri & Efikasi Diri", aspekEn: "Self-awareness and self-efficacy", kategori: "Resources",
    options: [
      "Saya pasti gagal kalau berusaha/berbisnis sendiri.",
      "Saya ingin mulai berusaha/berbisnis sendiri meski saya tidak yakin berhasil.",
      "Saya yakin saya dapat memulai usaha/bisnis saya sendiri.",
      "Saya yakin akan berhasil jika mulai membuka usaha/bisnis.",
    ],
  },
  {
    id: 7, aspek: "Motivasi & Ketekunan", aspekEn: "Motivation and perseverance", kategori: "Resources",
    options: [
      "Saya tidak ingin usaha/bisnis sendiri.",
      "Saya bertekad harus punya usaha/bisnis sendiri.",
      "Saya sedang mengumpulkan modal untuk memulai usaha/bisnis sendiri.",
      "Saya akan memulai usaha/bisnis tahun ini.",
    ],
  },
  {
    id: 8, aspek: "Memobilisasi Sumber Daya", aspekEn: "Mobilizing resources", kategori: "Resources",
    options: [
      "Saya tidak tahu bagaimana mencari modal usaha.",
      "Saya punya modal ketrampilan yang sesuai dengan usaha saya.",
      "Saya punya pembantu/asisten dalam bekerja.",
      "Saya punya teman/kenalan dan jaringan terkait usaha/bisnis saya.",
    ],
  },
  {
    id: 9, aspek: "Literasi Keuangan", aspekEn: "Financial and economic literacy", kategori: "Resources",
    options: [
      "Saya tidak tahu bagaimana melakukan pencatatan keuangan dalam usaha/bisnis.",
      "Saya mengetahui cara mencatat pendapatan dan pengeluaran dalam usaha/bisnis.",
      "Saya selalu mencatat pendapatan dan pengeluaran keuangan usaha dalam buku.",
      "Saya menggunakan aplikasi/software untuk pembukuan usaha/bisnis.",
    ],
  },
  {
    id: 10, aspek: "Memobilisasi Orang Lain", aspekEn: "Mobilizing others", kategori: "Resources",
    options: [
      "Saya tidak memiliki teman untuk mendiskusikan ide usaha.",
      "Saya memiliki teman untuk mendiskusikan ide usaha.",
      "Saya mendiskusikan ide-ide usaha dengan teman yang memiliki usaha/bisnis.",
      "Saya ikut dalam perkumpulan/organisasi pelaku usaha yang sama dengan usaha saya.",
    ],
  },
  {
    id: 11, aspek: "Berani Mengambil Inisiatif", aspekEn: "Taking the initiative", kategori: "Into Action",
    options: [
      "Saya takut berusaha/berbisnis karena kalau usaha gagal saya akan menanggung rugi.",
      "Saya sedang mematangkan ide usaha/bisnis.",
      "Saya sedang mencari masukan/pendapat untuk persiapan memulai usaha/bisnis saya.",
      "Saya sedang mengumpulkan modal dan peralatan untuk memulai usaha/bisnis yang sudah saya rencanakan dalam waktu dekat.",
    ],
  },
  {
    id: 12, aspek: "Perencanaan & Manajemen", aspekEn: "Planning and management", kategori: "Into Action",
    options: [
      "Saya tidak membutuhkan persiapan dan perencanaan dalam bekerja.",
      "Saya melakukan persiapan sekadarnya untuk memulai pekerjaan.",
      "Saya akan menyiapkan modal minimal untuk kebutuhan usaha/bisnis selama dua minggu.",
      "Saya akan menyiapkan modal minimal untuk kebutuhan usaha/bisnis selama 1–3 bulan.",
    ],
  },
  {
    id: 13, aspek: "Mengelola Ketidakpastian & Risiko", aspekEn: "Coping with uncertainty, ambiguity, and risk", kategori: "Into Action",
    options: [
      "Saya tidak tahu harus bekerja apa dalam situasi ekonomi sulit seperti sekarang ini.",
      "Saya mencari peluang usaha/bisnis meski kondisi usaha/bisnis sedang sepi seperti sekarang.",
      "Saya berusaha memperbaiki usaha/bisnis karena kondisi usaha/bisnis sedang sepi seperti sekarang.",
      "Saya memperbaiki aspek usaha/bisnis yang kurang baik.",
    ],
  },
  {
    id: 14, aspek: "Bekerja dengan Orang Lain", aspekEn: "Working with others", kategori: "Into Action",
    options: [
      "Saya tidak mau bekerja dengan orang lain karena orang lain tidak bisa dipercaya.",
      "Saya memiliki seorang pembantu/asisten/tim dalam menjalankan usaha/bisnis.",
      "Saya memiliki beberapa pembantu/asisten/tim dalam menjalankan usaha/bisnis.",
      "Saya memiliki beberapa pembantu/asisten/tim yang handal dalam menjalankan usaha/bisnis.",
    ],
  },
  {
    id: 15, aspek: "Belajar dari Pengalaman", aspekEn: "Learning through experience", kategori: "Into Action",
    options: [
      "Saya tidak memiliki keahlian dari pengalaman kerja sebelumnya.",
      "Saya hanya mampu mengerjakan pekerjaan yang biasa saya kerjakan.",
      "Saya cukup ahli mengerjakan pekerjaan yang biasa saya kerjakan.",
      "Saya mampu belajar dan meningkatkan kemampuan kerja dari pekerjaan yang saya kerjakan.",
    ],
  },
];

export const KWU_GROUPS = ["Ideas and Opportunities", "Resources", "Into Action"];

export const KWU_GROUP_LABELS: Record<string, string> = {
  "Ideas and Opportunities": "Ide dan Peluang",
  Resources: "Sumber Daya",
  "Into Action": "Aksi Nyata",
};

export const KWU_GROUP_COLORS: Record<string, string> = {
  "Ideas and Opportunities": "from-purple-800 to-purple-700",
  Resources: "from-purple-600 to-purple-500",
  "Into Action": "from-purple-400 to-purple-300",
};

// ── TIPI ─────────────────────────────────────────────────────────────
export const TIPI_QUESTIONS = [
  { id: 1,  text: "Ekstrovert (Mudah Bergaul), antusias" },
  { id: 2,  text: "Suka mengkritik, suka bertengkar" },
  { id: 3,  text: "Dapat dipercaya, dapat mengendalikan diri" },
  { id: 4,  text: "Cemas, mudah marah" },
  { id: 5,  text: "Terbuka pada pengalaman baru, rumit" },
  { id: 6,  text: "Kalem, pendiam" },
  { id: 7,  text: "Bersikap simpati, hangat" },
  { id: 8,  text: "Tidak sistematis, kurang berhati-hati" },
  { id: 9,  text: "Tenang, stabil secara emosi" },
  { id: 10, text: "Kuno, kurang kreatif" },
];

export const TIPI_LABELS = [
  "Sangat Tidak Setuju",
  "Tidak Setuju",
  "Agak Tidak Setuju",
  "Netral",
  "Agak Setuju",
  "Setuju",
  "Sangat Sesuai",
];

export const TIPI_ASPECT_LABELS: Record<TIPIAspect, string> = {
  extraversion:     "Extraversion (Ekstroversi)",
  agreeableness:    "Agreeableness (Keramahan)",
  conscientiousness: "Conscientiousness (Kehati-hatian)",
  neuroticism:      "Neuroticism (Neurotisisme)",
  openness:         "Openness (Keterbukaan)",
};

export const TIPI_CATEGORY_META: Record<string, { color: string; bg: string }> = {
  "Rendah":         { color: "text-red-700",    bg: "bg-red-50 border-red-200" },
  "Dibawah Rerata": { color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  "Rerata":         { color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  "Diatas Rerata":  { color: "text-teal-700",   bg: "bg-teal-50 border-teal-200" },
  "Tinggi":         { color: "text-green-700",  bg: "bg-green-50 border-green-200" },
};

export const TIPI_THRESHOLDS: Record<TIPIAspect, [number, number, number, number]> = {
  extraversion:      [4.8,  6.4,  9.6,  11.2],
  agreeableness:     [7.0,  8.2,  10.6, 11.8],
  conscientiousness: [6.4,  7.8,  10.0, 12.0],
  neuroticism:       [5.8,  7.2,  10.2, 11.6],
  openness:          [8.8,  9.9,  12.1, 13.2],
};

export const TIPI_DESCRIPTIONS: Record<TIPIAspect, Record<string, string>> = {
  extraversion: {
    "Rendah":         "Sangat tertutup, lebih suka waktu sendiri atau dengan orang terdekat.",
    "Dibawah Rerata": "Cenderung tenang, butuh waktu untuk bersosialisasi.",
    "Rerata":         "Bisa bersosialisasi namun butuh waktu sendiri untuk mengisi energi.",
    "Diatas Rerata":  "Aktif, mudah bergaul, mendapat energi saat bersama banyak orang.",
    "Tinggi":         "Sangat antusias, mudah berinteraksi dalam kelompok besar, suka tampil.",
  },
  agreeableness: {
    "Rendah":         "Kritis, rasional, kompetitif, dan tidak segan beradu argumen.",
    "Dibawah Rerata": "Mengutamakan objektivitas dibanding menjaga perasaan orang.",
    "Rerata":         "Mampu bersikap hangat sekaligus tegas jika dibutuhkan.",
    "Diatas Rerata":  "Empatis, mudah diajak kerjasama, menjaga hubungan baik.",
    "Tinggi":         "Sangat simpatik, ingin membantu orang lain dan menghindari konflik.",
  },
  conscientiousness: {
    "Rendah":         "Spontan, tidak teratur, sering bertindak tanpa rencana.",
    "Dibawah Rerata": "Lebih suka fleksibilitas, kadang kurang teliti atau kurang disiplin.",
    "Rerata":         "Cukup terorganisir namun toleran untuk bekerja secara spontan.",
    "Diatas Rerata":  "Terstruktur, dapat diandalkan, disiplin, dan memiliki target.",
    "Tinggi":         "Sangat terorganisir, teliti, disiplin tinggi, berorientasi besar pada tujuan.",
  },
  neuroticism: {
    "Rendah":         "Sangat tenang, stabil, santai, dan tahan banting terhadap stres.",
    "Dibawah Rerata": "Jarang cemas dan mampu mengendalikan emosi dengan sangat baik.",
    "Rerata":         "Kestabilan emosi baik, sesekali cemas pada situasi menantang.",
    "Diatas Rerata":  "Mudah cemas, meragukan diri sendiri, atau stres di bawah tekanan.",
    "Tinggi":         "Sangat sensitif terhadap stres, mood mudah berubah, dan rawan panik.",
  },
  openness: {
    "Rendah":         "Konvensional, menyukai rutinitas dan hal-hal yang sudah pasti/terbukti.",
    "Dibawah Rerata": "Fokus pada penyelesaian praktis, kurang suka hal yang abstrak.",
    "Rerata":         "Menerima ide baru namun butuh landasan nyata atau bukti.",
    "Diatas Rerata":  "Kreatif, imajinatif, menyukai tantangan intelektual dan variasi.",
    "Tinggi":         "Sangat inovatif, visioner, haus akan eksplorasi ide dan pengalaman baru.",
  },
};

// ── Cluster Info ──────────────────────────────────────────────────────
export const KLUSTER_INFO: Record<number, { title: string; subtitle: string; color: string; bg: string; border: string; desc: string }> = {
  1: {
    title: "Cluster 1", subtitle: "Membutuhkan Dukungan Keterampilan dan Motivasi",
    color: "text-blue-800", bg: "bg-blue-50", border: "border-blue-300",
    desc: "Menunjukkan penguatan ketekunan (GRIT), kedisiplinan dalam aktivitas sehari-hari, serta pembiasaan kerja yang produktif untuk mendukung perkembangan diri secara bertahap.",
  },
  2: {
    title: "Cluster 2", subtitle: "Membutuhkan Dukungan Keterampilan",
    color: "text-green-800", bg: "bg-green-50", border: "border-green-300",
    desc: "Menunjukkan keterampilan dasar yang baik serta potensi untuk terus berkembang melalui peningkatan keterampilan praktis dan konsistensi dalam aktivitas kerja.",
  },
  3: {
    title: "Cluster 3", subtitle: "Siap Bermitra",
    color: "text-yellow-800", bg: "bg-yellow-50", border: "border-yellow-300",
    desc: "Menunjukkan kesiapan untuk berkolaborasi serta berkembang bersama mitra dalam menjalankan kegiatan usaha.",
  },
  4: {
    title: "Cluster 4", subtitle: "Siap Berwirausaha",
    color: "text-green-800", bg: "bg-green-50", border: "border-green-300",
    desc: "Menunjukkan kesiapan untuk mengelola dan menjalankan usaha secara mandiri.",
  },
};

// Alias untuk ResultScreen (nama berbeda di file lama)
export const KLUSTER_INFO_RESULT = KLUSTER_INFO;
