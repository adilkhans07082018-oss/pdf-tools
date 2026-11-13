"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Loader2 } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfThumbnailGrid from "@/components/PdfThumbnailGrid";
import type { PdfFileItem } from "@/components/PdfPreviewModal";

export default function OrganizePdfPage() {
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
    setFileItems((prev) => [...prev, ...newItems]);
  };

  const processPdfs = async () => {
    if (fileItems.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of fileItems) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        if (item.rotation) {
          for (const page of pages) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + item.rotation));
          }
        }

        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error organizing PDFs:", error);
      alert("An error occurred while saving organized PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF Organized & Saved!"
          downloadUrl={resultUrl}
          downloadFilename="organized-document.pdf"
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
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Organize PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg text-sm sm:text-base">
        Sort, reorder, rotate, or delete PDF pages with visual drag-and-drop preview cards.
      </p>

      {fileItems.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          multiple={true}
          colorScheme="blue"
          title="Select PDF files"
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
            onClick={processPdfs}
            disabled={isProcessing}
            className="w-full max-w-xs py-3.5 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving Organized PDF...
              </>
            ) : (
              `Save Organized PDF (${fileItems.length} files)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
