"use client";

import { useState } from "react";
import Link from "next/link";
import { FileUp, SplitSquareHorizontal, Image as ImageIcon, Lock, Search, Settings, FileText, Presentation, Table, PenTool, Globe, Unlock, Pen, FileDigit, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const tools = [
    {
      name: "Merge PDF",
      description: "Combine multiple PDFs into one document.",
      icon: <FileUp className="w-5 h-5 text-white" />,
      href: "/tools/merge-pdf",
      category: "Organize PDF"
    },
    {
      name: "Split PDF",
      description: "Separate one PDF into multiple files.",
      icon: <SplitSquareHorizontal className="w-5 h-5 text-white" />,
      href: "/tools/split-pdf",
      category: "Organize PDF"
    },
    {
      name: "Remove Pages",
      description: "Delete unwanted pages from your PDF.",
      icon: <FileUp className="w-5 h-5 text-white" />,
      href: "/tools/remove-pages",
      category: "Organize PDF"
    },
    {
      name: "Word to PDF",
      description: "Convert DOCX to high-quality PDF.",
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "/tools/word-to-pdf",
      category: "Convert to PDF"
    },
    {
      name: "Image to PDF",
      description: "Convert JPG, PNG, and WebP to PDF.",
      icon: <ImageIcon className="w-5 h-5 text-white" />,
      href: "/tools/image-to-pdf",
      category: "Convert to PDF"
    },
    {
      name: "Excel to PDF",
      description: "Convert spreadsheets to PDF.",
      icon: <Table className="w-5 h-5 text-white" />,
      href: "/tools/excel-to-pdf",
      category: "Convert to PDF"
    },
    {
      name: "PDF to Word",
      description: "Turn PDF into editable Word docs.",
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "/tools/pdf-to-word",
      category: "Convert from PDF"
    },
    {
      name: "PDF to JPG",
      description: "Extract images from your PDF.",
      icon: <ImageIcon className="w-5 h-5 text-white" />,
      href: "/tools/pdf-to-jpg",
      category: "Convert from PDF"
    },
    {
      name: "PDF to Text",
      description: "Extract text from your PDF file.",
      icon: <Search className="w-5 h-5 text-white" />,
      href: "/tools/pdf-to-text",
      category: "Convert from PDF"
    },
    {
      name: "Compress PDF",
      description: "Reduce file size without losing quality.",
      icon: <Settings className="w-5 h-5 text-white" />,
      href: "/tools/compress-pdf",
      category: "Optimize & Security"
    },
    {
      name: "OCR PDF",
      description: "Make scanned PDFs searchable and editable.",
      icon: <Search className="w-5 h-5 text-white" />,
      href: "/tools/ocr-pdf",
      category: "Optimize & Security"
    },
    {
      name: "Protect PDF",
      description: "Add a password and encrypt your PDF.",
      icon: <Lock className="w-5 h-5 text-white" />,
      href: "/tools/protect-pdf",
      category: "Optimize & Security"
    },
    {
      name: "Organize PDF",
      description: "Sort, add or delete PDF pages at your convenience.",
      icon: <FileUp className="w-5 h-5 text-white" />,
      href: "/tools/organize-pdf",
      category: "Organize PDF"
    },
    {
      name: "PDF to PDF/A",
      description: "Transform your PDF to PDF/A, the ISO-standardized version.",
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "/tools/pdf-to-pdfa",
      category: "Convert to PDF"
    },
    {
      name: "Repair PDF",
      description: "Repair a damaged PDF and recover data from corrupt files.",
      icon: <Settings className="w-5 h-5 text-white" />,
      href: "/tools/repair-pdf",
      category: "Optimize & Security"
    },
    {
      name: "Page Numbers",
      description: "Add page numbers into PDFs with ease.",
      icon: <FileUp className="w-5 h-5 text-white" />,
      href: "/tools/page-numbers",
      category: "Organize PDF"
    },
    {
      name: "Scan to PDF",
      description: "Capture document scans instantly to your browser.",
      icon: <Search className="w-5 h-5 text-white" />,
      href: "/tools/scan-to-pdf",
      category: "Convert to PDF"
    },
    {
      name: "Compare PDF",
      description: "Show a side-by-side document comparison easily.",
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "/tools/compare-pdf",
      category: "Optimize & Security"
    },
    {
      name: "Redact PDF",
      description: "Redact text and graphics to permanently remove sensitive information.",
      icon: <Lock className="w-5 h-5 text-white" />,
      href: "/tools/redact-pdf",
      category: "Optimize & Security"
    },
    {
      name: "Crop PDF",
      description: "Crop margins of PDF documents or select specific areas.",
      icon: <FileUp className="w-5 h-5 text-white" />,
      href: "/tools/crop-pdf",
      category: "Organize PDF"
    },
    {
      name: "PDF Forms",
      description: "Detect form fields automatically or create interactive fillable PDFs.",
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "/tools/pdf-forms",
      category: "Organize PDF"
    },
    {
      name: "AI Summarizer",
      description: "Quickly generate concise summaries from articles and essays.",
      icon: <Search className="w-5 h-5 text-white" />,
      href: "/tools/ai-summarizer",
      category: "Optimize & Security"
    },
    {
      name: "Translate PDF",
      description: "Easily translate PDF files powered by AI.",
      icon: <Globe className="w-5 h-5 text-white" />,
      href: "/tools/translate-pdf",
      category: "Optimize & Security"
    },
    {
      name: "PDF to Markdown",
      description: "Easily turn PDFs into Markdown files.",
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "/tools/pdf-to-markdown",
      category: "Convert from PDF"
    }
  ];

  const categories = ["Organize PDF", "Convert to PDF", "Convert from PDF", "Optimize & Security"];

  return (
    <div className="flex-1 w-full flex flex-col items-center overflow-hidden bg-[#050505]">
      {/* Hero Section */}
      <section className="w-full pt-24 pb-16 px-4 text-center flex flex-col items-center">
        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] tracking-widest font-bold text-white/70 mb-8">
          + 20 TOOLS • ONE VAULT
        </div>
        
        <h1 className="text-[48px] md:text-[64px] font-bold tracking-tight text-white mb-6 leading-tight max-w-2xl">
          Solve every <span className="text-gray-400">PDF</span> problem.
        </h1>
        
        <p className="text-[15px] text-white/50 max-w-xl mx-auto font-light leading-relaxed mb-12">
          The world's most secure, private document hub. No tracking, no storage — every file is shredded the moment your download completes.
        </p>

        {/* Search Bar Placeholder */}
        <div className="w-full max-w-md relative flex items-center">
          <Search className="w-4 h-4 text-white/30 absolute left-4" />
          <input 
            type="text" 
            placeholder="Find a tool — merge, compress, protect..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </section>

      {/* Grouped Tools Grid Section */}
      <section className="w-full max-w-[1200px] mx-auto pb-32 px-6 lg:px-12 flex flex-col gap-16">
        {categories.map((category) => (
          <div key={category} className="flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-white font-semibold text-sm tracking-wide">{category}</h2>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tools.filter(t => t.category === category).map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="flex flex-col p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl hover:border-white/20 hover:bg-[#0f0f0f] transition-all duration-300 group"
                >
                  <div className="mb-4 flex items-center justify-center w-10 h-10 bg-white/5 rounded-lg border border-white/5">
                    {tool.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{tool.name}</h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-6 flex-1">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 group-hover:text-white/70 transition-colors">INITIALIZE NODE</span>
                    <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

