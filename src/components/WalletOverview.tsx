import MetricCard from './MetricCard';
import type { WalletOverviewState } from '../hooks/useWalletOverview';

interface WalletOverviewProps {
  overview: WalletOverviewState;
}

function WalletOverview({ overview }: WalletOverviewProps) {
  const { wallet, hueBalance, usdcBalance, loading, error } = overview;
  const address = wallet?.wallet.publicKey ?? '--';

  return (
    <div className='walletOverview'>
      {loading && <p className='mutedText'>Loading wallet...</p>}
      {!!error && <p className='errorText'>{error}</p>}
      {!loading && !error && (
        <>
          <p className='mutedText breakWord walletOverviewAddress'>Wallet Address: {address}</p>
          <div className='metricGrid metricGridCompact'>
            <MetricCard label='HUE Balance' value={hueBalance} />
            <MetricCard label='USDC Balance' value={usdcBalance} />
          </div>
        </>
      )}
    </div>
  );
}

export default WalletOverview;
