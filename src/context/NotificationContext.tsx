import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AlertModal } from '../components/ui';

type AlertType = 'success' | 'error';

type AlertState = {
  open: boolean;
  type: AlertType;
  title: string;
  message: string;
};

type NotifyOptions = {
  type: AlertType;
  message: string;
  title?: string;
};

type NotificationContextValue = {
  notify: (options: NotifyOptions) => void;
  notifySuccess: (message: string, title?: string) => void;
  notifyError: (message: string, title?: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const defaultTitles: Record<AlertType, string> = {
  success: 'Success',
  error: 'Something went wrong',
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    type: 'success',
    title: defaultTitles.success,
    message: '',
  });

  const close = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const notify = useCallback(({ type, message, title }: NotifyOptions) => {
    setAlert({
      open: true,
      type,
      message,
      title: title ?? defaultTitles[type],
    });
  }, []);

  const notifySuccess = useCallback(
    (message: string, title?: string) => notify({ type: 'success', message, title }),
    [notify]
  );

  const notifyError = useCallback(
    (message: string, title?: string) => notify({ type: 'error', message, title }),
    [notify]
  );

  const value = useMemo(
    () => ({ notify, notifySuccess, notifyError }),
    [notify, notifySuccess, notifyError]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <AlertModal
        open={alert.open}
        onClose={close}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotify must be used within NotificationProvider');
  }
  return ctx;
}
