import { createContext, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { NotificationEventHandler } from '@/event-dispatchers/notification-event-handler';

type ContextValue = {};

const Context = createContext<ContextValue>({});

type Props = {
  children: React.ReactNode;
};

function Provider({ children }: Props) {
  const notificationEventHandler = useMemo(() => NotificationEventHandler.create(), []);

  useEffect(() => {
    return notificationEventHandler.subscribeErrorMessage((message) => {
      toast.error(message, {
        duration: 3000,
      });
    });
  }, [notificationEventHandler]);

  useEffect(() => {
    return notificationEventHandler.subscribeGeneralMessage((message) => {
      toast.success(message, {
        duration: 3000,
      });
    });
  }, [notificationEventHandler]);

  return (
    <Context.Provider value={useMemo<ContextValue>(() => ({}), [])}>
      <Toaster />
      {children}
    </Context.Provider>
  );
}

export { Provider as NotificationProvider, Context as NotificationContext };
