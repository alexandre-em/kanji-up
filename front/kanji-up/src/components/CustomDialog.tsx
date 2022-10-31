import React from 'react';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';

export default function CustomDialog({ visible, message, component, actions, onCancel, onDismiss, onSave }: CustomDialogProps) {
  return (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{message.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message.description}</Paragraph>
          {component}
        </Dialog.Content>
        <Dialog.Actions style={{ flexWrap: 'wrap' }}>
          {((actions && actions[0]) || false) && <Button style={{ borderRadius: 25 }} onPress={onCancel}>Don't save</Button>}
          {((actions && actions[1]) || false) && <Button style={{ borderRadius: 25 }} mode="contained" onPress={onSave}>Save</Button>}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
};
