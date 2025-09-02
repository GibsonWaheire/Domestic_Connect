import { useNotifications } from '@/contexts/NotificationContext';

export const useNotificationActions = () => {
  const { addNotification } = useNotifications();

  const showSuccessNotification = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      title,
      message,
      type: 'success',
      action
    });
  };

  const showErrorNotification = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      title,
      message,
      type: 'error',
      action
    });
  };

  const showWarningNotification = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      title,
      message,
      type: 'warning',
      action
    });
  };

  const showInfoNotification = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      title,
      message,
      type: 'info',
      action
    });
  };

  return {
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification
  };
};
