import React from 'react';

interface Props {
  isOpen: boolean;
  title?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const Modal: React.FC<Props> = ({
  isOpen,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  showCancel = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6">
          {title && <h3 className="text-xl font-bold text-white mb-2">{title}</h3>}
          <div className="text-sm text-slate-300">{children}</div>
        </div>
        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex justify-end gap-3">
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
