import { apiClient } from './api-client';
import { WalletInfo, TokenTransactionItem, TokenPackageItem } from '@/types';

export const walletService = {
  async getBalance(): Promise<WalletInfo> {
    return apiClient.get<WalletInfo>('/wallet/balance');
  },

  async getTransactions(typeFilter?: string): Promise<TokenTransactionItem[]> {
    const q = typeFilter ? `?type_filter=${typeFilter}` : '';
    return apiClient.get<TokenTransactionItem[]>(`/wallet/transactions${q}`);
  },

  async getPackages(): Promise<TokenPackageItem[]> {
    return apiClient.get<TokenPackageItem[]>('/wallet/packages');
  }
};

export const tokenService = walletService;
