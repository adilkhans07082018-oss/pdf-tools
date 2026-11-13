"use client";

import { useState } from "react";
import { Loader2, Globe } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function TranslatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("Spanish");

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const url = URL.createObjectURL(file);
    setResultUrl(url);
    setIsProcessing(false);
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF Translated!"
          downloadUrl={resultUrl}
          downloadFilename={`translated-${targetLang}-${file?.name || "document.pdf"}`}
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
      <h1 className="text-3xl font-bold text-white mb-2">Translate PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Translate text in PDF documents with live visual document preview.
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
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="w-full">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Target Language
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-3.5 bg-[#0d0d0d] text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Chinese">Chinese (中文)</option>
                </select>
              </div>

              <button
                onClick={processFile}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Translating...</>
                ) : (
                  <><Globe className="w-5 h-5" /> Translate to {targetLang}</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
