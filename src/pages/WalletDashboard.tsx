import { formatUnits, JsonRpcProvider, Contract } from 'ethers';
import { useEffect, useState } from 'react';

import { getWallet } from '../api/wallet';
import MetricCard from '../components/MetricCard';
import type { WalletBalanceResponse } from '../types/api';

function WalletDashboard() {
  const [wallet, setWallet] = useState<WalletBalanceResponse | null>(null);
  const [hueBalance, setHueBalance] = useState('--');
  const [usdcBalance, setUsdcBalance] = useState('--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    let active = true;
    const readBalances = async () => {
      if (!wallet) {
        return;
      }
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
  }, [wallet]);

  const walletAddress = wallet?.wallet.publicKey ?? '--';

  return (
    <section className='panel'>
      <h2 className='panelTitle'>Wallet Overview</h2>
      {loading && <p className='mutedText'>Loading wallet...</p>}
      {!!error && <p className='errorText'>{error}</p>}
      {!loading && !error && (
        <>
          <p className='mutedText breakWord'>Wallet Address: {walletAddress}</p>
          <div className='metricGrid'>
            <MetricCard label='HUE Balance' value={hueBalance} />
            <MetricCard label='USDC Balance' value={usdcBalance} />
            <MetricCard label='Network' value={wallet?.chainId ? `Chain ${wallet.chainId}` : '--'} />
          </div>
        </>
      )}
    </section>
  );
}

export default WalletDashboard;
