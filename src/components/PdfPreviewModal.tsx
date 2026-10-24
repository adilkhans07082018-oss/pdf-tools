"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Trash2, RotateCw, ChevronLeft, ChevronRight, FileText } from "lucide-react";

export interface PdfFileItem {
  file: File;
  id: string;
  rotation?: number;
  pageCount?: number;
  thumbnailUrl?: string | null;
}

interface PdfPreviewModalProps {
  isOpen: boolean;
  files: PdfFileItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete: (index: number) => void;
  onRotate?: (index: number) => void;
}

export default function PdfPreviewModal({
  isOpen,
  files,
  currentIndex,
  onClose,
  onNavigate,
  onDelete,
  onRotate,
}: PdfPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const currentItem = currentIndex !== null && files[currentIndex] ? files[currentIndex] : null;

  useEffect(() => {
    if (!currentItem) {
      setBlobUrl(null);
      return;
    }

    const url = URL.createObjectURL(currentItem.file);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentItem]);

  // Keyboard navigation & close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex !== null && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex !== null && currentIndex < files.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, files.length, onClose, onNavigate]);

  if (!isOpen || !currentItem || currentIndex === null) {
    return null;
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleDeleteCurrent = () => {
    const nextIdx = files.length > 1 ? Math.min(currentIndex, files.length - 2) : null;
    onDelete(currentIndex);
    if (nextIdx !== null) {
      onNavigate(nextIdx);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog */}
      <div 
        className="w-full max-w-5xl h-[90vh] bg-[#0c0c0c] border border-white/15 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#111111] border-b border-white/10 gap-3">
          {/* File Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400 font-bold text-xs">
              PDF
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm sm:text-base truncate max-w-md sm:max-w-lg" title={currentItem.file.name}>
                {currentItem.file.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>File {currentIndex + 1} of {files.length}</span>
                <span>•</span>
                <span>{formatFileSize(currentItem.file.size)}</span>
                {currentItem.pageCount && (
                  <>
                    <span>•</span>
                    <span>{currentItem.pageCount} {currentItem.pageCount === 1 ? "page" : "pages"}</span>
                  </>
                )}
                {Boolean(currentItem.rotation) && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400">Rotated {currentItem.rotation}°</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Prev / Next buttons */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors text-white"
                title="Previous file (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/60 px-2 font-mono">
                {currentIndex + 1}/{files.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === files.length - 1}
                className="p-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors text-white"
                title="Next file (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Rotate Button */}
            {onRotate && (
              <button
                onClick={() => onRotate(currentIndex)}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            {/* Open in New Window */}
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors hidden sm:flex"
                title="Open in new browser tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDeleteCurrent}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-red-400 transition-colors"
              title="Remove this file"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors ml-1"
              title="Close preview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 bg-[#181818] relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {blobUrl ? (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full rounded-lg bg-white shadow-lg border-0"
              title={currentItem.file.name}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/50">
              <FileText className="w-12 h-12 animate-pulse text-white/30" />
              <p className="text-sm">Loading document preview...</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-[#111111] border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>Use mouse wheel or PDF controls to zoom and flip pages</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white/90 rounded-md font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
