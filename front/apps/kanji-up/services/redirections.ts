import { Linking, Platform } from 'react-native';

export function UserAppRedirection(userId: string, accessToken: string) {
  Linking.openURL(
    Platform.select({
      web: process.env.EXPO_PUBLIC_USER_APP_WEB + `/profile/${userId}?access_token=${accessToken}`,
      native: process.env.EXPO_PUBLIC_USER_APP_NATIVE + `profile/${userId}?access_token=${accessToken}`,
    })
  );
}
