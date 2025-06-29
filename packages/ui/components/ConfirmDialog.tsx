import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Text } from "react-native";
import { Portal, Dialog, Button } from "react-native-paper";

export type ConfirmDialogRef = {
  open: () => void;
  close: () => void;
};

export type dialogProps = {
  confirm: () => void;
  loading: boolean;
  error: string | null;
  cancel?: () => void;
  title: string;
  message: string;
  buttonText?: string;
  showConfirmButton?: boolean;
  reverse?: boolean;
  extraActions?: { label: string; onPress: () => void }[];
};

export const ConfirmDialog = forwardRef<ConfirmDialogRef, dialogProps>(
  (
    {
      confirm,
      loading,
      error,
      cancel,
      title,
      message,
      buttonText,
      showConfirmButton = true,
      reverse = false,
      extraActions = [],
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const prevLoadingRef = React.useRef(loading);
    const prevErrorRef = React.useRef(error);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    // Automatically close dialog when loading transitions from true to false and there is no error
    React.useEffect(() => {
      if (
        prevErrorRef.current &&
        prevLoadingRef.current &&
        !loading &&
        !error
      ) {
        setVisible(false);
      }
      prevLoadingRef.current = loading;
    }, [loading, error, visible]);

    const handleCancel = () => {
      setVisible(false);
      if (cancel) cancel();
    };

    const handleConfirm = () => {
      confirm();
    };

    return (
      <Portal>
        <Dialog visible={visible} onDismiss={handleCancel}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Text>{message}</Text>
            {error && (
              <Text style={{ color: "red", marginTop: 8 }}>{error}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={handleCancel}
              disabled={loading}
              textColor={reverse ? "red" : undefined}
            >
              Cancel
            </Button>
            {showConfirmButton && (
              <Button
                textColor={reverse ? undefined : "red"}
                onPress={handleConfirm}
                loading={loading}
                disabled={loading}
              >
                {buttonText || "Delete"}
              </Button>
            )}
            {extraActions &&
              extraActions.map((action, idx) => (
                <Button key={idx} onPress={action.onPress} disabled={loading}>
                  {action.label}
                </Button>
              ))}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);
