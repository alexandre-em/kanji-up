import React from 'react';
import { router } from 'expo-router';

export type AuthContextValueType = {
  accessToken: string | null;
};

const AuthContext = React.createContext<AuthContextValueType | null>(null);

// This hook can be used to access the user info.
export function useAuth() {
  return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(accessToken: string | null) {
  React.useEffect(() => {
    // If the user is not signed in and the initial segment is not anything in the auth group.
    if (!accessToken) {
      // Redirect to the sign-in page.
      router.replace('/sign-in');
    } else {
      // Redirect away from the sign-in page.
      router.replace('/home');
    }
  }, [accessToken]);
}

export function Provider({ token, children }: { token: string | null; children: React.ReactNode }) {
  useProtectedRoute(token);

  return (
    <AuthContext.Provider
      value={{
        accessToken: token,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
