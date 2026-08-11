const XML_NS = 'http://www.w3.org/2000/svg';

function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', XML_NS);
  return new XMLSerializer().serializeToString(clone);
}

function svgToPngBlob(svg: SVGSVGElement, scale: number): Promise<Blob> {
  const svgString = serializeSvg(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = svg.viewBox.baseVal.width || svg.width.baseVal.value;
      const height = svg.viewBox.baseVal.height || svg.height.baseVal.value;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas produced no image data'));
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to rasterize SVG'));
    };
    image.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Rasterizes the SVG to PNG and writes it to the clipboard. Falls back to a file download if the Clipboard API or an image write isn't available. */
export async function copySvgAsPng(svg: SVGSVGElement, scale = 3): Promise<'copied' | 'downloaded'> {
  const blob = await svgToPngBlob(svg, scale);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return 'copied';
    } catch {
      // fall through to download
    }
  }
  downloadBlob(blob, 'diagram.png');
  return 'downloaded';
}

/** Downloads the SVG as a .svg file for true-vector insertion via Word's Insert > Pictures. */
export function downloadSvg(svg: SVGSVGElement, filename: string): void {
  const svgString = serializeSvg(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}
