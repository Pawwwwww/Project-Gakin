import React, { forwardRef } from "react";
import { UserRecord, KuesionerSubmission } from "../../../../services/StorageService";
import { calcFullScore } from "../../../../services/ScoringService";
import { KLUSTER_INFO, GRIT_QUESTIONS, KWU_ITEMS, TIPI_QUESTIONS } from "../../../../entities/respondent";

interface RaporPDFDocumentProps {
  user: UserRecord | null;
  kuesionerResult: KuesionerSubmission | null;
}

const RaporPDFDocument = forwardRef<HTMLDivElement, RaporPDFDocumentProps>(
  ({ user, kuesionerResult }, ref) => {
    if (!user || !kuesionerResult) return null;

    const scoring = calcFullScore(kuesionerResult.data);
    const klusterLabel = KLUSTER_INFO[scoring.kluster]?.title || "Cluster tidak diketahui";
    const klusterDesc = KLUSTER_INFO[scoring.kluster]?.desc || "";

    return (
      <div
        ref={ref}
        className="bg-white text-black p-10 w-[210mm] min-h-[297mm] mx-auto text-sm"
        style={{
          boxSizing: "border-box",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: "1.5",
        }}
      >
        {/* KOP RAPOR */}
        <div className="text-center mb-8 border-b-4 border-black pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide">
            Pemerintah Kota Surabaya
          </h1>
          <h2 className="text-lg font-bold uppercase">
            Badan Riset dan Inovasi Daerah (BRIDA)
          </h2>
          <p className="text-sm mt-1">
            Gedung Balai Kota Surabaya, Jl. Taman Surya No. 1, Surabaya
          </p>
        </div>

        {/* JUDUL */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold uppercase underline">
            Rapor Pengembangan Bakat dan Kewirausahaan
          </h3>
        </div>

        {/* PROFIL PRIBADI */}
        <div className="mb-6">
          <h4 className="font-bold text-lg border-b-2 border-gray-400 mb-2 uppercase">
            A. Identitas Diri
          </h4>
          <table className="w-full text-left">
            <tbody>
              <tr>
                <td className="w-48 py-1">Nama Lengkap</td>
                <td className="w-4">:</td>
                <td className="font-bold">{user.fullName}</td>
              </tr>
              <tr>
                <td className="py-1">N.I.K</td>
                <td>:</td>
                <td>{user.nik}</td>
              </tr>
              <tr>
                <td className="py-1">Tempat, Tanggal Lahir</td>
                <td>:</td>
                <td>
                  {user.tempatLahir}, {user.tanggalLahir}
                </td>
              </tr>
              <tr>
                <td className="py-1">Jenis Kelamin</td>
                <td>:</td>
                <td>{user.jenisKelamin}</td>
              </tr>
              <tr>
                <td className="py-1 align-top">Alamat Domisili</td>
                <td className="align-top">:</td>
                <td>Sama dengan KTP</td>
              </tr>
              <tr>
                <td className="py-1">Status GAKIN</td>
                <td>:</td>
                <td>{user.gakinStatus || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* HASIL KLASTER & KATEGORI */}
        <div className="mb-6">
          <h4 className="font-bold text-lg border-b-2 border-gray-400 mb-2 uppercase">
            B. Hasil Analisis Asesmen
          </h4>
          <table className="w-full border-collapse border border-black mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-center">Aspek</th>
                <th className="border border-black p-2 text-center">Kategori</th>
                <th className="border border-black p-2 text-center w-1/2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold">GRIT (Ketekunan)</td>
                <td className="border border-black p-2 text-center font-bold">
                  {scoring.gritCategory.label}
                </td>
                <td className="border border-black p-2 text-justify text-xs">
                  {scoring.gritCategory.desc}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">Kewirausahaan (KWU)</td>
                <td className="border border-black p-2 text-center font-bold">
                  {scoring.kwuCategory.label}
                </td>
                <td className="border border-black p-2 text-justify text-xs">
                  {scoring.kwuCategory.desc}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-2 border-black p-4 bg-gray-50 text-center">
            <h5 className="font-bold text-lg mb-1">Rekomendasi Kluster: {klusterLabel}</h5>
            <p className="font-semibold">{KLUSTER_INFO[scoring.kluster]?.subtitle}</p>
            <p className="mt-2 text-sm italic">{klusterDesc}</p>
          </div>
        </div>

        {/* PROFIL KEPRIBADIAN (TIPI) */}
        <div className="mb-6" style={{ pageBreakBefore: "always" }}>
          <h4 className="font-bold text-lg border-b-2 border-gray-400 mb-2 uppercase">
            C. Profil Kepribadian (TIPI)
          </h4>
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 w-1/3">Aspek Kepribadian</th>
                <th className="border border-black p-2 w-1/4">Tingkat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">Ekstroversi (Extraversion)</td>
                <td className="border border-black p-2 text-center font-semibold">{scoring.tipiCategories.extraversion}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Keramahan (Agreeableness)</td>
                <td className="border border-black p-2 text-center font-semibold">{scoring.tipiCategories.agreeableness}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Kehati-hatian (Conscientiousness)</td>
                <td className="border border-black p-2 text-center font-semibold">{scoring.tipiCategories.conscientiousness}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Neurotisisme (Neuroticism)</td>
                <td className="border border-black p-2 text-center font-semibold">{scoring.tipiCategories.neuroticism}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Keterbukaan (Openness)</td>
                <td className="border border-black p-2 text-center font-semibold">{scoring.tipiCategories.openness}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RINCIAN JAWABAN */}
        <div className="mb-6" style={{ pageBreakBefore: "auto" }}>
          <h4 className="font-bold text-lg border-b-2 border-gray-400 mb-2 uppercase">
            D. Lampiran Rincian Jawaban
          </h4>
          
          <h5 className="font-bold mt-4 mb-2 underline">Bagian I: GRIT</h5>
          <table className="w-full border-collapse border border-gray-400 text-xs text-left mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1 w-8 text-center">No</th>
                <th className="border border-gray-400 p-1">Pertanyaan</th>
                <th className="border border-gray-400 p-1 w-16 text-center">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {GRIT_QUESTIONS.map((q, idx) => (
                <tr key={q.id}>
                  <td className="border border-gray-400 p-1 text-center">{idx + 1}</td>
                  <td className="border border-gray-400 p-1">{q.text}</td>
                  <td className="border border-gray-400 p-1 text-center font-semibold">
                    {kuesionerResult.data.grit[q.id] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5 className="font-bold mt-4 mb-2 underline">Bagian II: Kewirausahaan</h5>
          <table className="w-full border-collapse border border-gray-400 text-xs text-left mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1 w-8 text-center">No</th>
                <th className="border border-gray-400 p-1 w-1/4">Aspek</th>
                <th className="border border-gray-400 p-1 text-center">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {KWU_ITEMS.map((q, idx) => (
                <tr key={q.id}>
                  <td className="border border-gray-400 p-1 text-center">{idx + 1}</td>
                  <td className="border border-gray-400 p-1">{q.aspek}</td>
                  <td className="border border-gray-400 p-1 text-center font-semibold">
                    {kuesionerResult.data.kwu[q.id] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h5 className="font-bold mt-4 mb-2 underline">Bagian III: Kepribadian Singkat (TIPI)</h5>
          <table className="w-full border-collapse border border-gray-400 text-xs text-left mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1 w-8 text-center">No</th>
                <th className="border border-gray-400 p-1">Pernyataan ("Saya melihat diri saya sebagai seseorang yang...")</th>
                <th className="border border-gray-400 p-1 w-16 text-center">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {TIPI_QUESTIONS.map((q, idx) => (
                <tr key={q.id}>
                  <td className="border border-gray-400 p-1 text-center">{idx + 1}</td>
                  <td className="border border-gray-400 p-1">{q.text}</td>
                  <td className="border border-gray-400 p-1 text-center font-semibold">
                    {kuesionerResult.data.tipi[q.id] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-12 flex justify-end text-sm">
          <div className="text-center">
            <p>Surabaya, {new Date(kuesionerResult.tanggal).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p className="mb-16">Penyelenggara Asesmen</p>
            <p className="font-bold underline">Tim BRIDA Surabaya</p>
          </div>
        </div>

      </div>
    );
  }
);

RaporPDFDocument.displayName = "RaporPDFDocument";

export default RaporPDFDocument;
