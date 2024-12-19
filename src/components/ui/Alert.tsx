import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type, message, onClose, className = '' }: AlertProps) {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-center gap-2 p-4 rounded-md border ${styles[type]} ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}