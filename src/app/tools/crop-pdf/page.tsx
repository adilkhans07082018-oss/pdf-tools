"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Loader2, Crop } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function CropPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [margin, setMargin] = useState(25);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setResultUrl(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { x, y, width, height } = page.getMediaBox();
        const m = Math.min(margin, Math.min(width, height) / 4);
        page.setCropBox(x + m, y + m, width - 2 * m, height - 2 * m);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error("Error cropping PDF:", err);
      alert("An error occurred while cropping the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF Cropped Successfully!"
          downloadUrl={resultUrl}
          downloadFilename={`cropped-${file?.name || "document.pdf"}`}
          onStartOver={() => {
            setFile(null);
            setResultUrl(null);
          }}
          colorScheme="blue"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Crop PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Trim margins and crop PDF pages with full document preview.
      </p>

      {!file ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          multiple={false}
          colorScheme="blue"
          title="Select PDF file"
          subtitle="or drop PDF here"
        />
      ) : (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => {
              setFile(null);
              setResultUrl(null);
            }}
            colorScheme="blue"
          />

          {!resultUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="w-full">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Margin to Trim ({margin}px)
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="60" 
                  value={margin} 
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <button
                onClick={processFile}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Cropping...</>
                ) : (
                  <><Crop className="w-5 h-5" /> Crop PDF Pages</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
