"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, X, Download, Loader2, Lock } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import SuccessScreen from "@/components/SuccessScreen";

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
      const pdfDoc = await PDFDocument.load(arrayBuffer);

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
      alert("An error occurred. Note: pdf-lib might have limited encryption support out-of-the-box in the browser.");
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
            downloadFilename="protected-document.pdf"
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
        Encrypt your PDF with a password to keep sensitive data confidential.
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
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 border border-white/5 rounded-lg w-full justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-red-500" />
              <span className="text-lg font-medium text-white/80">
                {file.name}
              </span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setProtectedPdfUrl(null);
                setPassword("");
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {!protectedPdfUrl && (
            <div className="w-full max-w-sm flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Set Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password"
                    className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                onClick={protectPdf}
                disabled={isProtecting || !password}
                className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProtecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Encrypting...
                  </>
                ) : (
                  "Protect PDF"
                )}
              </button>
            </div>
          )}

        
        </div>
      )}
    </div>
  );
}
