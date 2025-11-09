import { useState, useCallback } from 'react';
import Alert, { AlertType } from '../components/Shared/Alert';

export interface AlertOptions {
  type: AlertType;
  message: string;
  duration?: number;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((type: AlertType, message: string, duration?: number) => {
    setAlert({ type, message, duration });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const AlertComponent = alert ? (
    <Alert
      type={alert.type}
      message={alert.message}
      onClose={hideAlert}
      duration={alert.duration}
    />
  ) : null;

  return { showAlert, hideAlert, AlertComponent };
}

