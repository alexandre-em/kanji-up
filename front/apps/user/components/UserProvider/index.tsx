import React, { useContext, useReducer } from 'react';
import actions from './actions';
import { User } from 'kanji-app-types';

const initialValue: User = {
  name: '',
  email: '',
  friends: [],
  permissions: [],
  created_at: '',
  user_id: '',
  deleted_at: '',
  applications: {
    kanji: {
      total_score: 0,
      scores: {},
      progression: {},
    },
    word: {
      total_score: 0,
      scores: {},
      progression: {},
    },
  },
};

const initialUserState = {
  state: initialValue,
  dispatch: (body: { type: string; payload: Partial<typeof initialValue> }): void => console.log(body),
};

const UserContext = React.createContext(initialUserState);

export function useUserContext() {
  return useContext(UserContext);
}

const reducer = (state, action) => {
  switch (action.type) {
    case actions.FETCH:
      return action.payload;
    case actions.UPDATE:
      return { ...state, ...action.payload };
    case actions.RESET:
      return initialValue;
    default:
      throw new Error('Select an action');
  }
};

export default function UserProvider({ initialState = initialValue, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
}
