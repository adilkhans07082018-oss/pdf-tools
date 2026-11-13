"use client";

import { useState, useEffect } from "react";
import { Loader2, FileCode } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

let pdfjsLib: any = null;

export default function PdfToMarkdownPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [markdownText, setMarkdownText] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

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
      setResultUrl(null);
      setMarkdownText(null);
    }
  };

  const processFile = async () => {
    if (!file || !pdfjsLib) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      let md = `# ${file.name.replace(/\.pdf$/i, "")}\n\n`;
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        md += `## Page ${i}\n\n${pageText}\n\n---\n\n`;
      }

      setMarkdownText(md);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error("Error converting to markdown:", err);
      alert("An error occurred while converting to Markdown.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Markdown Document Ready!"
          downloadUrl={resultUrl}
          downloadFilename={`${file?.name.replace(/\.pdf$/i, "") || "document"}.md`}
          onStartOver={() => {
            setFile(null);
            setResultUrl(null);
            setMarkdownText(null);
          }}
          colorScheme="blue"
        />
        {markdownText && (
          <div className="w-full max-w-3xl border border-white/10 rounded-2xl bg-white/5 p-5 max-h-64 overflow-y-auto font-mono text-xs sm:text-sm text-white/80 whitespace-pre-wrap mt-8 shadow-inner">
            {markdownText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">PDF to Markdown</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Convert PDFs into clean, structured Markdown files with visual preview.
      </p>

      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          multiple={false}
          colorScheme="blue"
          title="Select PDF file"
          subtitle="or drop PDF here"
        />
      )}

      {file && (
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
                <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</>
              ) : (
                <><FileCode className="w-5 h-5" /> Convert to Markdown</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
