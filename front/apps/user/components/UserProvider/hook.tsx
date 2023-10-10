import { useCallback } from 'react';
import { useUserContext } from '.';
import { User, UserApplicationScore } from 'kanji-app-types';
import core from 'kanji-app-core';
import actions from './actions';

export default function useUserHooks() {
  const UserContext = useUserContext();

  const isUserFriend = useCallback(
    (selectedUser: Partial<User>) =>
      UserContext.state.friends.map((userFriend) => userFriend.user_id).includes(selectedUser.user_id),
    [UserContext.state.friends]
  );

  const addRemoveFriend = useCallback(
    (updatedFriend: Partial<User>) => {
      const isFriend = isUserFriend(updatedFriend);
      const payload = !isFriend
        ? { friends: [...UserContext.state.friends, { name: updatedFriend.name, user_id: updatedFriend.user_id }] }
        : { friends: UserContext.state.friends.filter(({ user_id }) => updatedFriend.user_id !== user_id) };

      !isFriend ? core.userService?.addFriend(updatedFriend.user_id!) : core.userService?.removeFriend(updatedFriend.user_id!);

      UserContext.dispatch({
        type: actions.UPDATE,
        payload,
      });

      return payload;
    },
    [UserContext.state.friends]
  );

  const getUserFriendAndScore = useCallback(async (userProfile: { data: Partial<User> }) => {
    const applications: UserApplicationScore = { kanji: undefined, word: undefined };

    if (userProfile.data.applications?.kanji?.total_score) {
      applications.kanji = (await core.userService!.getUserScore(userProfile.data.user_id!, 'kanji')).data;
    }
    if (userProfile.data.applications?.word?.total_score) {
      applications.word = (await core.userService!.getUserScore(userProfile.data.user_id!, 'word')).data;
    }

    const friends = (await core.userService!.getFollowingList(userProfile.data.user_id!)).data;

    return { ...userProfile.data, friends, applications };
  }, []);

  const getUser = useCallback(
    async (userId: string) => {
      const userProfile = await core.userService!.getUserById(userId);

      if (userProfile.data.user_id) {
        return await getUserFriendAndScore(userProfile);
      }

      return null;
    },
    [core.userService, UserContext.state]
  );

  const getCurrentUser = useCallback(async () => {
    if (core.userService) {
      const userProfile = await core.userService!.getProfile();
      if (userProfile.data.user_id) {
        const payload = await getUserFriendAndScore(userProfile);

        UserContext.dispatch({ type: actions.FETCH, payload });
      }
    }
  }, [core.userService]);

  return {
    isUserFriend,
    addRemoveFriend,
    getUser,
    getCurrentUser,
  };
}
