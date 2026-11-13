"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Loader2, Trash2 } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function RemovePagesPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pagesToRemoveStr, setPagesToRemoveStr] = useState("");

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setResultUrl(null);
      setPagesToRemoveStr("");
    }
  };

  const processPdf = async () => {
    if (!file || !pagesToRemoveStr) return;
    setIsProcessing(true);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalCount = pdfDoc.getPageCount();

      // Parse comma-separated or range e.g. "1, 3, 5"
      const pagesToRemove = pagesToRemoveStr
        .split(',')
        .map(s => parseInt(s.trim()) - 1)
        .filter(n => !isNaN(n) && n >= 0 && n < totalCount);
      
      if (pagesToRemove.length === 0) {
        alert("Please specify valid page numbers to remove.");
        setIsProcessing(false);
        return;
      }

      // Remove in descending order so indices don't shift
      pagesToRemove.sort((a, b) => b - a);
      
      for (const pIndex of pagesToRemove) {
        pdfDoc.removePage(pIndex);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("An error occurred while removing pages. Check your page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Pages removed!"
          downloadUrl={resultUrl}
          downloadFilename={`cleaned-${file?.name || "document.pdf"}`}
          onStartOver={() => { setFile(null); setResultUrl(null); }}
          colorScheme="red"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Remove Pages</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Delete specific pages from a PDF document with full page preview.
      </p>

      {!file && (
        <Dropzone onFileSelect={handleFileSelect} colorScheme="red" title="Select PDF file" subtitle="or drop PDF here" />
      )}

      {file && (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => { setFile(null); setResultUrl(null); }}
            colorScheme="red"
          />

          {!resultUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="w-full">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Pages to Remove (e.g. 1, 3, 5)
                </label>
                <input 
                  type="text"
                  placeholder="Enter page numbers (e.g. 1, 4)"
                  value={pagesToRemoveStr}
                  onChange={(e) => setPagesToRemoveStr(e.target.value)}
                  className="w-full p-3.5 bg-[#0d0d0d] text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>

              <button
                onClick={processPdf}
                disabled={isProcessing || !pagesToRemoveStr.trim()}
                className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Removing pages...</>
                ) : (
                  <><Trash2 className="w-5 h-5" /> Delete Pages</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
