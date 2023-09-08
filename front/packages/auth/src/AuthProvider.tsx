import React from 'react';
import { router, useGlobalSearchParams, useRootNavigation } from 'expo-router';

export type AuthContextValueType = {
  accessToken: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = React.createContext<AuthContextValueType | null>(null);

// This hook can be used to access the user info.
export function useAuth() {
  return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(accessToken: string | null) {
  const { access_token } = useGlobalSearchParams();
  const rootNavigation = useRootNavigation();

  React.useEffect(() => {
    // If the user is not signed in and the initial segment is not anything in the auth group.
    if (!accessToken && !access_token) {
      // Redirect to the sign-in page.
      if (rootNavigation?.isReady()) {
        new Promise((r) => setTimeout(r, 1000)).then(() => router.replace('/'));
      }
    } else {
      if (!access_token) {
        if (rootNavigation?.isReady()) {
          new Promise((r) => setTimeout(r, 1000)).then(() => router.replace('/home'));
        }
      }
    }
  }, [rootNavigation?.isReady, accessToken, access_token]);
}

export function Provider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  useProtectedRoute(token);

  const handleSignIn = React.useCallback((newToken: string) => {
    if (newToken) {
      setToken(newToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signOut: () => setToken(null),
        accessToken: token,
        loading,
        setLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
