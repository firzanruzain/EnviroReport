import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { View, Text } from "react-native";
import {
  Portal,
  Dialog,
  Button,
  RadioButton,
  ActivityIndicator,
} from "react-native-paper";
import { ReportStatus } from "models/report";

export type StatusUpdateModalRef = {
  open: () => void;
  close: () => void;
};

interface StatusUpdateModalProps {
  currentStatus: ReportStatus;
  onUpdateStatus: (newStatus: ReportStatus) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const STATUS_OPTIONS: {
  value: ReportStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "Pending",
    label: "Pending",
    description: "Report is waiting for review",
  },
  {
    value: "In Review",
    label: "In Review",
    description: "Report is currently being reviewed",
  },
  {
    value: "Closed",
    label: "Closed",
    description: "Report has been resolved and closed",
  },
];

export const StatusUpdateModal = forwardRef<
  StatusUpdateModalRef,
  StatusUpdateModalProps
>(({ currentStatus, onUpdateStatus, isLoading = false, error = null }, ref) => {
  const [visible, setVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<ReportStatus>(currentStatus);
  const prevLoadingRef = useRef(isLoading);

  useImperativeHandle(ref, () => ({
    open: () => {
      setSelectedStatus(currentStatus); // Reset to current status when opening
      setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  }));

  // Update selectedStatus when currentStatus prop changes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  // Automatically close dialog when loading transitions from true to false
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      setVisible(false);
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleUpdate = async () => {
    if (selectedStatus !== currentStatus) {
      await onUpdateStatus(selectedStatus);
    }
  };

  const handleDismiss = () => {
    if (!isLoading) {
      setSelectedStatus(currentStatus); // Reset to current status
      setVisible(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Update Report Status</Dialog.Title>
        <Dialog.Content>
          <View className="mb-4">
            <Text className="text-lg font-pSemiBold mb-2">Current Status:</Text>
            <Text className="text-base font-pMedium text-slate-600">
              {currentStatus}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-lg font-pSemiBold mb-2">
              Select New Status:
            </Text>
            <RadioButton.Group
              onValueChange={(value) =>
                setSelectedStatus(value as ReportStatus)
              }
              value={selectedStatus}
            >
              {STATUS_OPTIONS.map((option) => (
                <View key={option.value} className="mb-3">
                  <RadioButton.Item
                    label={option.label}
                    value={option.value}
                    disabled={isLoading}
                  />
                  <Text className="text-sm text-slate-500 ml-12 -mt-2">
                    {option.description}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </View>

          {error && <Text className="text-red-500 text-sm mb-2">{error}</Text>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleUpdate}
            loading={isLoading}
            disabled={isLoading || selectedStatus === currentStatus}
          >
            Update Status
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

export default StatusUpdateModal;
