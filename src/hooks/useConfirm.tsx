import { useState, useCallback } from 'react';
import ConfirmDialog from '../components/Shared/ConfirmDialog';

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    onConfirm: (() => void) | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    onConfirm: null,
    isLoading: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        onConfirm: () => resolve(true),
        isLoading: false,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, [confirmState.onConfirm]);

  const handleCancel = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setConfirmState((prev) => ({ ...prev, isLoading }));
  }, []);

  const ConfirmComponent = (
    <ConfirmDialog
      isOpen={confirmState.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={confirmState.options.title}
      message={confirmState.options.message}
      type={confirmState.options.type}
      confirmText={confirmState.options.confirmText}
      cancelText={confirmState.options.cancelText}
      isLoading={confirmState.isLoading}
    />
  );

  return { confirm, setLoading, ConfirmComponent };
}

