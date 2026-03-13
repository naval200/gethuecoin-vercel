import { useEffect, useMemo, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import TopNav from './components/TopNav';
import WalletOverview from './components/WalletOverview';
import { WalletProvider } from './context/WalletContext';
import { useWalletOverview } from './hooks/useWalletOverview';
import DeveloperLoginPage from './pages/DeveloperLoginPage';
import RedeemPage from './pages/RedeemPage';
import TransactionsPage from './pages/TransactionsPage';
import WelcomePage from './pages/WelcomePage';
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
  selectAuthProvider,
  selectHasToken,
} from './redux/auth/selectors';
import { selectStoredMode } from './redux/mode/selectors';

interface UrlAuthPayload {
  directToken: string;
  exchangeToken: string;
}

const AUTH_TOKEN_PARAM = 'token';

function getUrlAuthPayload(): UrlAuthPayload {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  const read = (key: string) => url.searchParams.get(key) ?? hashParams.get(key);
  const token = read(AUTH_TOKEN_PARAM)?.trim() ?? '';

  return {
    directToken: token,
    exchangeToken: '',
  };
}

function clearAuthParamsFromUrl(): void {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);

  url.searchParams.delete(AUTH_TOKEN_PARAM);
  hashParams.delete(AUTH_TOKEN_PARAM);

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
  const storedMode = useAppSelector(selectStoredMode);
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
      {storedMode != null && (
        <div className='modeIndicator' aria-live='polite'>
          {storedMode === 'local' ? 'Local mode' : 'Development mode'}
        </div>
      )}
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
          <Route path='/' element={<WelcomePage />} />
          <Route path='/developer-login' element={<DeveloperLoginPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      )}
    </main>
  );
}

export default App;
