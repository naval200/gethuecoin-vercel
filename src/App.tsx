import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import TopNav from './components/TopNav';
import { getApiBaseUrl } from './lib/api';
import { clearAuthToken, getAuthToken, setAuthToken } from './lib/storage';
import RedeemPage from './pages/RedeemPage';
import TransactionsPage from './pages/TransactionsPage';
import WalletDashboard from './pages/WalletDashboard';
import WithdrawPage from './pages/WithdrawPage';

function App() {
  const [tokenInput, setTokenInput] = useState(getAuthToken());
  const [savedToken, setSavedToken] = useState(getAuthToken());
  const baseUrl = useMemo(() => getApiBaseUrl(), []);

  const hasToken = savedToken.length > 0;

  const saveToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthToken(tokenInput);
    setSavedToken(tokenInput.trim());
  };

  const logout = () => {
    clearAuthToken();
    setSavedToken('');
    setTokenInput('');
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
          API Base URL: {baseUrl || 'Set VITE_API_BASE_URL in environment'}
        </p>
        <form className='formGrid' onSubmit={saveToken}>
          <label htmlFor='authToken'>Auth Token</label>
          <input
            id='authToken'
            type='password'
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder='Paste backend bearer token'
          />
          <button type='submit'>Save Token</button>
        </form>
        {!hasToken && (
          <p className='mutedText' style={{ marginTop: '8px' }}>
            Token is stored in local browser storage for this site.
          </p>
        )}
        {hasToken && (
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
            Save an auth token to access wallet balances, transactions, redeem, and withdraw flows.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;
