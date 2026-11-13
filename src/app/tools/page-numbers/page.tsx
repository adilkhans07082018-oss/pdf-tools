"use client";

import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Loader2, Hash } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function PageNumbersPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setResultUrl(null);
    }
  };

  const processPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      pages.forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(`${idx + 1}`, {
          x: width / 2 - 4,
          y: 20,
          size: 12,
          color: rgb(0.2, 0.2, 0.2),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("An error occurred while adding page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Page numbers added!"
          downloadUrl={resultUrl}
          downloadFilename={`numbered-${file?.name || "document.pdf"}`}
          onStartOver={() => { setFile(null); setResultUrl(null); }}
          colorScheme="green"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Add Page Numbers</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Automatically insert page numbers into your PDF document with preview.
      </p>

      {!file && (
        <Dropzone onFileSelect={handleFileSelect} colorScheme="green" title="Select PDF file" subtitle="or drop PDF here" />
      )}

      {file && (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => { setFile(null); setResultUrl(null); }}
            colorScheme="green"
          />

          {!resultUrl && (
            <button
              onClick={processPdf}
              disabled={isProcessing}
              className="w-full max-w-xs py-3.5 px-6 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Adding numbers...</>
              ) : (
                <><Hash className="w-5 h-5" /> Insert Page Numbers</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
