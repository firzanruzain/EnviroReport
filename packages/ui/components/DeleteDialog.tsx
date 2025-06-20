import { View, Text } from "react-native";
import React, { useState } from "react";
import {
  List,
  useTheme,
  Menu,
  Portal,
  Dialog,
  Button,
} from "react-native-paper";

export type deleteDialogProps = {
  confirmDelete: () => void;
  deleteDialogVisible: boolean;
  deleteLoading: boolean;
  deleteError: string | null;
  cancelDelete: () => void;
};

export default function DeleteDialog({
  confirmDelete,
  deleteDialogVisible,
  deleteLoading,
  deleteError,
  cancelDelete,
}: deleteDialogProps) {
  return (
    <Portal>
      <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
        <Dialog.Title>Confirm Deletion</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to delete this form?</Text>
          {deleteError && (
            <Text style={{ color: "red", marginTop: 8 }}>{deleteError}</Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={cancelDelete} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            textColor="red"
            onPress={confirmDelete}
            loading={deleteLoading}
            disabled={deleteLoading}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
