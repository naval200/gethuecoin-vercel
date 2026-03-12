import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { signinUser } from './api/auth';
import TopNav from './components/TopNav';
import { API_BASE_URL, APPLE_LOGIN_URL, GOOGLE_LOGIN_URL } from './config/appConfig';
import { clearAuthToken, getAuthToken, setAuthToken } from './lib/storage';
import RedeemPage from './pages/RedeemPage';
import TransactionsPage from './pages/TransactionsPage';
import WalletDashboard from './pages/WalletDashboard';
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

function App() {
  const urlAuthPayload = useMemo(() => getUrlAuthPayload(), []);
  const [savedToken, setSavedToken] = useState(() => urlAuthPayload.directToken || getAuthToken());
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const baseUrl = API_BASE_URL;
  const googleLoginUrl = GOOGLE_LOGIN_URL;
  const appleLoginUrl = APPLE_LOGIN_URL;

  const hasToken = savedToken.length > 0;

  useEffect(() => {
    if (!urlAuthPayload.directToken && !urlAuthPayload.exchangeToken) {
      return;
    }

    let isCancelled = false;
    const applyAuthFromUrl = async () => {
      if (urlAuthPayload.directToken) {
        setAuthToken(urlAuthPayload.directToken);
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
        clearAuthParamsFromUrl();
      } catch {
        if (isCancelled) {
          return;
        }
        setAuthError('Could not complete login. Please try Google or Apple login again.');
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

  const logout = () => {
    clearAuthToken();
    setSavedToken('');
    setAuthError('');
  };

  const startGoogleLogin = () => {
    window.location.href = googleLoginUrl;
  };

  const startAppleLogin = () => {
    window.location.href = appleLoginUrl;
  };

  return (
    <main className='appRoot'>
      <header className='appHeader'>
        <h1>Hue Wallet Web</h1>
        <p className='mutedText'>gethuecoin.com</p>
      </header>
      <section className='panel'>
        <h2 className='panelTitle'>Session</h2>
        <p className='mutedText breakWord'>
          API Base URL: {baseUrl}
        </p>
        {!hasToken ? (
          <div className='authActions'>
            <button type='button' onClick={startGoogleLogin} disabled={!googleLoginUrl || isSigningIn}>
              Continue with Google
            </button>
            <button
              type='button'
              className='secondaryBtn'
              onClick={startAppleLogin}
              disabled={!appleLoginUrl || isSigningIn}
            >
              Continue with Apple
            </button>
            <p className='mutedText'>
              {baseUrl
                ? 'After login, your token will be saved automatically on this device.'
                : 'Set VITE_API_BASE_URL in environment to enable login.'}
            </p>
            {isSigningIn && <p className='mutedText'>Signing you in...</p>}
            {authError && <p className='errorText'>{authError}</p>}
          </div>
        ) : (
          <button type='button' className='secondaryBtn' onClick={logout}>
            Clear Token
          </button>
        )}
      </section>
      {hasToken ? (
        <>
          <TopNav />
          <Routes>
            <Route path='/' element={<WalletDashboard />} />
            <Route path='/transactions' element={<TransactionsPage />} />
            <Route path='/redeem' element={<RedeemPage />} />
            <Route path='/withdraw' element={<WithdrawPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </>
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
