import { createContext, useContext } from 'react';

import type { WalletOverviewState } from '../hooks/useWalletOverview';

const WalletContext = createContext<WalletOverviewState | null>(null);

export function useWalletContext(): WalletOverviewState | null {
  return useContext(WalletContext);
}

export const WalletProvider = WalletContext.Provider;
