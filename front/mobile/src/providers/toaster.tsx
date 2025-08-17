import React, { useCallback } from 'react';
import Incubator from 'react-native-ui-lib/incubator';

const { Toast } = Incubator;

type ToasterType = 'success' | 'failure' | 'general' | 'loading';

export type ToasterContextValueType = {
  message: string | null;
  type: ToasterType | null;
  show: (payload: { message: string; type: ToasterType }) => void;
};

const ToasterContext = React.createContext<ToasterContextValueType | null>(null);

export function useToaster() {
  return React.useContext(ToasterContext);
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = React.useState<string | null>(null);
  const [type, setType] = React.useState<ToasterType | null>(null);

  const show = useCallback((payload: { message: string; type: ToasterType }) => {
    setMessage(payload.message);
    setType(payload.type);
  }, []);

  const handleDismiss = useCallback(() => {
    setMessage(null);
    setType(null);
  }, []);

  return (
    <ToasterContext.Provider
      value={{
        message,
        type,
        show,
      }}>
      <Toast
        visible={!!message && !!type}
        position="top"
        message={message ?? ''}
        autoDismiss={3000}
        showLoader={type === 'loading'}
        swipeable
        preset={!type || type === 'loading' ? 'general' : type}
        onDismiss={handleDismiss}
      />
      {children}
    </ToasterContext.Provider>
  );
}
