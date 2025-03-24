import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}: NotificationProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-lg ${bgColor} ${borderColor}`}>
      <Icon className={`h-5 w-5 ${iconColor} mr-3`} />
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-6 ${textColor} hover:opacity-75`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}