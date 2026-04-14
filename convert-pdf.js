const fs = require('fs');
const path = require('path');

async function convert() {
  // Dynamic import for ESM module
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const pdfPath = path.join(__dirname, 'frontend', 'CamScanner.pdf');
  const outputPath = path.join(__dirname, 'frontend', 'public', 'camscanner-qr.png');
  
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  
  const scale = 3; // High quality
  const viewport = page.getViewport({ scale });
  
  // Use node-canvas-like approach via OffscreenCanvas or a simple approach
  // Since we're in Node, let's use a simpler PNG generation
  const { createCanvas } = await import('canvas');
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  
  await page.render({
    canvasContext: ctx,
    viewport: viewport
  }).promise;
  
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buf);
  console.log('Saved to:', outputPath);
}

convert().catch(console.error);
