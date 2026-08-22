import React, { useState, useEffect } from 'react';
import { IconAlert, IconClose } from './icons/Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  requireVerificationText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = React.memo(({
  isOpen,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  isDanger = true,
  requireVerificationText,
  onConfirm,
  onCancel,
}) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isVerificationRequired = !!requireVerificationText;
  const isMatch = !isVerificationRequired || inputText.trim() === requireVerificationText.trim();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xl animate-fade-in">
      <div className="apple-glass-modal w-full max-w-md p-6 shadow-2xl relative border border-white/80">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-xl hover:bg-white/40"
        >
          <IconClose size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
              isDanger
                ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                : 'bg-sky-500/15 text-sky-600 border border-sky-500/30'
            }`}
          >
            <IconAlert size={22} />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">{title}</h3>
        </div>

        <p className="font-body text-sm text-slate-700 leading-relaxed mb-5">{message}</p>

        {isVerificationRequired && (
          <div className="space-y-2.5 mb-6 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                تأكيد الحماية: اكتب كلمة <span className="font-bold text-rose-600 select-all">"{requireVerificationText}"</span>
              </label>
              <button
                type="button"
                onClick={() => setInputText(requireVerificationText)}
                className="text-[11px] font-bold text-sky-700 hover:underline px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/25"
              >
                تعبئة تلقائية
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`اكتب "${requireVerificationText}" هنا لتأكيد الحذف...`}
              className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-slate-900 text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold liquid-glass-button text-slate-700 hover:text-slate-900 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={!isMatch}
            onClick={() => {
              if (isMatch) onConfirm();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isMatch
                ? 'bg-slate-300/50 text-slate-400 cursor-not-allowed opacity-50'
                : isDanger
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-500/25 hover:scale-[1.02] border border-white/20'
                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-500/25 hover:scale-[1.02] border border-white/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

