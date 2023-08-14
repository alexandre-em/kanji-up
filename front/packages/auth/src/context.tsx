import React from 'react';
import { router } from 'expo-router';

export type AuthContextValueType = {
  accessToken: string | null;
  signIn: (token: string | null) => void;
  signOut: () => void;
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

export function Provider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  useProtectedRoute(token);

  return (
    <AuthContext.Provider
      value={{
        signIn: setToken,
        signOut: () => setToken(null),
        accessToken: token,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
