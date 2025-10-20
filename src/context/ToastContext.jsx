import { createContext, useState, useCallback } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    // auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback(
    (message, duration) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message, duration) => showToast(message, 'error', duration),
    [showToast]
  );

  const warning = useCallback(
    (message, duration) => showToast(message, 'warning', duration),
    [showToast]
  );

  const info = useCallback(
    (message, duration) => showToast(message, 'info', duration),
    [showToast]
  );

  const value = {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
