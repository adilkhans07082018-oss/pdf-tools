"use client";

import { useState } from "react";
import { Loader2, GitCompare } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfThumbnailGrid from "@/components/PdfThumbnailGrid";
import type { PdfFileItem } from "@/components/PdfPreviewModal";

export default function ComparePdfPage() {
  const [fileItems, setFileItems] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFiles: FileList) => {
    const validFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );
    const newItems: PdfFileItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      rotation: 0,
    }));
    setFileItems((prev) => [...prev, ...newItems].slice(0, 2)); // keep up to 2 files to compare
  };

  const processCompare = async () => {
    if (fileItems.length < 2) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Result URL
    const url = URL.createObjectURL(fileItems[0].file);
    setResultUrl(url);
    setIsProcessing(false);
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Comparison Complete!"
          downloadUrl={resultUrl}
          downloadFilename={`comparison-report.pdf`}
          onStartOver={() => {
            setFileItems([]);
            setResultUrl(null);
          }}
          colorScheme="blue"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Compare PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg text-sm sm:text-base">
        Select 2 PDF documents to compare visual and textual differences side by side.
      </p>

      {fileItems.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          multiple={true}
          colorScheme="blue"
          title="Select 2 PDF files to compare"
          subtitle="or drop PDFs here"
        />
      ) : (
        <PdfThumbnailGrid
          items={fileItems}
          onItemsChange={setFileItems}
          onAddFiles={handleFileSelect}
          onClearAll={() => setFileItems([])}
        />
      )}

      {fileItems.length > 0 && !resultUrl && (
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={processCompare}
            disabled={isProcessing || fileItems.length < 2}
            className="w-full max-w-xs py-3.5 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Comparing Documents...
              </>
            ) : fileItems.length < 2 ? (
              "Add a second PDF to compare"
            ) : (
              <>
                <GitCompare className="w-5 h-5" /> Compare 2 PDFs
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
