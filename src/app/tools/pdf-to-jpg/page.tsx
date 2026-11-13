"use client";

import { useState, useEffect } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

let pdfjsLib: any = null;

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

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
      setZipUrl(null);
    }
  };

  const convertPdfToJpg = async () => {
    if (!file || !pdfjsLib) return;
    setIsConverting(true);
    setZipUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const zip = new JSZip();

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const base64Data = dataUrl.split(",")[1];
          zip.file(`page_${i}.jpg`, base64Data, { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);
    } catch (error) {
      console.error("Error converting PDF:", error);
      alert("An error occurred during conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  if (zipUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF converted to JPGs!"
          downloadUrl={zipUrl}
          downloadFilename={`${file?.name.replace(".pdf", "") || "document"}-images.zip`}
          onStartOver={() => {
            setFile(null);
            setZipUrl(null);
          }}
          colorScheme="purple"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">PDF to JPG</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Convert each PDF page into a high-quality JPG image with preview.
      </p>

      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          colorScheme="purple"
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
              setZipUrl(null);
            }}
            colorScheme="purple"
          />

          {!zipUrl && (
            <button
              onClick={convertPdfToJpg}
              disabled={isConverting}
              className="w-full max-w-xs py-3.5 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Converting pages...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" /> Convert to JPG
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
