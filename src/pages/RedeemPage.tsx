import { useState } from 'react';
import type { FormEvent } from 'react';

import { swapHueToUsdc } from '../api/wallet';

function RedeemPage() {
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const numericAmount = Number(amount);
      const data = await swapHueToUsdc({ amount: numericAmount });
      setMessage(`Redeem started. Ledger ID: ${data.ledgerId}`);
    } catch {
      setError('Unable to redeem HUE right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='panel'>
      <h2 className='panelTitle'>Redeem HUE Coins</h2>
      <p className='mutedText'>Convert HUE to USDC from the web.</p>
      <form className='formGrid' onSubmit={onSubmit}>
        <label htmlFor='hueAmount'>HUE Amount</label>
        <input
          id='hueAmount'
          type='number'
          min='0'
          step='0.0001'
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <button type='submit' disabled={loading}>
          {loading ? 'Processing...' : 'Convert HUE to USDC'}
        </button>
      </form>
      {!!message && <p className='successText'>{message}</p>}
      {!!error && <p className='errorText'>{error}</p>}
    </section>
  );
}

export default RedeemPage;
