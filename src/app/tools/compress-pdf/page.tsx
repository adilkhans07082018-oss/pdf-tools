"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, X, Download, Loader2, Settings } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ old: number; new: number } | null>(null);

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
    setStats(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
      setStats({
        old: file.size,
        new: blob.size,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("An error occurred while trying to compress the PDF.");
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
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
              title="PDF has been compressed!"
              downloadUrl={compressedPdfUrl}
              downloadFilename="compressed-document.pdf"
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
        Reduce file size while optimizing for maximal PDF quality.
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
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-yellow-500" />
              <div>
                <span className="block text-lg font-medium text-white/80">
                  {file.name}
                </span>
                <span className="block text-sm text-white/50">
                  {formatSize(file.size)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setCompressedPdfUrl(null);
                setStats(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!compressedPdfUrl && (
            <button
              onClick={compressPdf}
              disabled={isCompressing}
              className="w-full max-w-xs py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Compressing...
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5" /> Optimize PDF
                </>
              )}
            </button>
          )}

          
        </div>
      )}
    </div>
  );
}
