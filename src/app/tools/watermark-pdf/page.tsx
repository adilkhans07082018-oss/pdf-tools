"use client";

import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { File as FileIcon, X, Loader2, Type } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * 15),
          y: height / 2,
          size: 60,
          color: rgb(0.95, 0.1, 0.1),
          opacity: 0.3,
          rotate: { angle: 45, type: 'degrees' }
        });
      }

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
              title="Watermark added!"
              downloadUrl={resultUrl}
              downloadFilename={`watermarked-${file.name}`}
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
        Stamp text over your PDF pages.
      </p>

      {!file && (
        <Dropzone onFileSelect={handleFileSelect} colorScheme="orange" title="Select PDF file" />
      )}

      {file && (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-orange-500" />
              <span className="text-lg font-medium text-white/80">{file.name}</span>
            </div>
            <button onClick={() => { setFile(null); setResultUrl(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!resultUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <input 
                type="text"
                value={watermarkText} 
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full p-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              
              <button
                onClick={processPdf}
                disabled={isProcessing || !watermarkText}
                className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Stamping...</> : <><Type className="w-5 h-5" /> Add Watermark</>}
              </button>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
}
