import { useCallback, useEffect, useRef, useState } from 'react';

import { getTransactionHistory, getWallet } from '../lib/wallet';
import type { TransactionHistoryItem } from '../types/api';

const getExplorerBaseUrl = (chainId?: number): string => {
  if (chainId === 84532) {
    return 'https://sepolia.basescan.org';
  }
  return 'https://basescan.org';
};

const getTxHash = (item: TransactionHistoryItem): string => {
  const metadata = item.metadata ?? {};
  const candidates = [
    metadata.txHash,
    metadata.transactionHash,
    metadata.hash,
    metadata.signature,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.startsWith('0x')) {
      return value;
    }
  }
  return '';
};

function TransactionsPage() {
  const pageSize = 20;
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [explorerBaseUrl, setExplorerBaseUrl] = useState('https://basescan.org');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [copiedLedgerId, setCopiedLedgerId] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tableRef = useRef<HTMLDivElement | null>(null);

  const loadTransactions = useCallback(async (nextOffset = offset): Promise<void> => {
    setLoading(true);
    try {
      const [txData, walletData] = await Promise.all([getTransactionHistory(pageSize, nextOffset), getWallet()]);
      setTransactions(txData.transactions);
      setOffset(nextOffset);
      setTotal(txData.pagination.total);
      setExplorerBaseUrl(getExplorerBaseUrl(walletData.chainId));
      setError('');
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [offset, pageSize]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const updateOverflowHint = useCallback(() => {
    const table = tableRef.current;
    if (!table) {
      setShowSwipeHint(false);
      return;
    }
    const isMobileViewport = window.innerWidth <= 640;
    const hasOverflow = table.scrollWidth > table.clientWidth + 1;
    setShowSwipeHint(isMobileViewport && hasOverflow);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateOverflowHint();
    }, 0);
    window.addEventListener('resize', updateOverflowHint);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateOverflowHint);
    };
  }, [transactions, loading, error, updateOverflowHint]);

  const copyTxHash = async (item: TransactionHistoryItem): Promise<void> => {
    const txHash = getTxHash(item);
    if (!txHash) {
      return;
    }
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedLedgerId(item.ledgerId);
      setTimeout(() => {
        setCopiedLedgerId((current) => (current === item.ledgerId ? null : current));
      }, 1500);
    } catch {
      setError('Could not copy tx hash.');
    }
  };

  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoPrev = offset > 0 && !loading;
  const canGoNext = offset + pageSize < total && !loading;

  return (
    <section className='panel'>
      <div className='panelHeader'>
        <h2 className='panelTitle'>Transactions</h2>
        <button type='button' className='miniBtn' onClick={() => void loadTransactions(offset)} disabled={loading}>
          Refresh
        </button>
      </div>
      {loading && <p className='mutedText'>Loading transactions...</p>}
      {!!error && <p className='errorText'>{error}</p>}
      {!loading && !error && transactions.length === 0 && (
        <p className='mutedText'>No transactions found.</p>
      )}
      {!loading && !error && transactions.length > 0 && (
        <div className='txTable' ref={tableRef}>
          <div className='txRow txHeader'>
            <span>Date</span>
            <span>Type</span>
            <span>Status</span>
            <span>Amount</span>
            <span>Explorer</span>
            <span>Tx Hash</span>
          </div>
          {transactions.map((item) => (
            <div key={item.ledgerId} className='txRow'>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
              <span>{item.type}</span>
              <span className={`statusPill status${item.status}`}>{item.status}</span>
              <span>{Number(item.amount).toLocaleString()}</span>
              {getTxHash(item) ? (
                <a
                  className='txLink'
                  href={`${explorerBaseUrl}/tx/${getTxHash(item)}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  View
                </a>
              ) : (
                <span className='mutedText'>-</span>
              )}
              {getTxHash(item) ? (
                <button
                  type='button'
                  className='txHashBtn'
                  onClick={() => void copyTxHash(item)}
                >
                  {copiedLedgerId === item.ledgerId ? 'Copied' : 'Copy hash'}
                </button>
              ) : (
                <span className='mutedText'>-</span>
              )}
            </div>
          ))}
        </div>
      )}
      {showSwipeHint && (
        <p className='swipeHintText'>Swipe horizontally to view all columns.</p>
      )}
      {!loading && !error && total > 0 && (
        <div className='paginationRow'>
          <button type='button' className='miniBtn' onClick={() => void loadTransactions(offset - pageSize)} disabled={!canGoPrev}>
            Previous
          </button>
          <p className='mutedText'>
            Page {currentPage} of {totalPages}
          </p>
          <button type='button' className='miniBtn' onClick={() => void loadTransactions(offset + pageSize)} disabled={!canGoNext}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default TransactionsPage;
