export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'FEE'
  | 'REWARD'
  | 'ERODE'
  | 'SWAP'
  | 'SEED_GAS'
  | 'BLOCKCHAIN_WITHDRAWAL';

export type TransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'RETRY'
  | 'CANCELLED';

export interface WalletInfo {
  id: string;
  publicKey: string;
  createdAt: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  wallet: WalletInfo;
  rpcEndpoint: string;
  chainId: number;
  hueTokenConfig: {
    tokenAddress: string;
    symbol: string;
    decimals: number;
    routerAddress: string;
    quoterAddress: string;
    poolFee: number;
    usdcErc20TokenAddress: string;
  };
}

export interface TransactionHistoryItem {
  ledgerId: number;
  userId: number;
  amount: number;
  type: TransactionType;
  description: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  operation: {
    status: TransactionStatus;
    attempts: number;
    canRetry: boolean;
    errorCode?: string;
    failureReason?: string;
  } | null;
}

export interface TransactionHistoryResponse {
  success: boolean;
  transactions: TransactionHistoryItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SwapHueToUsdcRequest {
  amount: number;
  slippageBps?: number;
  targetWallet?: string;
  currentPrice?: number;
}

export interface SwapHueToUsdcResponse {
  success: boolean;
  message: string;
  ledgerId: number;
}

export interface WithdrawUsdcRequest {
  toAddress: string;
  amount: number;
  token: 'USDC';
}

export interface WithdrawUsdcResponse {
  success: boolean;
  message: string;
  ledgerId: number;
  fromAddress: string;
  toAddress: string;
  amount: number;
  token: string;
}
