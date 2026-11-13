"use client";

import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { createWorker } from "tesseract.js";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

let pdfjsLib: any = null;

export default function OcrPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedTextUrl, setExtractedTextUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    import("pdfjs-dist/build/pdf.mjs").then((pdfjs) => {
      pdfjsLib = pdfjs;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
    }).catch(() => {
      import("pdfjs-dist").then((pdfjs) => {
        pdfjsLib = pdfjs;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "4.10.38"}/build/pdf.worker.min.mjs`;
      });
    });
  }, []);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setExtractedText(null);
      setExtractedTextUrl(null);
      setProgress(0);
    }
  };

  const performOcr = async () => {
    if (!file || !pdfjsLib) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Initializing OCR Engine...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      let fullText = "";
      const worker = await createWorker('eng');

      for (let i = 1; i <= numPages; i++) {
        setStatusText(`Processing page ${i} of ${numPages}...`);
        setProgress(Math.round(((i - 1) / numPages) * 100));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          const imageBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );

          if (!imageBlob) continue;

          const result = await worker.recognize(imageBlob);
          fullText += `--- Page ${i} ---\n\n${result.data.text}\n\n`;
        }
      }

      await worker.terminate();

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

  if (extractedTextUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Text Extracted!"
          downloadUrl={extractedTextUrl}
          downloadFilename={`${file?.name.replace(".pdf", "") || "document"}-extracted-text.txt`}
          onStartOver={() => {
            setFile(null);
            setExtractedText(null);
            setExtractedTextUrl(null);
          }}
          colorScheme="indigo"
        />
        <div className="w-full max-w-3xl border border-white/10 rounded-2xl bg-white/5 p-5 max-h-64 overflow-y-auto font-mono text-sm text-white/80 whitespace-pre-wrap mt-8 shadow-inner">
          {extractedText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">OCR PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Extract text from scanned PDFs or images inside your document with visual preview.
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
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => {
              setFile(null);
              setExtractedText(null);
            }}
            colorScheme="indigo"
          />

          {!extractedText && (
            <div className="w-full max-w-md flex flex-col items-center gap-4">
              <button
                onClick={performOcr}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing OCR...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" /> Extract Text
                  </>
                )}
              </button>

              {isProcessing && (
                <div className="w-full text-center mt-2">
                  <div className="w-full bg-white/10 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" 
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
