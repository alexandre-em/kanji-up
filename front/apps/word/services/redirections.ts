import { Linking, Platform } from 'react-native';

import core from 'kanji-app-core';

export function UserAppRedirection(userId: string, accessToken: string) {
  Linking.openURL(
    Platform.select({
      web: process.env.EXPO_PUBLIC_USER_APP_WEB + `/profile/${userId}?access_token=${accessToken}`,
      native: process.env.EXPO_PUBLIC_USER_APP_NATIVE + `profile/${userId}?access_token=${accessToken}`,
    })
  );
}
export async function KanjiAppRedirection(kanji: string, accessToken: string) {
  const results = await core.kanjiService?.search({ limit: 1, query: kanji });
  const kanjiId = results!.data.docs[0]!.kanji_id;

  Linking.openURL(
    Platform.select({
      web: process.env.EXPO_PUBLIC_KANJI_APP_WEB + `/kanji/${kanjiId}?access_token=${accessToken}`,
      native: process.env.EXPO_PUBLIC_KANJI_APP_NATIVE + `/kanji/${kanji}?access_token=${accessToken}`,
    })
  );
}
