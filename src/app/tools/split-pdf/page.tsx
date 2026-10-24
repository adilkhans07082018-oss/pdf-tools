"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Loader2, Scissors } from "lucide-react";
import JSZip from "jszip";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

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
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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
          downloadFilename={`${file?.name.replace(".pdf", "") || "document"}-pages.zip`}
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
        Separate each page into independent PDF files with full document preview.
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

      {/* File Info & Preview */}
      {file && (
        <div className="w-full flex flex-col items-center">
          <PdfSinglePreviewCard
            file={file}
            onRemove={() => {
              setFile(null);
              setSplitZipUrl(null);
            }}
            colorScheme="green"
          />

          {!splitZipUrl && (
            <button
              onClick={splitPdf}
              disabled={isSplitting}
              className="w-full max-w-xs py-3.5 px-6 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isSplitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Splitting pages...
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" /> Split into Individual Pages
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
