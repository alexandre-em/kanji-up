import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { router, useGlobalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { asyncstorageKeys, useAuth } from 'kanji-app-auth';
import core from 'kanji-app-core';
import { WordType } from 'kanji-app-types';

import { endpointUrls } from 'constants';
import { RootState } from 'store';
import { settings, user, word } from 'store/slices';
import { fileNames, readFile } from 'services/file';
// import { UserAppRedirection } from 'services/redirections';

export default function useHomeHook() {
  const AuthContext = useAuth();
  const dispatch = useDispatch();
  const { access_token } = useGlobalSearchParams();
  const userState = useSelector((state: RootState) => state.user);

  // const handleUserRedirection = useCallback(
  //   () => UserAppRedirection(userState.userId, (access_token as string) || core.accessToken),
  //   [userState.userId, access_token, core.accessToken]
  // );

  const handleUserRedirection = useCallback(() => {
    router.push('/game/');
  }, []);

  const loadSelectedWord = useCallback(async () => {
    try {
      const contents = await readFile(fileNames.SELECTED_WORD);
      dispatch(word.actions.initialize(JSON.parse(contents) as WordType[]));
    } catch (err) {
      console.log('Previous word data not found');
    }
  }, []);

  const refreshUserScore = useCallback(() => {
    // Loading user information
    core.userService
      ?.getProfile()
      .then(({ data }) => {
        if (data.user_id) {
          dispatch(
            user.actions.update({
              userId: data.user_id,
              username: data.name,
            })
          );

          // Loading and storing user score on redux store
          core.userService?.getUserScore(data.user_id, 'word').then((score) => {
            if (score.data) {
              const date = new Date();
              const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

              dispatch(
                user.actions.update({
                  totalScore: score.data.total_score,
                  dailyScore: score.data.scores[formattedDate],
                  scores: score.data.scores,
                  progression: score.data.progression,
                })
              );
            }
          });
        }
      })
      .catch(() => router.replace('/'));
  }, [core.userService]);

  useEffect(() => {
    loadSelectedWord();
    readFile(fileNames.USER_SETTINGS)
      .then((content) => dispatch(settings.actions.update(JSON.parse(content))))
      .catch(() => console.log('Previous setting not found'));

    refreshUserScore();
  }, []);

  useEffect(() => {
    if (access_token) {
      if (AuthContext?.signIn) {
        AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, access_token as string);
        AuthContext.signIn(access_token as string);
        core.init(endpointUrls, access_token as string);
      }
    }
  }, [access_token, AuthContext?.signIn]);

  return { handleUserRedirection, userState };
}
