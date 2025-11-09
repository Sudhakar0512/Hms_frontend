import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Alert({ type, message, onClose, duration = 5000 }: AlertProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-600',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  };

  const { icon: Icon, bg, border, text, iconColor } = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[70] ${bg} ${border} border-l-4 rounded-lg shadow-lg p-4 max-w-md animate-slide-in`}
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 ${text} hover:opacity-75 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

