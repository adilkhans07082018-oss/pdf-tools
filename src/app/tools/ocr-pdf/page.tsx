"use client";

import { useState, useEffect } from "react";
import { File as FileIcon, X, Download, Loader2, Search } from "lucide-react";
import Tesseract from "tesseract.js";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

let pdfjsLib: any = null;

export default function OcrPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedTextUrl, setExtractedTextUrl] = useState<string | null>(null);

  useEffect(() => {
    import("pdfjs-dist/build/pdf.mjs").then((pdfjs) => {
      pdfjsLib = pdfjs;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
    }).catch(() => {
      import("pdfjs-dist").then((pdfjs) => {
        pdfjsLib = pdfjs;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      });
    });
  }, []);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setExtractedText(null);
      setProgress(0);
    }
  };

  const performOcr = async () => {
    if (!file || !pdfjsLib) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedText(null);
    setStatusText("Preparing PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        setStatusText(`Rendering page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); 

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          const dataUrl = canvas.toDataURL("image/png");

          setStatusText(`Analyzing text on page ${i}...`);
          const result = await Tesseract.recognize(dataUrl, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text") {
                const overallProgress = ((i - 1) / numPages) * 100 + (m.progress * (100 / numPages));
                setProgress(Math.round(overallProgress));
              }
            },
          });
          
          fullText += `--- Page ${i} ---\n\n${result.data.text}\n\n`;
        }
      }

      setExtractedText(fullText);
      
      const blob = new Blob([fullText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      setExtractedTextUrl(url);

      setProgress(100);
      setStatusText("Complete!");
    } catch (error) {
      console.error("Error performing OCR:", error);
      alert("An error occurred during text extraction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "")}-extracted-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (extractedTextUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Text Extracted!"
          downloadUrl={extractedTextUrl}
          downloadFilename={`${file?.name.replace(".pdf", "")}-extracted-text.txt`}
          onStartOver={() => {
            setFile(null);
            setExtractedText(null);
            setExtractedTextUrl(null);
          }}
          colorScheme="indigo"
        />
        <div className="w-full max-w-3xl border border-white/10 rounded-lg bg-white/5 p-4 max-h-64 overflow-y-auto font-mono text-sm text-white/80 whitespace-pre-wrap mt-8 shadow-inner">
          {extractedText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">OCR PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Extract text from scanned PDFs or images inside your document.
      </p>

      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          colorScheme="indigo"
          title="Select scanned PDF"
          subtitle="or drop PDF here"
        />
      )}

      {file && (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-indigo-500" />
              <span className="text-lg font-medium text-white/80">
                {file.name}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setExtractedText(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!extractedText && (
            <div className="w-full max-w-md flex flex-col items-center gap-4">
              <button
                onClick={performOcr}
                disabled={isProcessing}
                className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" /> Extract Text
                  </>
                )}
              </button>

              {isProcessing && (
                <div className="w-full text-center">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-white/50">{statusText} ({progress}%)</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
