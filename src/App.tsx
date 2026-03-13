import { useEffect, useMemo, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import TopNav from './components/TopNav';
import WalletOverview from './components/WalletOverview';
import { WalletProvider } from './context/WalletContext';
import { API_BASE_URL } from './config/appConfig';
import { useWalletOverview } from './hooks/useWalletOverview';
import { isFirebaseConfigured } from './lib/firebaseAuth';
import RedeemPage from './pages/RedeemPage';
import TransactionsPage from './pages/TransactionsPage';
import WithdrawPage from './pages/WithdrawPage';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import {
  clearAuth,
  exchangeTokenRequested,
  loginRequested,
  logoutRequested,
  setAuthTokenAndProvider,
} from './redux/auth/redux';
import {
  selectAuthError,
  selectAuthIsLoading,
  selectAuthProvider,
  selectHasToken,
} from './redux/auth/selectors';

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

function getUrlAuthProvider(pathname: string, search: string): 'google' | 'apple' | null {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path !== '/auth') return null;
  const params = new URLSearchParams(search);
  const provider = params.get('provider');
  if (provider === 'google' || provider === 'apple') return provider;
  return null;
}

function clearAuthProviderFromUrl(navigate: (to: string, opts?: { replace?: boolean }) => void): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('provider');
  const path = url.pathname.replace(/\/$/, '') || '/';
  const newPath = path === '/auth' ? '/' : url.pathname;
  const target = `${newPath}${url.search}${url.hash}`;
  navigate(target || '/', { replace: true });
}

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const urlAuthPayload = useMemo(() => getUrlAuthPayload(), []);
  const hasToken = useAppSelector(selectHasToken);
  const authProvider = useAppSelector(selectAuthProvider);
  const authError = useAppSelector(selectAuthError);
  const isAuthLoading = useAppSelector(selectAuthIsLoading);
  const baseUrl = API_BASE_URL;
  const authProviderTriggeredRef = useRef(false);

  const walletOverview = useWalletOverview(hasToken);

  const urlAuthProvider = useMemo(
    () => getUrlAuthProvider(location.pathname, location.search),
    [location.pathname, location.search],
  );

  useEffect(() => {
    if (!urlAuthProvider || authProviderTriggeredRef.current || hasToken) return;
    authProviderTriggeredRef.current = true;
    clearAuthProviderFromUrl(navigate);
    dispatch(loginRequested(urlAuthProvider));
  }, [dispatch, urlAuthProvider, hasToken, navigate]);

  useEffect(() => {
    if (!urlAuthPayload.directToken && !urlAuthPayload.exchangeToken) {
      return;
    }
    if (urlAuthPayload.directToken) {
      dispatch(setAuthTokenAndProvider({ token: urlAuthPayload.directToken, provider: 'app' }));
      clearAuthParamsFromUrl();
      return;
    }

    dispatch(exchangeTokenRequested(urlAuthPayload.exchangeToken));
    clearAuthParamsFromUrl();
  }, [dispatch, urlAuthPayload]);

  const logout = () => {
    dispatch(logoutRequested());
  };

  return (
    <main className='appRoot'>
      <header className='appHeader'>
        <div className='appHeaderTopRow'>
          <h1 className='appHeaderTitle'>Your Hue Wallet</h1>
          {hasToken && (
            <div className='appHeaderActions'>
              {authProvider === 'app' && (
                <button type='button' className='headerBtn' onClick={() => dispatch(clearAuth())}>
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
        <Routes>
          <Route
            path='/'
            element={
              <section className='panel'>
                <h2 className='panelTitle'>Welcome</h2>
                <div className='authActions'>
                  <button
                    type='button'
                    onClick={() => {
                      window.location.href = 'https://gethuecoin.com';
                    }}
                  >
                    Go to gethuecoin.com
                  </button>
                </div>
              </section>
            }
          />
          <Route
            path='/developer-login'
            element={
              <section className='panel'>
                <h2 className='panelTitle'>Session</h2>
                <p className='mutedText breakWord'>
                  API Base URL: {baseUrl}
                </p>
                <div className='authActions'>
                  <button
                    type='button'
                    onClick={() => dispatch(loginRequested('google'))}
                    disabled={!isFirebaseConfigured || isAuthLoading}
                  >
                    Continue with Google
                  </button>
                  <button
                    type='button'
                    className='secondaryBtn'
                    onClick={() => dispatch(loginRequested('apple'))}
                    disabled={!isFirebaseConfigured || isAuthLoading}
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
                  {isAuthLoading && <p className='mutedText'>Signing you in...</p>}
                  {authError && <p className='errorText'>{authError}</p>}
                </div>
              </section>
            }
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      )}
    </main>
  );
}

export default App;
