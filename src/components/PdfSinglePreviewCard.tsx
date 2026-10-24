"use client";

import { useState } from "react";
import { X, Eye } from "lucide-react";
import PdfThumbnailCard from "./PdfThumbnailCard";
import PdfPreviewModal, { type PdfFileItem } from "./PdfPreviewModal";

interface PdfSinglePreviewCardProps {
  file: File;
  onRemove: () => void;
  rotation?: number;
  onRotate?: (newRotation: number) => void;
  colorScheme?: "blue" | "green" | "red" | "purple" | "amber";
}

export default function PdfSinglePreviewCard({
  file,
  onRemove,
  rotation = 0,
  onRotate,
  colorScheme = "blue",
}: PdfSinglePreviewCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const fileItem: PdfFileItem = {
    id: `${file.name}-${file.size}`,
    file,
    rotation,
    pageCount,
    thumbnailUrl,
  };

  const handleUpdateMetadata = (_id: string, metadata: { pageCount?: number; thumbnailUrl?: string }) => {
    if (metadata.pageCount !== undefined) setPageCount(metadata.pageCount);
    if (metadata.thumbnailUrl !== undefined) setThumbnailUrl(metadata.thumbnailUrl);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-xl mb-6 flex flex-col items-center">
      {/* File Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/80 font-bold text-xs">
            PDF
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate" title={file.name}>
              {file.name}
            </h3>
            <p className="text-[11px] text-white/50">
              {(file.size / 1024).toFixed(1)} KB {pageCount ? `• ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors"
            title="Preview PDF"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Large Thumbnail Card */}
      <div className="w-full max-w-[280px]">
        <PdfThumbnailCard
          item={fileItem}
          index={0}
          total={1}
          onPreview={() => setIsPreviewOpen(true)}
          onRotate={() => {
            if (onRotate) {
              onRotate((rotation + 90) % 360);
            }
          }}
          onMoveLeft={() => {}}
          onMoveRight={() => {}}
          onDelete={onRemove}
          onUpdateMetadata={handleUpdateMetadata}
        />
      </div>

      {/* Full Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        files={[fileItem]}
        currentIndex={0}
        onClose={() => setIsPreviewOpen(false)}
        onNavigate={() => {}}
        onDelete={onRemove}
        onRotate={() => {
          if (onRotate) {
            onRotate((rotation + 90) % 360);
          }
        }}
      />
    </div>
  );
}
