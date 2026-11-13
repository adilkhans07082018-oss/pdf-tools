"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Loader2, Image as ImageIcon } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfThumbnailGrid from "@/components/PdfThumbnailGrid";
import type { PdfFileItem } from "@/components/PdfPreviewModal";

export default function ImageToPdfPage() {
  const [fileItems, setFileItems] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFiles: FileList) => {
    const validFiles = Array.from(selectedFiles).filter(
      (file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)
    );
    const newItems: PdfFileItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      rotation: 0,
      pageCount: 1,
      thumbnailUrl: URL.createObjectURL(file),
    }));
    setFileItems((prev) => [...prev, ...newItems]);
  };

  const convertImagesToPdf = async () => {
    if (fileItems.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of fileItems) {
        // Convert any image to canvas to ensure standard PNG bytes
        const bitmap = await createImageBitmap(item.file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
          if (pngBlob) {
            const pngBytes = await pngBlob.arrayBuffer();
            const embed = await pdfDoc.embedPng(pngBytes);
            const page = pdfDoc.addPage([embed.width, embed.height]);
            page.drawImage(embed, {
              x: 0,
              y: 0,
              width: embed.width,
              height: embed.height,
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error converting images to PDF:", error);
      alert("An error occurred while creating PDF from images.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="Images converted to PDF!"
          downloadUrl={resultUrl}
          downloadFilename="converted-images.pdf"
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
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Image to PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg text-sm sm:text-base">
        Convert JPG, PNG, and WebP images into a single PDF with thumbnail preview & reordering.
      </p>

      {fileItems.length === 0 ? (
        <Dropzone
          onFileSelect={handleFileSelect}
          multiple={true}
          colorScheme="blue"
          title="Select images"
          subtitle="or drop JPG, PNG, WebP here"
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
            onClick={convertImagesToPdf}
            disabled={isProcessing}
            className="w-full max-w-xs py-3.5 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Creating PDF...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" /> Convert {fileItems.length} {fileItems.length === 1 ? "Image" : "Images"} to PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
