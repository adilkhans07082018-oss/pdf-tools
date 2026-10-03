"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, X, Download, Loader2 } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFiles: FileList) => {
    const validFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    setMergedPdfUrl(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("An error occurred while merging the PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  if (mergedPdfUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
            title="PDFs have been merged!"
            downloadUrl={mergedPdfUrl}
            downloadFilename="merged-document.pdf"
            onStartOver={() => {
              setFiles([]);
              setMergedPdfUrl(null);
            }}
            colorScheme="red"
          />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Merge PDF Files</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Combine multiple PDFs into one unified document. Drag and drop your files below.
      </p>

      {/* Upload Area */}
      <Dropzone
        onFileSelect={handleFileSelect}
        multiple={true}
        colorScheme="blue"
        title="Select PDF files"
        subtitle="or drop PDFs here"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-white mb-4">Selected Files</h3>
          <ul className="space-y-3">
            {files.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-white/80">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 w-full">
        {files.length > 1 && !mergedPdfUrl && (
          <button
            onClick={mergePdfs}
            disabled={isMerging}
            className="w-full max-w-xs py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Merging...
              </>
            ) : (
              "Merge PDFs"
            )}
          </button>
        )}

        
      </div>
    </div>
  );
}
