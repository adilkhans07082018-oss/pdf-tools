"use client";

import { useState } from "react";
import PdfThumbnailCard from "./PdfThumbnailCard";
import PdfPreviewModal, { type PdfFileItem } from "./PdfPreviewModal";

interface PdfSinglePreviewCardProps {
  file: File;
  onRemove: () => void;
  rotation?: number;
  onRotate?: (newRotation: number) => void;
  colorScheme?: "blue" | "green" | "red" | "purple" | "yellow" | "orange" | "amber";
  children?: React.ReactNode;
}

export default function PdfSinglePreviewCard({
  file,
  onRemove,
  rotation = 0,
  onRotate,
  colorScheme = "blue",
  children,
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
    <div className="w-full flex flex-col items-center mb-8">
      {/* Centered Thumbnail Card Matching Grid Layout Exactly */}
      <div className="w-full max-w-[280px] sm:max-w-[300px]">
        <PdfThumbnailCard
          item={fileItem}
          index={0}
          total={1}
          onPreview={() => setIsPreviewOpen(true)}
          onRotate={onRotate ? () => onRotate((rotation + 90) % 360) : undefined}
          onDelete={onRemove}
          onUpdateMetadata={handleUpdateMetadata}
        />
      </div>

      {/* Optional Controls Slot (Password, inputs, settings) */}
      {children && (
        <div className="w-full max-w-sm mt-6 flex flex-col items-center">
          {children}
        </div>
      )}

      {/* Full Screen Interactive Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        files={[fileItem]}
        currentIndex={0}
        onClose={() => setIsPreviewOpen(false)}
        onNavigate={() => {}}
        onDelete={onRemove}
        onRotate={onRotate ? () => onRotate((rotation + 90) % 360) : undefined}
      />
    </div>
  );
}
