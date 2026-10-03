"use client";

import { useState, useEffect } from "react";
import { File as FileIcon, X, Download, Loader2, Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

let pdfjsLib: any = null;

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  useEffect(() => {
    import("pdfjs-dist/build/pdf.mjs").then((pdfjs) => {
      pdfjsLib = pdfjs;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
    }).catch(err => {
      import("pdfjs-dist").then((pdfjs) => {
        pdfjsLib = pdfjs;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
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
              downloadFilename={`${file.name.replace(".pdf", "")}-images.zip`}
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
        Convert each PDF page into a high-quality JPG image.
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
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-purple-500" />
              <span className="text-lg font-medium text-white/80">
                {file.name}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setZipUrl(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!zipUrl && (
            <button
              onClick={convertPdfToJpg}
              disabled={isConverting}
              className="w-full max-w-xs py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Converting...
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
