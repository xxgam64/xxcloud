import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as fbSignOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity.readonly',
];

const createGoogleProvider = (forceSelectAccount = false) => {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach(scope => provider.addScope(scope));
  if (forceSelectAccount) {
    provider.setCustomParameters({ prompt: 'select_account' });
  }
  return provider;
};

// Cached primary access token in memory as required by workspace-integration skill
let cachedPrimaryAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedPrimaryAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedPrimaryAccessToken);
      } else if (!isSigningIn) {
        cachedPrimaryAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedPrimaryAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInPrimaryGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = createGoogleProvider(false);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token otorisasi Google Drive');
    }

    cachedPrimaryAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedPrimaryAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Connect an additional Google Drive account using account selector prompt
 */
export const connectAdditionalGoogleAccount = async (): Promise<{
  email: string;
  displayName: string;
  photoURL: string;
  accessToken: string;
} | null> => {
  try {
    const provider = createGoogleProvider(true);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh token untuk akun tambahan');
    }

    return {
      email: result.user.email || 'unknown@gmail.com',
      displayName: result.user.displayName || 'Google Account',
      photoURL: result.user.photoURL || '',
      accessToken: credential.accessToken,
    };
  } catch (error) {
    console.error('Error connecting additional account:', error);
    throw error;
  }
};

export const getPrimaryAccessToken = async (): Promise<string | null> => {
  return cachedPrimaryAccessToken;
};

export const logoutAuth = async () => {
  await fbSignOut(auth);
  cachedPrimaryAccessToken = null;
};
