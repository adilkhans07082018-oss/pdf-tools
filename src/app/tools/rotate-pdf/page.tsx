"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Loader2, RotateCw } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(90);

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
      
      for (const page of pages) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("An error occurred while rotating the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF has been rotated!"
          downloadUrl={resultUrl}
          downloadFilename={`rotated-${file?.name || "document.pdf"}`}
          onStartOver={() => { setFile(null); setResultUrl(null); }}
          colorScheme="blue"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Rotate PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Rotate pages in your PDF document easily. Preview the document before saving.
      </p>

      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          colorScheme="blue"
          title="Select PDF file"
        />
      )}

      {file && (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            rotation={rotation}
            onRotate={(newRot) => setRotation(newRot)}
            onRemove={() => { setFile(null); setResultUrl(null); }}
            colorScheme="blue"
          />

          {!resultUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-2">
              <div className="w-full flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate 90° Clockwise
                </button>
              </div>

              <select 
                value={rotation} 
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full p-3 bg-[#0d0d0d] text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value={90}>Rotate 90° Clockwise</option>
                <option value={180}>Rotate 180° Flip</option>
                <option value={270}>Rotate 270° (90° Counter-Clockwise)</option>
              </select>
              
              <button
                onClick={processPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Rotating...</> : <><RotateCw className="w-5 h-5" /> Save Rotated PDF</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
