"use client";

import { useEffect, useState, useRef } from "react";
import { Eye, RotateCw, Trash2, ChevronLeft, ChevronRight, FileText, Loader2, GripVertical } from "lucide-react";
import type { PdfFileItem } from "./PdfPreviewModal";

interface PdfThumbnailCardProps {
  item: PdfFileItem;
  index: number;
  total: number;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onPreview: (index: number) => void;
  onRotate: (index: number) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdateMetadata?: (id: string, metadata: { pageCount?: number; thumbnailUrl?: string }) => void;
}

let pdfjsPromise: Promise<any> | null = null;

function loadPdfJs() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
        return pdfjs;
      } catch {
        try {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || "4.10.38"}/build/pdf.worker.min.mjs`;
          return pdfjs;
        } catch (e) {
          console.warn("Failed to initialize pdfjs-dist", e);
          return null;
        }
      }
    })();
  }
  return pdfjsPromise;
}

export default function PdfThumbnailCard({
  item,
  index,
  total,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  onPreview,
  onRotate,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onUpdateMetadata,
}: PdfThumbnailCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(item.thumbnailUrl || null);
  const [pageCount, setPageCount] = useState<number | null>(item.pageCount || null);
  const [isLoading, setIsLoading] = useState<boolean>(!item.thumbnailUrl);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Generate thumbnail for page 1
  useEffect(() => {
    if (thumbUrl && pageCount) return;

    let isCancelled = false;

    async function generateThumbnail() {
      setIsLoading(true);
      try {
        const pdfjs = await loadPdfJs();
        if (!pdfjs) throw new Error("PDF.js unavailable");

        const arrayBuffer = await item.file.arrayBuffer();
        if (isCancelled) return;

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        const pages = pdf.numPages;
        setPageCount(pages);

        // Render Page 1 to offscreen canvas
        const page = await pdf.getPage(1);
        if (isCancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const targetWidth = 320;
        const scale = targetWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (isCancelled) return;

          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setThumbUrl(dataUrl);
          if (onUpdateMetadata) {
            onUpdateMetadata(item.id, { pageCount: pages, thumbnailUrl: dataUrl });
          }
        }
      } catch (err) {
        console.warn("Could not generate PDF canvas thumbnail, using fallback preview", err);
      } finally {
        if (!isCancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    }

    generateThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [item.file, item.id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const rotation = item.rotation || 0;

  return (
    <div 
      draggable={true}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDragEnter={(e) => onDragEnter?.(e, index)}
      onDragLeave={(e) => onDragLeave?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      onDragEnd={(e) => onDragEnd?.(e)}
      className={`group relative bg-[#0d0d0d] hover:bg-[#111111] border rounded-2xl p-3 flex flex-col transition-all duration-200 shadow-lg cursor-grab active:cursor-grabbing select-none ${
        isDragging 
          ? "opacity-35 scale-95 border-dashed border-red-500 ring-2 ring-red-500/25" 
          : isDragOver
          ? "border-red-500 ring-2 ring-red-500 ring-offset-2 ring-offset-[#0a0a0a] scale-[1.03] bg-red-500/[0.04]"
          : "border-white/10 hover:border-white/25 hover:shadow-2xl"
      }`}
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-1 mb-2 px-1">
        {/* Order badge + Drag Grip */}
        <div className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
          <span className="w-6 h-6 rounded-full bg-white/10 text-white/90 text-xs font-bold font-mono flex items-center justify-center border border-white/10">
            {index + 1}
          </span>
          {rotation !== 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-medium">
              {rotation}°
            </span>
          )}
        </div>

        {/* Reorder and Delete controls */}
        <div 
          className="flex items-center gap-1"
          draggable={false}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onMoveLeft(index)}
            disabled={index === 0}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
            title="Move earlier (or drag card)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveRight(index)}
            disabled={index === total - 1}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent rounded transition-colors"
            title="Move later (or drag card)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors ml-0.5"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Thumbnail Container */}
      <div 
        onClick={() => onPreview(index)}
        className="relative w-full aspect-[1/1.38] bg-white rounded-xl shadow-inner overflow-hidden cursor-pointer flex items-center justify-center group/thumb border border-white/5 select-none"
      >
        {/* Rendered Thumbnail Image */}
        {thumbUrl ? (
          <div 
            className="w-full h-full flex items-center justify-center p-1 transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <img
              src={thumbUrl}
              alt={item.file.name}
              className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm"
            />
          </div>
        ) : (
          /* Loading or Fallback Mockup */
          <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-xs font-medium">Generating preview...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div className="w-6 h-6 rounded bg-red-500/10 text-red-600 font-bold text-[10px] flex items-center justify-center">
                    PDF
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Page 1</span>
                </div>
                <div className="space-y-2 py-2 opacity-60">
                  <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center justify-center py-2 text-gray-400">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Hover Action Overlay */}
        <div 
          className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3 backdrop-blur-[2px]"
          draggable={false}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(index);
            }}
            className="w-full max-w-[140px] py-2 px-3 bg-white text-black font-semibold text-xs rounded-lg shadow-lg hover:bg-white/90 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick Preview
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate(index);
            }}
            className="w-full max-w-[140px] py-2 px-3 bg-white/20 hover:bg-white/30 text-white font-medium text-xs rounded-lg backdrop-blur-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Rotate 90°
          </button>
        </div>
      </div>

      {/* Card Footer / File Details */}
      <div className="mt-3 px-1">
        <h4 
          className="text-white/90 text-xs font-medium truncate hover:text-white transition-colors cursor-pointer"
          title={item.file.name}
          onClick={() => onPreview(index)}
        >
          {item.file.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-white/50 mt-1">
          <span>{formatFileSize(item.file.size)}</span>
          {pageCount !== null && (
            <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
