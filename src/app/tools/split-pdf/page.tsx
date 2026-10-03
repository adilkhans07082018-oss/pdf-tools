"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, X, Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitZipUrl, setSplitZipUrl] = useState<string | null>(null);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setSplitZipUrl(null);
    }
  };

  const splitPdf = async () => {
    if (!file) return;
    setIsSplitting(true);
    setSplitZipUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numberOfPages = pdfDoc.getPageCount();

      const zip = new JSZip();

      for (let i = 0; i < numberOfPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        zip.file(`page_${i + 1}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setSplitZipUrl(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("An error occurred while splitting the PDF.");
    } finally {
      setIsSplitting(false);
    }
  };

  if (splitZipUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
              title="PDF has been split!"
              downloadUrl={splitZipUrl}
              downloadFilename="split-pages.zip"
              onStartOver={() => {
                setFile(null);
                setSplitZipUrl(null);
              }}
              colorScheme="green"
            />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Split PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Separate one page or a whole set for easy conversion into independent PDF files.
      </p>

      {/* Upload Area */}
      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          colorScheme="green"
          title="Select PDF file"
          subtitle="or drop PDF here"
        />
      )}

      {/* File Info */}
      {file && (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-green-500" />
              <span className="text-lg font-medium text-white/80">
                {file.name}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setSplitZipUrl(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!splitZipUrl && (
            <button
              onClick={splitPdf}
              disabled={isSplitting}
              className="w-full max-w-xs py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSplitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Splitting...
                </>
              ) : (
                "Split PDF by Pages"
              )}
            </button>
          )}

          
        </div>
      )}
    </div>
  );
}
