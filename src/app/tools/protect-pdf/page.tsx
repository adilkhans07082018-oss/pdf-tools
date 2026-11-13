"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Loader2, Lock } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";
import PdfSinglePreviewCard from "@/components/PdfSinglePreviewCard";

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProtecting, setIsProtecting] = useState(false);
  const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);

  const handleFileSelect = (files: FileList) => {
    if (files && files[0]) {
      setFile(files[0]);
      setProtectedPdfUrl(null);
    }
  };

  const protectPdf = async () => {
    if (!file || !password) return;
    setIsProtecting(true);
    setProtectedPdfUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const encryptedBytes = await pdfDoc.save({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
      });

      const blob = new Blob([encryptedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setProtectedPdfUrl(url);
    } catch (error) {
      console.error("Error protecting PDF:", error);
      alert("An error occurred while protecting the PDF.");
    } finally {
      setIsProtecting(false);
    }
  };

  if (protectedPdfUrl) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">
        <SuccessScreen
          title="PDF has been protected!"
          downloadUrl={protectedPdfUrl}
          downloadFilename={`protected-${file?.name || "document.pdf"}`}
          onStartOver={() => {
            setFile(null);
            setProtectedPdfUrl(null);
            setPassword("");
          }}
          colorScheme="red"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">Protect PDF</h1>
      <p className="text-white/60 mb-8 text-center max-w-lg">
        Encrypt your PDF with a password to keep sensitive data confidential. Preview before encrypting.
      </p>

      {!file && (
        <Dropzone
          onFileSelect={handleFileSelect}
          colorScheme="red"
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
              setProtectedPdfUrl(null);
              setPassword("");
            }}
            colorScheme="red"
          />

          {!protectedPdfUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <input
                type="password"
                placeholder="Enter password to encrypt"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-[#0d0d0d] text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm placeholder:text-white/40"
              />
              <button
                onClick={protectPdf}
                disabled={isProtecting || !password}
                className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isProtecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Protecting...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> Protect PDF
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
