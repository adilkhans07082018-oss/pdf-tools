"use client";

import Link from "next/link";
import { Download, ArrowLeft, Trash2, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface SuccessScreenProps {
  title: string;
  downloadUrl: string;
  downloadFilename: string;
  onStartOver: () => void;
  colorScheme?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo";
}

export default function SuccessScreen({
  title,
  downloadUrl,
  downloadFilename,
  onStartOver,
  colorScheme = "red",
}: SuccessScreenProps) {
  const colorStyles = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    purple: "bg-purple-600 hover:bg-purple-700",
    red: "bg-red-500 hover:bg-red-600",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  };

  const btnColor = colorStyles[colorScheme];

  const tools = [
    { name: "Compress PDF", href: "/tools/compress-pdf" },
    { name: "Split PDF", href: "/tools/split-pdf" },
    { name: "Merge PDF", href: "/tools/merge-pdf" },
    { name: "PDF to JPG", href: "/tools/pdf-to-jpg" },
    { name: "Protect PDF", href: "/tools/protect-pdf" },
    { name: "OCR PDF", href: "/tools/ocr-pdf" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center py-8"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
        {title}
      </h2>

      {/* Main Download Area */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="flex flex-col md:flex-row items-center gap-4 mb-16"
      >
        <button
          onClick={onStartOver}
          className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors shadow-lg flex-shrink-0 border border-white/10"
          title="Start Over"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <a
          href={downloadUrl}
          download={downloadFilename}
          className={`flex items-center justify-center gap-3 py-4 px-10 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 bg-white hover:bg-gray-200 w-full md:w-auto`}
        >
          <Download className="w-7 h-7" />
          Download PDF
        </a>

        <div className="flex gap-2">
          <button className="p-3 bg-white/5 text-white/70 rounded-full hover:bg-white/10 transition-colors border border-white/10" title="Delete">
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/5 text-white/70 rounded-full hover:bg-white/10 transition-colors border border-white/10" title="Copy Link">
            <LinkIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Continue To Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl bg-[#0a0a0a] border border-white/5 rounded-xl p-6 shadow-sm mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Continue to...</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="flex items-center justify-between p-3 border border-white/5 rounded-lg hover:bg-white/5 transition-all group"
            >
              <span className="text-sm font-medium text-white/60 group-hover:text-white">
                {tool.name}
              </span>
              <span className="text-white/30 group-hover:text-white/60">›</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Security Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
      >
        <div className="p-3 bg-white/10 text-white rounded-full flex-shrink-0">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Secure. Private. In your control.</h3>
          <p className="text-sm text-white/50 leading-relaxed">
            All files are processed entirely within your browser. No files are uploaded to any external server, ensuring complete privacy and security of your documents.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
