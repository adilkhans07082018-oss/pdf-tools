"use client";

import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Loader2, Type } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setResultUrl(null);
    }
  };

  const processPdf = async () => {
    if (!file || !watermarkText) return;
    setIsProcessing(true);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: Math.max(20, width / 2 - (watermarkText.length * 14)),
          y: height / 2,
          size: Math.min(50, Math.floor(width / (watermarkText.length || 1) * 1.5)),
          color: rgb(0.95, 0.1, 0.1),
          opacity: 0.35,
          rotate: { angle: 45, type: 'degrees' }
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("An error occurred while adding watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Watermark added!"
          downloadUrl={resultUrl}
          downloadFilename={`watermarked-${file?.name || "document.pdf"}`}
          onStartOver={() => { setFile(null); setResultUrl(null); }}
          colorScheme="orange"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Add Watermark</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Stamp customizable text over your PDF pages with instant visual preview.
      </p>

      {!file && (
        <Dropzone onFileSelect={handleFileSelect} colorScheme="orange" title="Select PDF file" subtitle="or drop PDF here" />
      )}

      {file && (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => { setFile(null); setResultUrl(null); }}
            colorScheme="orange"
          />

          {!resultUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="w-full">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Watermark Text
                </label>
                <input 
                  type="text"
                  value={watermarkText} 
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT"
                  className="w-full p-3.5 bg-[#0d0d0d] text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                />
              </div>

              <button
                onClick={processPdf}
                disabled={isProcessing || !watermarkText.trim()}
                className="w-full py-3.5 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Applying...</>
                ) : (
                  <><Type className="w-5 h-5" /> Add Watermark</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
