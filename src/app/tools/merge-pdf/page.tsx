"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Loader2 } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfThumbnailGrid from "@/components/PdfThumbnailGrid";
import type { PdfFileItem } from "@/components/PdfPreviewModal";

export default function MergePdfPage() {
  const [fileItems, setFileItems] = useState<PdfFileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

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

  const mergePdfs = async () => {
    if (fileItems.length < 2) return;
    setIsMerging(true);
    setMergedPdfUrl(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of fileItems) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        // Apply per-file rotation if user rotated this document
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
      setMergedPdfUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("An error occurred while merging the PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  if (mergedPdfUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDFs have been merged!"
          downloadUrl={mergedPdfUrl}
          downloadFilename="merged-document.pdf"
          onStartOver={() => {
            setFileItems([]);
            setMergedPdfUrl(null);
          }}
          colorScheme="red"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Merge PDF Files</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg text-sm sm:text-base">
        Combine multiple PDFs in the exact order you want. Preview pages, rotate, or reorder before merging.
      </p>

      {/* Upload Dropzone (shown initially or when list is empty) */}
      {fileItems.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          multiple={true}
          colorScheme="red"
          title="Select PDF files"
          subtitle="or drop PDFs here"
        />
      ) : (
        /* Large Visual Thumbnail Cards & Grid */
        <PdfThumbnailGrid
          items={fileItems}
          onItemsChange={setFileItems}
          onAddFiles={handleFileSelect}
          onClearAll={() => setFileItems([])}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 w-full">
        {fileItems.length > 0 && !mergedPdfUrl && (
          <button
            onClick={mergePdfs}
            disabled={isMerging || fileItems.length < 2}
            className="w-full max-w-xs py-3.5 px-8 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Merging {fileItems.length} PDFs...
              </>
            ) : fileItems.length < 2 ? (
              "Add at least 2 files to merge"
            ) : (
              `Merge ${fileItems.length} PDFs`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
