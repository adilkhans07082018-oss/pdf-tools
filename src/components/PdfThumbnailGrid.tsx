"use client";

import { useState, useRef } from "react";
import { Plus, LayoutGrid, List, ArrowDownAZ, Trash2, FileText, Eye, RotateCw, ChevronUp, ChevronDown, X, GripVertical } from "lucide-react";
import PdfThumbnailCard from "./PdfThumbnailCard";
import PdfPreviewModal, { type PdfFileItem } from "./PdfPreviewModal";

interface PdfThumbnailGridProps {
  items: PdfFileItem[];
  onItemsChange: (items: PdfFileItem[]) => void;
  onAddFiles: (files: FileList) => void;
  onClearAll: () => void;
}

export default function PdfThumbnailGrid({
  items,
  onItemsChange,
  onAddFiles,
  onClearAll,
}: PdfThumbnailGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isExternalDraggingOver, setIsExternalDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onItemsChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onItemsChange(updated);
    if (previewIndex !== null) {
      if (updated.length === 0) {
        setPreviewIndex(null);
      } else if (previewIndex >= updated.length) {
        setPreviewIndex(updated.length - 1);
      }
    }
  };

  const handleRotate = (index: number) => {
    const updated = [...items];
    const currentRot = updated[index].rotation || 0;
    updated[index] = {
      ...updated[index],
      rotation: (currentRot + 90) % 360,
    };
    onItemsChange(updated);
  };

  const handleSortAlphabetical = () => {
    const sorted = [...items].sort((a, b) => a.file.name.localeCompare(b.file.name));
    onItemsChange(sorted);
  };

  const handleUpdateMetadata = (id: string, metadata: { pageCount?: number; thumbnailUrl?: string }) => {
    onItemsChange(
      items.map((it) => (it.id === id ? { ...it, ...metadata } : it))
    );
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Card Drag-and-Drop Handlers
  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    e.dataTransfer.dropEffect = "move";
  };

  const handleCardDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleCardDragLeave = (e: React.DragEvent, index: number) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverIndex === index) {
        setDragOverIndex(null);
      }
    }
  };

  const handleCardDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Internal card reorder
    if (draggedIndex !== null) {
      if (draggedIndex !== dropIndex) {
        handleMove(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // External file dropped on card
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleCardDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Outer container drag-and-drop (for external files)
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null && e.dataTransfer.types.includes("Files")) {
      setIsExternalDraggingOver(true);
    }
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsExternalDraggingOver(false);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsExternalDraggingOver(false);
    if (draggedIndex === null && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div 
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
      className={`w-full bg-[#0a0a0a] border rounded-2xl p-4 sm:p-6 shadow-xl mb-8 flex flex-col transition-colors duration-200 ${
        isExternalDraggingOver ? "border-red-500 bg-red-500/[0.03]" : "border-white/10"
      }`}
    >
      {/* Hidden file input for adding more files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-base sm:text-lg">
              Files to Merge
            </h3>
            <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
              {items.length}
            </span>
          </div>
          <p className="text-xs text-white/60 mt-0.5 flex items-center gap-1.5">
            <span>✨ Drag cards to adjust merge order.</span>
            <span className="text-white/40">Files will merge from #1 to #{items.length}.</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
              }`}
              title="Large Thumbnail Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort A-Z */}
          {items.length > 1 && (
            <button
              onClick={handleSortAlphabetical}
              className="py-1.5 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
              title="Sort files by name A to Z"
            >
              <ArrowDownAZ className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort A-Z</span>
            </button>
          )}

          {/* Add more files button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-1.5 px-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add More
          </button>

          {/* Clear all */}
          <button
            onClick={onClearAll}
            className="py-1.5 px-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-medium text-red-400 transition-colors flex items-center gap-1"
            title="Remove all files"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Grid View (Large Thumbnails with Drag Reordering) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <PdfThumbnailCard
              key={item.id}
              item={item}
              index={idx}
              total={items.length}
              isDragging={draggedIndex === idx}
              isDragOver={dragOverIndex === idx}
              onDragStart={handleCardDragStart}
              onDragOver={handleCardDragOver}
              onDragEnter={handleCardDragEnter}
              onDragLeave={handleCardDragLeave}
              onDrop={handleCardDrop}
              onDragEnd={handleCardDragEnd}
              onPreview={(i) => setPreviewIndex(i)}
              onRotate={(i) => handleRotate(i)}
              onMoveLeft={(i) => handleMove(i, i - 1)}
              onMoveRight={(i) => handleMove(i, i + 1)}
              onDelete={(i) => handleDelete(i)}
              onUpdateMetadata={handleUpdateMetadata}
            />
          ))}

          {/* Add More Dashed Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group/add min-h-[260px] border-2 border-dashed border-white/15 hover:border-red-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.02] hover:bg-red-500/[0.04] transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 group-hover/add:bg-red-500/20 text-white/50 group-hover/add:text-red-400 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-white/80 group-hover/add:text-white">
                Add more files
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                or click to browse
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* List View (with Drag Reordering) */
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => handleCardDragStart(e, idx)}
              onDragOver={(e) => handleCardDragOver(e, idx)}
              onDragEnter={(e) => handleCardDragEnter(e, idx)}
              onDragLeave={(e) => handleCardDragLeave(e, idx)}
              onDrop={(e) => handleCardDrop(e, idx)}
              onDragEnd={handleCardDragEnd}
              className={`flex items-center justify-between p-3 rounded-xl transition-all gap-3 cursor-grab active:cursor-grabbing select-none border ${
                draggedIndex === idx
                  ? "opacity-35 scale-[0.98] border-dashed border-red-500 bg-red-500/10"
                  : dragOverIndex === idx
                  ? "border-red-500 ring-2 ring-red-500 scale-[1.01] bg-red-500/[0.06]"
                  : "bg-white/5 hover:bg-white/[0.07] border-white/5 hover:border-white/15"
              }`}
            >
              {/* Left: Grip + Index + Icon + Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <GripVertical className="w-4 h-4 text-white/30 hover:text-white/60 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                <span className="w-6 h-6 rounded-full bg-white/10 text-white/80 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p 
                    className="text-sm font-medium text-white/90 truncate cursor-pointer hover:text-white"
                    title={item.file.name}
                    onClick={() => setPreviewIndex(idx)}
                  >
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{formatFileSize(item.file.size)}</span>
                    {item.pageCount && (
                      <>
                        <span>•</span>
                        <span>{item.pageCount} {item.pageCount === 1 ? "page" : "pages"}</span>
                      </>
                    )}
                    {Boolean(item.rotation) && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">{item.rotation}°</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Controls */}
              <div 
                className="flex items-center gap-1.5 flex-shrink-0"
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewIndex(idx)}
                  className="p-1.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-lg transition-colors"
                  title="Preview PDF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRotate(idx)}
                  className="p-1.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-lg transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 rounded transition-colors"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(idx, idx + 1)}
                  disabled={idx === items.length - 1}
                  className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 rounded transition-colors"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      <PdfPreviewModal
        isOpen={previewIndex !== null}
        files={items}
        currentIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNavigate={(newIdx) => setPreviewIndex(newIdx)}
        onDelete={(delIdx) => handleDelete(delIdx)}
        onRotate={(rotIdx) => handleRotate(rotIdx)}
      />
    </div>
  );
}
