'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface AlertContextType {
  showAlert: (alert: Omit<AlertMessage, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showAlert = (alert: Omit<AlertMessage, 'id'>) => {
    const id = Date.now().toString();
    const newAlert = { ...alert, id };
    setAlerts(prev => [...prev, newAlert]);

    // Auto remove after duration
    setTimeout(() => {
      removeAlert(id);
    }, alert.duration || 5000);
  };

  const showSuccess = (message: string, title?: string) => {
    showAlert({ type: 'success', message, title });
  };

  const showError = (message: string, title?: string) => {
    showAlert({ type: 'error', message, title });
  };

  const showWarning = (message: string, title?: string) => {
    showAlert({ type: 'warning', message, title });
  };

  const showInfo = (message: string, title?: string) => {
    showAlert({ type: 'info', message, title });
  };

  const getIcon = (type: AlertMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: AlertMessage['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'default';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={getVariant(alert.type)}
            className="shadow-lg transition-all duration-300 ease-in-out animate-in slide-in-from-right-full"
          >
            {getIcon(alert.type)}
            <div className="flex-1">
              {alert.title && (
                <AlertTitle>{alert.title}</AlertTitle>
              )}
              <AlertDescription>
                {alert.message}
              </AlertDescription>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        ))}
      </div>
    </AlertContext.Provider>
  );
}