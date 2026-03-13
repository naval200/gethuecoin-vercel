import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { getApiBaseUrl } from './config/appConfig'
import { store } from './redux/store.ts'

const mode = store.getState().mode.mode
if (typeof console !== 'undefined') {
  console.log('[gethuecoin] mode:', mode, '| API_BASE_URL:', getApiBaseUrl(mode))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
