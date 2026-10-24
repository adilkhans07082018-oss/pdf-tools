"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Loader2 } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setCompressedPdfUrl(null);
      setStats(null);
    }
  };

  const compressPdf = async () => {
    if (!file) return;
    setIsCompressing(true);
    setCompressedPdfUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Save with object stream compression
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setCompressedPdfUrl(url);
      setStats({
        original: file.size,
        compressed: pdfBytes.length,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("An error occurred while compressing the PDF.");
    } finally {
      setIsCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (compressedPdfUrl && stats) {
    const savedBytes = Math.max(0, stats.original - stats.compressed);
    const percentage = stats.original > 0 ? Math.round((savedBytes / stats.original) * 100) : 0;

    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF has been compressed!"
          subtitle={`Your PDF is now ${percentage}% smaller (${formatSize(stats.compressed)} down from ${formatSize(stats.original)})`}
          downloadUrl={compressedPdfUrl}
          downloadFilename={`compressed-${file?.name || "document.pdf"}`}
          onStartOver={() => {
            setFile(null);
            setCompressedPdfUrl(null);
            setStats(null);
          }}
          colorScheme="yellow"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Compress PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Reduce file size while optimizing for maximal PDF quality. Preview before compressing.
      </p>

      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          colorScheme="yellow"
          title="Select PDF file"
          subtitle="or drop PDF here"
        />
      )}

      {file && (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => {
              setFile(null);
              setCompressedPdfUrl(null);
              setStats(null);
            }}
            colorScheme="amber"
          />

          {!compressedPdfUrl && (
            <button
              onClick={compressPdf}
              disabled={isCompressing}
              className="w-full max-w-xs py-3.5 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Compressing...
                </>
              ) : (
                "Compress PDF"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
