const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

const tools = [
  { name: 'Word to PDF', slug: 'word-to-pdf' },
  { name: 'Image to PDF', slug: 'image-to-pdf' },
  { name: 'Excel to PDF', slug: 'excel-to-pdf' },
  { name: 'PDF to Word', slug: 'pdf-to-word' },
  { name: 'Organize PDF', slug: 'organize-pdf' },
  { name: 'PDF to PDF/A', slug: 'pdf-to-pdfa' },
  { name: 'Repair PDF', slug: 'repair-pdf' },
  { name: 'Scan to PDF', slug: 'scan-to-pdf' },
  { name: 'Compare PDF', slug: 'compare-pdf' },
  { name: 'Redact PDF', slug: 'redact-pdf' },
  { name: 'Crop PDF', slug: 'crop-pdf' },
  { name: 'PDF Forms', slug: 'pdf-forms' },
  { name: 'AI Summarizer', slug: 'ai-summarizer' },
  { name: 'Translate PDF', slug: 'translate-pdf' },
  { name: 'PDF to Markdown', slug: 'pdf-to-markdown' },
  { name: 'PDF to Text', slug: 'pdf-to-text' }
];

for (const tool of tools) {
  const regex = new RegExp(`name: "${tool.name}",\\s*description: "([^"]+)",\\s*icon: ([^,]+),\\s*href: "[^"]+"`, 'g');
  content = content.replace(regex, `name: "${tool.name}",\n      description: "$1",\n      icon: $2,\n      href: "/tools/${tool.slug}"`);
}

fs.writeFileSync('src/app/page.tsx', content);
