import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginRequested } from '../redux/auth/redux';
import {
  selectAuthError,
  selectAuthIsLoading,
} from '../redux/auth/selectors';
import { API_BASE_URL } from '../config/appConfig';
import { isFirebaseConfigured } from '../lib/firebaseAuth';
import { useState } from 'react';
import {
  getStoredMode,
  setStoredMode,
  type AppMode,
  VALID_MODES,
} from '../lib/mode';

export default function DeveloperLoginPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthLoading = useAppSelector(selectAuthIsLoading);
  const authError = useAppSelector(selectAuthError);
  const baseUrl = API_BASE_URL;
  const [modeValue, setModeValue] = useState<AppMode>(() => getStoredMode() ?? 'mainnet');

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as AppMode;
    setStoredMode(mode);
    setModeValue(mode);
    const params = new URLSearchParams(location.search);
    params.set('mode', mode);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <section className='panel'>
      <h2 className='panelTitle'>Session</h2>
      <p className='mutedText breakWord'>
        API Base URL: {baseUrl}
      </p>
      <div className='formRow'>
        <label htmlFor='mode'>Mode</label>
        <select
          id='mode'
          value={modeValue ?? 'mainnet'}
          onChange={handleModeChange}
          className='selectInput'
        >
          {VALID_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
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
            ? 'Firebase is not configured for this mode.'
            : baseUrl
              ? 'After login, your token will be saved automatically on this device.'
              : 'Add ?mode=development or ?mode=local to the URL to use a different environment.'}
        </p>
        {isAuthLoading && <p className='mutedText'>Signing you in...</p>}
        {authError && <p className='errorText'>{authError}</p>}
      </div>
    </section>
  );
}
