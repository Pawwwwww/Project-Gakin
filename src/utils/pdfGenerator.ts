import jsPDF from "jspdf";
import { UserRecord, KuesionerSubmission } from "../services/StorageService";
import { calcFullScore, getTIPICategoryLabel, calcTIPIAspects } from "../services/ScoringService";
import { 
  KLUSTER_INFO, GRIT_QUESTIONS, KWU_ITEMS, TIPI_QUESTIONS, 
  TIPI_DESCRIPTIONS, TIPIAspect 
} from "../entities/respondent";

export const generateRaporPDF = async (completeUser: UserRecord, kuesionerResult: KuesionerSubmission) => {
  const scoring = calcFullScore(kuesionerResult.data);
  const klusterInfo = KLUSTER_INFO[scoring.kluster] || KLUSTER_INFO[1];
  
  // Ambil gambar untuk watermark & Kop Surat secara dinamis dari assets
  let bridaLogoB64 = "";
  let banggaLogoB64 = "";

  const fetchImageToB64 = async (url: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Gagal meload image:", url, e);
      return "";
    }
  };

  [bridaLogoB64, banggaLogoB64] = await Promise.all([
    fetchImageToB64("/assets/images/brida-logo-watermark.png"),
    fetchImageToB64("/assets/images/Bangga Logo.png")
  ]);

  // Format Tanggal Lahir (DD-MM-YYYY)
  const ttlDate = new Date(completeUser.tanggalLahir);
  const formattedTTL = !isNaN(ttlDate.getTime()) 
    ? `${ttlDate.getDate().toString().padStart(2, '0')}-${(ttlDate.getMonth() + 1).toString().padStart(2, '0')}-${ttlDate.getFullYear()}`
    : completeUser.tanggalLahir;

  const pdf = new jsPDF("p", "pt", "a4");
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 50;
  const col1 = margin;
  const col2 = margin + 170; // Lebarkan sedikit jarak label ke value
  let y = margin;

  const addWatermark = () => {
    // Tambahkan watermark logo BRIDA di tengah halaman dengan transparansi
    pdf.saveGraphicsState();
    // Gunakan any untuk memotong error tipe bawaan jspdf yang tidak memiliki construct signature public
    pdf.setGState(new (pdf.GState as any)({ opacity: 0.15 }));
    const logoSize = 500;
    const xPos = (W - logoSize) / 2;
    const yPos = (H - logoSize) / 2;
    if (bridaLogoB64) {
      pdf.addImage(bridaLogoB64, 'PNG', xPos, yPos, logoSize, logoSize);
    }
    pdf.restoreGraphicsState();
  };

  const currentYear = new Date(kuesionerResult.tanggal).getFullYear();
  const addFooter = () => {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Badan Riset dan Inovasi ${currentYear}`, W / 2, H - 20, { align: "center" });
  };

  const drawPageBackgrounds = () => {
    addWatermark();
    addFooter();
  };

  // Latar belakang dan footer untuk halaman pertama
  drawPageBackgrounds();

  const checkPage = (needed = 20) => {
    if (y + needed > H - 40) { // Beri ruang untuk footer
      pdf.addPage();
      drawPageBackgrounds(); // Tambahkan watermark & footer setiap ganti halaman
      y = margin;
      return true;
    }
    return false;
  };

  const drawLine = () => {
    pdf.setDrawColor(180);
    pdf.line(col1, y, W - margin, y);
    y += 8;
  };

  const row = (label: string, value: string, indent = 0) => {
    if (!value) return; // Skip if empty
    checkPage(16);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.text(label, col1 + indent, y);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(30, 30, 30);
    const lines = pdf.splitTextToSize(value, W - margin - col2 + margin - indent);
    pdf.text(":", col2 - 10, y);
    pdf.text(lines, col2, y);
    
    // Beri jarak antar baris row lebih lega (+6 pt)
    y += Math.max(20, lines.length * 14 + 6);
  };

  const rowSeparator = () => {
    y += 6; // Extra breathing room
  };

  // ── HEADER / KOP SURAT ──
  // BRIDA Logo (Kiri)
  if (bridaLogoB64) {
    pdf.addImage(bridaLogoB64, 'PNG', margin, y, 50, 50);
  }
  
  // Teks Kop
  // Karena logo Bangga di kanan lebih lebar, kita geser sedikit origin text ke kiri agar secara visual terasa di tengah
  const logoKiriEnd = margin + 50;        // margin + lebar logo kiri
  const logoKananStart = W - margin - 75; // posisi mulai logo kanan
  const centerX = logoKiriEnd + (logoKananStart - logoKiriEnd) / 2;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("BADAN RISET DAN INOVASI DAERAH", centerX, y + 16, { align: "center" });
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Kantor Pemerintahan Kota Surabaya", centerX, y + 28, { align: "center" });
  pdf.text("Jl. Jimerto No. 25-27, Ketabang, Kec. Genteng, Surabaya, Jawa Timur 60272", centerX, y + 40, { align: "center" });
  
  pdf.setFont("helvetica", "italic");
  pdf.text("Website: brida-surabaya.id", centerX, y + 52, { align: "center" });
  
  // Bangga Surabaya Logo (Kanan)
  if (banggaLogoB64) {
    // Rasio logo bangga surabaya berbeda, pastikan proporsional
    pdf.addImage(banggaLogoB64, 'PNG', W - margin - 75, y + 10, 75, 42);
  }
  
  y += 65;
  // Garis Kop Surat
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(2);
  pdf.line(margin, y, W - margin, y);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y + 3, W - margin, y + 3);
  y += 30;
  
  // Judul Rapor
  pdf.setTextColor(180, 0, 0); // TEMA MERAH
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("RAPOR PENGEMBANGAN BAKAT DAN KEWIRAUSAHAAN", W / 2, y, { align: "center" });
  y += 20;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(80, 80, 80);
  pdf.text(completeUser.fullName.toUpperCase(), W / 2, y, { align: "center" });
  y += 40;

  // ── A. IDENTITAS DIRI ──
  checkPage(40);
  pdf.setFillColor(220, 0, 0); // TEMA MERAH
  pdf.rect(col1, y, W - 2 * margin, 20, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  pdf.text("A.  IDENTITAS DIRI", col1 + 8, y + 14);
  y += 35;

  row("Nama Lengkap", completeUser.fullName);
  row("NIK", completeUser.nik);
  row("Tempat, Tanggal Lahir", `${completeUser.tempatLahir}, ${formattedTTL}`);
  row("Jenis Kelamin", completeUser.jenisKelamin);
  row("Agama", completeUser.agama || "-");
  row("Pendidikan Terakhir", completeUser.pendidikan || "-");
  row("No. Telepon", completeUser.phone || "-");
  
  // Alamat KTP (Dipecah per baris)
  pdf.setFont("helvetica", "bold");
  pdf.text("Alamat KTP", col1, y);
  pdf.text(":", col2 - 10, y);
  y += 18;
  row("  Alamat Lengkap", completeUser.alamatKtp || "-");
  row("  RT / RW", `${completeUser.rtKtp || "-"} / ${completeUser.rwKtp || "-"}`);
  row("  Kelurahan", completeUser.kelurahanKtp || "-");
  row("  Kecamatan", completeUser.kecamatanKtp || "-");
  row("  Kota", completeUser.kotaKtp || "-");
  row("  Kode Pos", completeUser.kodePosKtp || "-");
  rowSeparator();

  // Alamat Domisili (Dipecah per baris)
  if (completeUser.domisiliSama) {
    row("Alamat Domisili", "Sama dengan KTP");
  } else {
    checkPage(40);
    pdf.setFont("helvetica", "bold");
    pdf.text("Alamat Domisili", col1, y);
    pdf.text(":", col2 - 10, y);
    y += 18;
    row("  Alamat Lengkap", completeUser.alamatDomisili || "-");
    row("  RT / RW", `${completeUser.rtDomisili || "-"} / ${completeUser.rwDomisili || "-"}`);
    row("  Kelurahan", completeUser.kelurahanDomisili || "-");
    row("  Kecamatan", completeUser.kecamatanDomisili || "-");
    row("  Kota", completeUser.kotaDomisili || "-");
    row("  Kode Pos", completeUser.kodePosDomisili || "-");
  }
  rowSeparator();

  row("Punya Usaha", completeUser.punyaUsaha === "ya" ? "Ya" : "Tidak");
  if (completeUser.punyaUsaha === "ya") {
    const bidangText = completeUser.bidangUsaha?.toLowerCase() === "lainnya" 
      ? `Lainnya (${completeUser.bidangUsahaLainnya || "-"})` 
      : completeUser.bidangUsaha || "-";
      
    row("Bidang Usaha", bidangText);
    // Menampilkan usaha berapa kali (dari lamaBerusaha)
    row("Lama Berusaha", completeUser.lamaBerusaha || "-");
    row("Berapa Kali Ganti Usaha", completeUser.gantiUsaha || "-");
    row("Penghasilan/Hari", completeUser.penghasilanPerHari || "-");
  }
  y += 10;

  // ── B. HASIL PENGERJAAN KUESIONER ──
  // Pindah halaman baru sebelum B. Hasil Pengerjaan
  pdf.addPage();
  drawPageBackgrounds();
  y = margin;

  pdf.setFillColor(220, 0, 0); // TEMA MERAH
  pdf.rect(col1, y, W - 2 * margin, 20, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  pdf.text("B.  HASIL PENGERJAAN KUESIONER", col1 + 8, y + 14);
  y += 35;

  // 1. KLASTER
  pdf.setFillColor(255, 248, 240); // Warna box background
  pdf.setDrawColor(220, 0, 0); // TEMA MERAH
  pdf.setLineWidth(1.5);
  pdf.roundedRect(col1, y, W - 2 * margin, 50, 4, 4, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(180, 0, 0); // TEMA MERAH
  // Tampilkan title asli dari klusterInfo (contoh "Siap Bermitra") tanpa embel-embel "Rekomendasi: Cluster 3 — "
  pdf.text(klusterInfo.subtitle, W / 2, y + 20, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);
  const klusterDescLines = pdf.splitTextToSize(klusterInfo.desc, W - 2 * margin - 20);
  pdf.text(klusterDescLines, W / 2, y + 36, { align: "center" });
  y += 70;

  // 2. GRIT (Hanya Kategori, Tanpa Skor)
  checkPage(40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(180, 0, 0); // TEMA MERAH
  pdf.text("Ketekunan (GRIT)", col1, y);
  y += 16;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 51, 102); // Navy Blue untuk kategori hasil
  pdf.text(`Kategori: ${scoring.gritCategory.label}`, col1, y);
  y += 16;
  
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  const gritDescLines = pdf.splitTextToSize(scoring.gritCategory.desc, W - 2 * margin);
  pdf.text(gritDescLines, col1, y);
  y += gritDescLines.length * 14 + 15;

  // 3. KWU (Hanya Kategori, Tanpa Skor)
  checkPage(40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(180, 0, 0); // TEMA MERAH
  pdf.text("Kewirausahaan (KWU)", col1, y);
  y += 16;
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 51, 102); // Navy Blue untuk kategori hasil
  pdf.text(`Kategori: ${scoring.kwuCategory.label}`, col1, y);
  y += 16;
  
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  const kwuDescLines = pdf.splitTextToSize(scoring.kwuCategory.desc, W - 2 * margin);
  pdf.text(kwuDescLines, col1, y);
  y += kwuDescLines.length * 14 + 15;

  // 4. TIPI
  checkPage(40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(180, 0, 0); // TEMA MERAH
  pdf.text("Profil Kepribadian (TIPI)", col1, y);
  y += 16;

  const tipiAspectsToRender: TIPIAspect[] = [
    "extraversion", "agreeableness", "conscientiousness", "neuroticism", "openness"
  ];
  const tipiAspectLabels = {
    extraversion: "Ekstroversi (Extraversion)",
    agreeableness: "Keramahan (Agreeableness)",
    conscientiousness: "Kehati-hatian (Conscientiousness)",
    neuroticism: "Neurotisisme (Neuroticism)",
    openness: "Keterbukaan (Openness)"
  };

  tipiAspectsToRender.forEach((key) => {
    checkPage(40);
    const cat = scoring.tipiCategories[key];
    const desc = TIPI_DESCRIPTIONS[key][cat];

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);
    pdf.text(`• ${tipiAspectLabels[key]} `, col1, y);
    pdf.setTextColor(0, 51, 102); // Navy Blue
    pdf.text(`— ${cat}`, col1 + pdf.getTextWidth(`• ${tipiAspectLabels[key]} `), y);
    y += 14;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    const descLines = pdf.splitTextToSize(desc, W - 2 * margin - 15);
    pdf.text(descLines, col1 + 15, y);
    y += descLines.length * 14 + 10;
  });

  // ── PENANDATANGAN ──
  // Tempatkan tepat setelah TIPI
  y += 30;
  const tanggalStr = new Date(kuesionerResult.tanggal).toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric"
  });

  checkPage(100);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(30, 30, 30);
  pdf.text(`Surabaya, ${tanggalStr}`, W - margin, y, { align: "right" });
  pdf.text("Penyelenggara Asesmen", W - margin, y + 15, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.text("Tim BRIDA Surabaya", W - margin, y + 60, { align: "right" });

  const safename = completeUser.fullName.replace(/\s+/g, "_");
  pdf.save(`Rapor_Individu_Komitmen_${safename}.pdf`);
};
