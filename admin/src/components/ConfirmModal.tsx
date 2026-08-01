import React from 'react';
import { AlertTriangle, Trash2, Info, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          disabled={isLoading}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title Header */}
        {renderIcon()}

        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
          {title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-60 ${getConfirmButtonClasses()}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
