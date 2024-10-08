import React from 'react';
import { router, useGlobalSearchParams, usePathname, useRootNavigation } from 'expo-router';

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
  const params = useGlobalSearchParams();
  const pathname = usePathname();
  const rootNavigation = useRootNavigation();

  React.useEffect(() => {
    // If the user is not signed in and the initial segment is not anything in the auth group.
    if (rootNavigation?.isReady()) {
      if (!accessToken) {
        // Redirect to the sign-in page.
        new Promise((r) => setTimeout(r, 1000)).then(() => router.replace('/'));
      } else {
        // Redirect to the home page when signing in
        if (!params.access_token) {
          const pathParams = params.screen
            ? ''
            : Object.keys(params).reduce((prev, param) => prev + `${param}=${params[param]}&`, '');
          router.push(pathname === '/' ? '/home' : `${pathname}?${pathParams}`);
        }
      }
    }
  }, [rootNavigation?.isReady, accessToken, params.access_token, params.search, params.grade, pathname]);
}

export function Provider({ children }: { children: React.ReactNode }) {
  const { access_token } = useGlobalSearchParams();
  const [token, setToken] = React.useState<string | null>(access_token as string);
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
