import { useState } from 'react';
import { copySvgAsPng, downloadSvg } from '../../utils/hw-tools/svgExport';

export interface ExportControlsProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  disabled: boolean;
  filenameBase: string;
}

export default function ExportControls({ svgRef, disabled, filenameBase }: ExportControlsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleCopyPng = async () => {
    if (!svgRef.current) return;
    try {
      const result = await copySvgAsPng(svgRef.current);
      setStatus(
        result === 'copied'
          ? 'Copied to clipboard — paste into Word with Ctrl+V.'
          : 'Clipboard copy unavailable — PNG downloaded instead.',
      );
    } catch {
      setStatus('Could not export image — try again.');
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, `${filenameBase}.svg`);
    setStatus('SVG downloaded — insert it in Word via Insert > Pictures for true vector quality.');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopyPng}
        disabled={disabled}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
      >
        Copy as PNG
      </button>
      <button
        type="button"
        onClick={handleDownloadSvg}
        disabled={disabled}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        Download SVG
      </button>
      {status && <span className="text-sm text-gray-600 dark:text-gray-300">{status}</span>}
    </div>
  );
}
