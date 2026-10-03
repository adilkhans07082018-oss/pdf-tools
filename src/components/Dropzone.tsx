"use client";

import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DropzoneProps {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
  colorScheme?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
  title?: string;
  subtitle?: string;
}

export default function Dropzone({
  onFileSelect,
  multiple = false,
  colorScheme = "blue",
  title = "Select PDF file",
  subtitle = "or drop PDF or folder here",
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.items) {
      const files: File[] = [];
      const promises: Promise<void>[] = [];

      const readEntry = (entry: any): Promise<void> => {
        return new Promise((resolve) => {
          if (entry.isFile) {
            entry.file((file: File) => {
              if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
                files.push(file);
              }
              resolve();
            });
          } else if (entry.isDirectory) {
            const reader = entry.createReader();
            reader.readEntries((entries: any[]) => {
              const entryPromises = entries.map(e => readEntry(e));
              Promise.all(entryPromises).then(() => resolve());
            });
          } else {
            resolve();
          }
        });
      };

      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;
          if (entry) {
            promises.push(readEntry(entry));
          }
        }
      }

      await Promise.all(promises);
      
      if (files.length > 0) {
        // Create a mock FileList object since we can't construct a real one easily
        // But our components expect a FileList or array. Wait, our components expect FileList.
        // Actually, we can just pass an array of files if the components are flexible.
        // Let's create a DataTransfer object to generate a real FileList.
        const dt = new DataTransfer();
        files.forEach(f => dt.items.add(f));
        onFileSelect(dt.files);
      }
    } else {
      // Fallback for older browsers
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  const colorStyles = {
    blue: "border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-500",
    green: "border-green-400 bg-green-50 hover:bg-green-100 text-green-500",
    yellow: "border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-500",
    purple: "border-purple-400 bg-purple-50 hover:bg-purple-100 text-purple-500",
    red: "border-red-400 bg-red-50 hover:bg-red-100 text-red-500",
    indigo: "border-indigo-400 bg-indigo-50 hover:bg-indigo-100 text-indigo-500",
  };

  const dragStyles = isDragging ? "border-solid bg-white/5 scale-[1.02]" : "border-dashed";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "w-full border-2 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer mb-8 transition-all duration-200",
        "border-white/20 bg-[#0a0a0a] hover:bg-white/5 text-white/80 hover:border-white/40",
        dragStyles
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud className="w-16 h-16 mb-4 opacity-50" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-50">{subtitle}</p>
      <input
        type="file"
        multiple={multiple}
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
      />
    </motion.div>
  );
}
