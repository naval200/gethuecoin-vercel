import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { signinUser } from './api/auth';
import TopNav from './components/TopNav';
import WalletOverview from './components/WalletOverview';
import { WalletProvider } from './context/WalletContext';
import { API_BASE_URL } from './config/appConfig';
import { useWalletOverview } from './hooks/useWalletOverview';
import { isFirebaseConfigured, signInWithApple, signInWithGoogle, signOutFirebaseSession } from './lib/firebaseAuth';
import { clearAuthSource, clearAuthToken, getAuthToken, getAuthSource, setAuthSource, setAuthToken } from './lib/storage';
import RedeemPage from './pages/RedeemPage';
import TransactionsPage from './pages/TransactionsPage';
import WithdrawPage from './pages/WithdrawPage';

interface UrlAuthPayload {
  directToken: string;
  exchangeToken: string;
}

function getUrlAuthPayload(): UrlAuthPayload {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  const read = (key: string) => url.searchParams.get(key) ?? hashParams.get(key);
  const directToken =
    read('authToken') ??
    read('token') ??
    read('access_token') ??
    '';
  const exchangeToken =
    read('firebaseToken') ??
    read('idToken') ??
    read('oauthToken') ??
    '';

  return {
    directToken: directToken.trim(),
    exchangeToken: exchangeToken.trim(),
  };
}

function clearAuthParamsFromUrl(): void {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);

  const keys = ['token', 'authToken', 'access_token', 'firebaseToken', 'idToken', 'oauthToken'];
  for (const key of keys) {
    url.searchParams.delete(key);
    hashParams.delete(key);
  }

  const nextHash = hashParams.toString();
  url.hash = nextHash ? `#${nextHash}` : '';
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function getFriendlyAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('popup')) {
    return 'Popup was blocked or closed. Please retry and allow popups.';
  }
  if (msg.includes('auth/unauthorized-domain')) {
    return 'This domain is not allowed for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains (e.g. localhost or your host).';
  }
  return 'Could not complete login. Please try Google or Apple login again.';
}

function App() {
  const urlAuthPayload = useMemo(() => getUrlAuthPayload(), []);
  const [savedToken, setSavedToken] = useState(() => urlAuthPayload.directToken || getAuthToken());
  const [authSource, setAuthSourceState] = useState<'' | 'url' | 'webapp'>(() => getAuthSource());
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const baseUrl = API_BASE_URL;

  const hasToken = savedToken.length > 0;
  const walletOverview = useWalletOverview(hasToken);

  useEffect(() => {
    if (!urlAuthPayload.directToken && !urlAuthPayload.exchangeToken) {
      return;
    }

    let isCancelled = false;
    const applyAuthFromUrl = async () => {
      if (urlAuthPayload.directToken) {
        setAuthToken(urlAuthPayload.directToken);
        setAuthSource('url');
        setAuthSourceState('url');
        clearAuthParamsFromUrl();
        return;
      }

      setIsSigningIn(true);
      setAuthError('');
      try {
        const authToken = await signinUser(urlAuthPayload.exchangeToken);
        if (isCancelled) {
          return;
        }
        setSavedToken(authToken);
        setAuthSource('url');
        setAuthSourceState('url');
        clearAuthParamsFromUrl();
      } catch (error) {
        if (isCancelled) {
          return;
        }
        setAuthError(getFriendlyAuthError(error));
      } finally {
        if (!isCancelled) {
          setIsSigningIn(false);
        }
      }
    };

    void applyAuthFromUrl();
    return () => {
      isCancelled = true;
    };
  }, [urlAuthPayload]);

  const clearTokenOnly = () => {
    clearAuthToken();
    clearAuthSource();
    setSavedToken('');
    setAuthSourceState('');
    setAuthError('');
  };

  const logout = () => {
    void signOutFirebaseSession();
    clearAuthToken();
    clearAuthSource();
    setSavedToken('');
    setAuthSourceState('');
    setAuthError('');
  };

  const startGoogleLogin = async () => {
    console.log('[auth] Login flow: Google clicked');
    setIsSigningIn(true);
    setAuthError('');
    try {
      const firebaseToken = await signInWithGoogle();
      console.log('[auth] Login flow: Firebase token received, exchanging with backend');
      const authToken = await signinUser(firebaseToken);
      console.log('[auth] Login flow: Success, session saved');
      setSavedToken(authToken);
      setAuthSource('webapp');
      setAuthSourceState('webapp');
    } catch (error) {
      console.error('[auth] Login flow: Google login failed', error);
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const startAppleLogin = async () => {
    console.log('[auth] Login flow: Apple clicked');
    setIsSigningIn(true);
    setAuthError('');
    try {
      const firebaseToken = await signInWithApple();
      console.log('[auth] Login flow: Firebase token received, exchanging with backend');
      const authToken = await signinUser(firebaseToken);
      console.log('[auth] Login flow: Success, session saved');
      setSavedToken(authToken);
      setAuthSource('webapp');
      setAuthSourceState('webapp');
    } catch (error) {
      console.error('[auth] Login flow: Apple login failed', error);
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className='appRoot'>
      <header className='appHeader'>
        <div className='appHeaderTopRow'>
          <h1 className='appHeaderTitle'>Your Hue Wallet</h1>
          {hasToken && (
            <div className='appHeaderActions'>
              {authSource === 'url' && (
                <button type='button' className='headerBtn' onClick={clearTokenOnly}>
                  Back
                </button>
              )}
              <button type='button' className='headerBtn' onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
        {hasToken && (
          <>
            <WalletOverview overview={walletOverview} />
            <TopNav />
          </>
        )}
      </header>
      {!hasToken && (
        <section className='panel'>
          <h2 className='panelTitle'>Session</h2>
          <p className='mutedText breakWord'>
            API Base URL: {baseUrl}
          </p>
          <div className='authActions'>
            <button type='button' onClick={() => void startGoogleLogin()} disabled={!isFirebaseConfigured || isSigningIn}>
              Continue with Google
            </button>
            <button
              type='button'
              className='secondaryBtn'
              onClick={() => void startAppleLogin()}
              disabled={!isFirebaseConfigured || isSigningIn}
            >
              Continue with Apple
            </button>
            <p className='mutedText'>
              {!isFirebaseConfigured
                ? 'Set Firebase environment values to enable Google/Apple login.'
                : baseUrl
                  ? 'After login, your token will be saved automatically on this device.'
                  : 'Set VITE_API_BASE_URL in environment to enable login.'}
            </p>
            {isSigningIn && <p className='mutedText'>Signing you in...</p>}
            {authError && <p className='errorText'>{authError}</p>}
          </div>
        </section>
      )}
      {hasToken ? (
        <WalletProvider value={walletOverview}>
          <Routes>
            <Route path='/' element={<Navigate to='/redeem' replace />} />
            <Route path='/transactions' element={<TransactionsPage />} />
            <Route path='/redeem' element={<RedeemPage />} />
            <Route path='/withdraw' element={<WithdrawPage />} />
            <Route path='*' element={<Navigate to='/redeem' replace />} />
          </Routes>
        </WalletProvider>
      ) : (
        <section className='panel'>
          <p className='mutedText'>
            Login with Google or Apple to access wallet balances, transactions, redeem, and withdraw
            flows.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;
