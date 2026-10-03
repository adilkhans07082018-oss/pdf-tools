"use client";

import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { File as FileIcon, X, Loader2, Hash } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      pages.forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(`${idx + 1}`, {
          x: width / 2,
          y: 20,
          size: 14,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("An error occurred.");
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
              downloadFilename={`numbered-${file.name}`}
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
        Automatically insert page numbers into your PDF.
      </p>

      {!file && (
        <Dropzone onFileSelect={handleFileSelect} colorScheme="green" title="Select PDF file" />
      )}

      {file && (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-green-500" />
              <span className="text-lg font-medium text-white/80">{file.name}</span>
            </div>
            <button onClick={() => { setFile(null); setResultUrl(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!resultUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <button
                onClick={processPdf}
                disabled={isProcessing}
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Hash className="w-5 h-5" /> Add Numbers</>}
              </button>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
}
