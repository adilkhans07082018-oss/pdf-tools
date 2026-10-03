"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, X, Loader2, Trash2 } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalCount = pdfDoc.getPageCount();

      // parse "1, 3, 5" or "1-3" etc. simplistic comma parsing
      const pagesToRemove = pagesToRemoveStr.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < totalCount);
      
      // Remove in reverse order so indices don't shift for upcoming removals
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
      alert("An error occurred. Check your page numbers.");
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
              downloadFilename={`cleaned-${file.name}`}
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
        Delete specific pages from a PDF document.
      </p>

      {!file && (
        <Dropzone onFileSelect={handleFileSelect} colorScheme="red" title="Select PDF file" />
      )}

      {file && (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-red-500" />
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
                value={pagesToRemoveStr} 
                onChange={(e) => setPagesToRemoveStr(e.target.value)}
                placeholder="Pages to remove (e.g. 1, 3, 5)"
                className="w-full p-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
              
              <button
                onClick={processPdf}
                disabled={isProcessing || !pagesToRemoveStr}
                className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Removing...</> : <><Trash2 className="w-5 h-5" /> Remove Pages</>}
              </button>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
}
