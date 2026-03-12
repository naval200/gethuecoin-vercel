import { useState } from 'react';
import type { FormEvent } from 'react';

import { withdrawUsdc } from '../lib/wallet';

function WithdrawPage() {
  const [address, setAddress] = useState('');
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
      const data = await withdrawUsdc({
        toAddress: address.trim(),
        amount: numericAmount,
        token: 'USDC',
      });
      setMessage(`Withdraw started. Ledger ID: ${data.ledgerId}`);
    } catch {
      setError('Unable to withdraw USDC right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='panel'>
      <h2 className='panelTitle'>Withdraw USDC</h2>
      <p className='mutedText'>Send USDC to an external wallet address.</p>
      <form className='formGrid' onSubmit={onSubmit}>
        <label htmlFor='toAddress'>Destination Address</label>
        <input
          id='toAddress'
          type='text'
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
        <label htmlFor='withdrawAmount'>USDC Amount</label>
        <input
          id='withdrawAmount'
          type='number'
          min='0'
          step='0.0001'
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <button type='submit' disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw USDC'}
        </button>
      </form>
      {!!message && <p className='successText'>{message}</p>}
      {!!error && <p className='errorText'>{error}</p>}
    </section>
  );
}

export default WithdrawPage;
