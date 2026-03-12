import type {
  SwapHueToUsdcRequest,
  SwapHueToUsdcResponse,
  TransactionHistoryResponse,
  WalletBalanceResponse,
  WithdrawUsdcRequest,
  WithdrawUsdcResponse,
} from '../types/api';
import { apiV0Client } from './client';

export async function getWallet(): Promise<WalletBalanceResponse> {
  const response = await apiV0Client.get('/wallets');
  return response.data as WalletBalanceResponse;
}

export async function getTransactionHistory(limit = 20, offset = 0): Promise<TransactionHistoryResponse> {
  const response = await apiV0Client.get(`/transactions/history?limit=${limit}&offset=${offset}`);
  return response.data as TransactionHistoryResponse;
}

export async function swapHueToUsdc(payload: SwapHueToUsdcRequest): Promise<SwapHueToUsdcResponse> {
  const response = await apiV0Client.post('/wallets/swap/hue-to-base', payload);
  return response.data as SwapHueToUsdcResponse;
}

export async function withdrawUsdc(payload: WithdrawUsdcRequest): Promise<WithdrawUsdcResponse> {
  const response = await apiV0Client.post('/wallets/send', payload);
  return response.data as WithdrawUsdcResponse;
}

