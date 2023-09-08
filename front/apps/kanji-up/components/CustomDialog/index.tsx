import React from 'react';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';

export default function CustomDialog({ visible, message, actions, onCancel, onDismiss, onSave, ...props }: CustomDialogProps) {
  return (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{message.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message.description}</Paragraph>
          {props.children}
        </Dialog.Content>
        <Dialog.Actions style={{ flexWrap: 'wrap' }}>
          {((actions && actions[0]) || false) && <Button onPress={onCancel}>Don't save</Button>}
          {((actions && actions[1]) || false) && (
            <Button mode="contained" onPress={onSave}>
              Save
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
