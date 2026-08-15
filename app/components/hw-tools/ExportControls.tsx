import { useState } from 'react';
import { copySvgAsPng, downloadSvg } from '../../utils/hw-tools/svgExport';

export interface ExportControlsProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  disabled: boolean;
  filenameBase: string;
}

type Status = { text: string; tone: 'ok' | 'error' } | null;

export default function ExportControls({ svgRef, disabled, filenameBase }: ExportControlsProps) {
  const [status, setStatus] = useState<Status>(null);

  const handleCopyPng = async () => {
    if (!svgRef.current) return;
    try {
      const result = await copySvgAsPng(svgRef.current);
      setStatus({
        tone: 'ok',
        text:
          result === 'copied'
            ? 'Copied. Paste into Word with Ctrl+V.'
            : 'Your browser blocked the clipboard, so the PNG downloaded instead.',
      });
    } catch {
      setStatus({ tone: 'error', text: 'The image could not be built. Try again.' });
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    try {
      downloadSvg(svgRef.current, `${filenameBase}.svg`);
      setStatus({
        tone: 'ok',
        text: 'Downloaded. In Word, use Insert > Pictures to place it at full vector quality.',
      });
    } catch {
      setStatus({ tone: 'error', text: 'The file could not be built. Try again.' });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopyPng}
        disabled={disabled}
        title={disabled ? 'Build something first' : 'Copy the diagram as an image'}
        className="btn btn-primary"
      >
        Copy as PNG
      </button>
      <button
        type="button"
        onClick={handleDownloadSvg}
        disabled={disabled}
        title={disabled ? 'Build something first' : 'Download a vector file'}
        className="btn"
      >
        Download SVG
      </button>
      {/*
        aria-live so the outcome reaches a screen reader — copying is silent
        and otherwise gives no feedback at all that it worked.
      */}
      <span
        role="status"
        aria-live="polite"
        className="u-note"
        style={{ color: status?.tone === 'error' ? 'var(--marker)' : 'var(--ink-soft)' }}
      >
        {status?.text ?? ''}
      </span>
    </>
  );
}
