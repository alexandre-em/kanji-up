import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { Avatar, Button, Dialog, IconButton, Portal, Snackbar, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import core from 'kanji-app-core';
import { User } from 'kanji-app-types';

import style from './style';
import { colors } from 'constants';
import global from 'constants/style';
import { useUserContext } from 'components/UserProvider';
import actions from 'components/UserProvider/actions';

export default function Home() {
  const UserContext = useUserContext();
  const [user, setUser] = useState<Partial<User>>({ name: UserContext.state.name, password: '' });
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [snackContent, setSnackContent] = useState<string>('');
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);

  const avatarUri = useMemo(
    () => `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${UserContext.state?.user_id}`,
    [user?.user_id]
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const isUserUpdated = useMemo(() => {
    return Object.keys(user).reduce((prev, curr) => prev && user[curr] !== UserContext.state[curr], true);
  }, [user, UserContext.state, image]);

  const snack = useMemo(() => {
    return (
      <Snackbar
        visible={!!snackContent}
        onDismiss={() => setSnackContent('')}
        action={{
          icon: 'close',
          label: 'CLOSE',
          onPress: () => setSnackContent(''),
        }}>
        {snackContent}
      </Snackbar>
    );
  }, [snackContent]);

  const handleSubmit = useCallback(() => {
    if (isUserUpdated || user.password) {
      core.userService
        ?.updateProfile(user)
        .then(() => {
          if (user.name) UserContext.dispatch({ type: actions.UPDATE, payload: { name: user.name } });
          setSnackContent('Information updated successfully');
          setUser((prev) => ({ ...prev, password: '' }));
        })
        .catch((err) => setSnackContent(err.response.data.message + '. Please refresh the application'));
    }
    if (image) {
      if (Platform.OS === 'web') {
        const dataSplit = image.uri.split(',');
        const contentType = dataSplit[0].split(':')[1].split(';')[0];
        fetch(image.uri)
          .then((res) => res.blob())
          .then((imageBlob) => {
            core.userService
              ?.updateProfileImage(imageBlob, contentType)
              .then(() => setSnackContent('Image upload successfully. Please refresh the application'))
              .catch((err) => setSnackContent(err.response.data.message + '. Please refresh the application'));
          });
      } else {
        core.userService?.updateProfileImageNative(image.uri, image.fileName || Date.now().toString());
      }
    }
  }, [user, isUserUpdated, image]);

  const handleRemove = useCallback(() => {
    setModalVisibility(false);
    core.userService?.deleteUser();
  }, []);

  return (
    <SafeAreaView style={[global.main, { flexDirection: 'column' }]}>
      <Portal>
        <Dialog visible={modalVisibility} onDismiss={() => setModalVisibility(false)}>
          <Dialog.Title>Are you sure to delete this account ?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.text + '70' }}>you'll have a delay of 7 days before losing your data definitively</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleRemove}>Delete</Button>
            <Button onPress={() => setModalVisibility(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={style.iconsHeader}>
        <IconButton
          icon="arrow-left-circle-outline"
          iconColor={colors.primary}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start' }}
        />
        <Button icon="logout">Logout</Button>
      </View>
      <View style={style.avatar}>
        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={pickImage}>
          {UserContext.state.user_id ? (
            <Avatar.Image size={150} source={{ uri: image?.uri || avatarUri }} />
          ) : (
            <Avatar.Text size={150} label={user.name!.charAt(0) || '-'} />
          )}
        </TouchableOpacity>
        <Button onPress={pickImage} style={{ alignSelf: 'center' }}>
          Update image
        </Button>
      </View>
      <View style={style.contents}>
        <Text style={global.title}>Information</Text>
        <TextInput
          mode="outlined"
          label="id"
          value={UserContext.state.user_id}
          style={{ marginHorizontal: 20, marginVertical: 5 }}
          disabled
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={UserContext.state.email}
          style={{ marginHorizontal: 20, marginVertical: 5 }}
          disabled
        />
        <TextInput
          mode="outlined"
          label="Name"
          value={user.name}
          onChangeText={(text) => setUser((prev) => ({ ...prev, name: text }))}
          style={{ marginHorizontal: 20, marginVertical: 5 }}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={user.password}
          onChangeText={(text) => setUser((prev) => ({ ...prev, password: text }))}
          style={{ marginHorizontal: 20, marginVertical: 5 }}
          secureTextEntry
          right={<TextInput.Icon icon="eye" />}
        />
        <Text style={{ marginHorizontal: 20, marginTop: 30, color: colors.text + '70', fontSize: 12, alignSelf: 'flex-end' }}>
          Accepted image formats : jpg, png and webp and size {'<'} 1.5Mb
        </Text>
        <Button
          mode="contained"
          style={{ alignSelf: 'flex-end', marginVertical: 5, marginHorizontal: 20 }}
          onPress={handleSubmit}
          disabled={!isUserUpdated && !image && !user.password}>
          Update information
        </Button>
        <Text style={global.title}>Delete account</Text>
        <Text style={{ marginHorizontal: 20, color: colors.text + '70' }}>
          Your data will be saved 7 days. After that they will be lost
        </Text>
        <Button
          icon="account-remove"
          style={{ alignSelf: 'flex-end', marginVertical: 5, marginHorizontal: 20 }}
          onPress={() => setModalVisibility(true)}>
          Delete account
        </Button>
      </View>
      {snack}
    </SafeAreaView>
  );
}
