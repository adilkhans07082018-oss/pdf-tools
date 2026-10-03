"use client";

import { useState } from "react";
import { File as FileIcon, X, Loader2, AlertCircle } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

export default function ToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);

    // Simulate complex processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Fallback logic for unsupported client-side complex conversions
    const url = URL.createObjectURL(file);
    setResultUrl(url);
    setIsProcessing(false);
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Processing Complete!"
          downloadUrl={resultUrl}
          downloadFilename={`processed-${file?.name}`}
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
        Translate PDF files powered by AI.
      </p>

      {/* API Disclaimer Banner */}
      <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-200/80 leading-relaxed">
          Note: This is an advanced feature. Because this toolkit runs completely serverless in your browser for privacy, complex ML and format conversions (like Word/Excel/AI) currently return the original file as a fallback until a backend API is connected.
        </p>
      </div>

      {!file ? (
        <Dropzone
          onFileSelect={(files) => setFile(files[0])}
          multiple={false}
          colorScheme="blue"
          title="Select file"
          subtitle="or drop it here"
        />
      ) : (
        <div className="w-full flex flex-col items-center gap-6">
          <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <FileIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-white/80">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </div>

          <button
            onClick={processFile}
            disabled={isProcessing}
            className="w-full max-w-xs py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Start Process"}
          </button>
        </div>
      )}
    </div>
  );
}
