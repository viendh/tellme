import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExportExcel: () => void;
  onExportPdf: () => void;
  disabled?: boolean;
  count?: number;
}

export function ExportButton({ onExportExcel, onExportPdf, disabled, count }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = async (type: 'excel' | 'pdf', fn: () => void) => {
    setLoading(type);
    setOpen(false);
    try { await Promise.resolve(fn()); } finally { setLoading(null); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Xuất{count !== undefined ? ` (${count})` : ''}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
          <button
            onClick={() => handle('excel', onExportExcel)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Xuất Excel (.xlsx)
          </button>
          <button
            onClick={() => handle('pdf', onExportPdf)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-600" />
            Xuất PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
