import { formatUnits, JsonRpcProvider, Contract } from 'ethers';
import { useEffect, useState } from 'react';

import { getWallet } from '../api/wallet';
import type { WalletBalanceResponse } from '../types/api';

export interface WalletOverviewState {
  wallet: WalletBalanceResponse | null;
  hueBalance: string;
  usdcBalance: string;
  loading: boolean;
  error: string;
}

export function useWalletOverview(enabled: boolean): WalletOverviewState {
  const [wallet, setWallet] = useState<WalletBalanceResponse | null>(null);
  const [hueBalance, setHueBalance] = useState('--');
  const [usdcBalance, setUsdcBalance] = useState('--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const data = await getWallet();
        if (active) {
          setWallet(data);
          setError('');
        }
      } catch {
        if (active) {
          setError('Failed to load wallet. Check API base URL and auth token.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!wallet || !enabled) {
      return;
    }
    let active = true;
    const readBalances = async () => {
      try {
        const provider = new JsonRpcProvider(wallet.rpcEndpoint);
        const balanceOfAbi = ['function balanceOf(address) view returns (uint256)'];
        const decimalsAbi = ['function decimals() view returns (uint8)'];
        const address = wallet.wallet.publicKey;

        const hueToken = new Contract(wallet.hueTokenConfig.tokenAddress, balanceOfAbi, provider);
        const usdcToken = new Contract(wallet.hueTokenConfig.usdcErc20TokenAddress, balanceOfAbi, provider);

        const [hueRaw, usdcRaw] = await Promise.all([
          hueToken.balanceOf(address),
          usdcToken.balanceOf(address),
        ]);

        const usdcDecimalsContract = new Contract(
          wallet.hueTokenConfig.usdcErc20TokenAddress,
          decimalsAbi,
          provider,
        );
        const usdcDecimals = await usdcDecimalsContract.decimals();
        if (active) {
          setHueBalance(Number(formatUnits(hueRaw, wallet.hueTokenConfig.decimals)).toFixed(4));
          setUsdcBalance(Number(formatUnits(usdcRaw, usdcDecimals)).toFixed(4));
        }
      } catch {
        if (active) {
          setError('Wallet loaded, but on-chain balances could not be read.');
        }
      }
    };
    void readBalances();
    return () => {
      active = false;
    };
  }, [wallet, enabled]);

  return { wallet, hueBalance, usdcBalance, loading, error };
}
