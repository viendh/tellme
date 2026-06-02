import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, type ReactNode,
} from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

// ─── Context ─────────────────────────────────────────────────────────────────

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANTS: Record<ConfirmVariant, {
  iconBg: string;
  iconColor: string;
  Icon: typeof Trash2;
  confirmBtn: string;
  ring: string;
}> = {
  danger: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    Icon: Trash2,
    confirmBtn: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 text-white',
    ring: 'ring-red-100',
  },
  warning: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    Icon: AlertTriangle,
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400 text-white',
    ring: 'ring-amber-100',
  },
  info: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    Icon: Info,
    confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 text-white',
    ring: 'ring-blue-100',
  },
};

// ─── Dialog component ─────────────────────────────────────────────────────────

interface DialogProps extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ title, description, confirmLabel, cancelLabel, variant = 'info', onConfirm, onCancel }: DialogProps) {
  const cfg = VARIANTS[variant];
  const { Icon } = cfg;
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on open; Escape → cancel
  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      {/* Card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ring-1 ${cfg.ring} w-full max-w-[400px] overflow-hidden`}>
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded-lg hover:bg-gray-50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.iconBg}`}>
            <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
          </div>

          {/* Text */}
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {cancelLabel ?? 'Hủy'}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${cfg.confirmBtn}`}
            >
              {confirmLabel ?? 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface State extends ConfirmOptions {
  resolve: (v: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <ConfirmDialog
          {...state}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}
