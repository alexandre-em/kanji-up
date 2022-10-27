import React from 'react';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';

export default function CustomDialog({ visible, message, onCancel, onDismiss, onSave }: CustomDialogProps) {
  return (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{message.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message.description}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions style={{ flexWrap: 'wrap' }}>
          <Button style={{ borderRadius: 25 }} onPress={onCancel}>Don't save</Button>
          <Button style={{ borderRadius: 25 }} mode="contained" onPress={onSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
};
