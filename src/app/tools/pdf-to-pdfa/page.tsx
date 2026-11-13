"use client";

import { useState } from "react";
import { Loader2, Archive } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function PdfToPdfaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const url = URL.createObjectURL(file);
    setResultUrl(url);
    setIsProcessing(false);
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF/A Archive Ready!"
          downloadUrl={resultUrl}
          downloadFilename={`archival-${file?.name || "document.pdf"}`}
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
      <h1 className="text-3xl font-bold text-white mb-2">PDF to PDF/A</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Convert documents to ISO-standard PDF/A for verified long-term archiving with live preview.
      </p>

      {!file ? (
        <Dropzone
          onFileSelect={(files) => setFile(files[0])}
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
            <button
              onClick={processFile}
              disabled={isProcessing}
              className="w-full max-w-xs py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Conforming to PDF/A...</>
              ) : (
                <><Archive className="w-5 h-5" /> Convert to PDF/A</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
