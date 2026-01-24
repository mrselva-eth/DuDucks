'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  connectWallet,
  isWalletAvailable,
  switchToSepolia,
  isSepoliaNetwork,
  WalletConnectResult,
} from '@/lib/web3-utils';

interface UseWeb3WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  network: ethers.Network | null;
  isLoading: boolean;
  error: string | null;
  isCorrectNetwork: boolean;
}

interface UseWeb3WalletReturn extends UseWeb3WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

export function useWeb3Wallet(): UseWeb3WalletReturn {
  const [state, setState] = useState<UseWeb3WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    network: null,
    isLoading: false,
    error: null,
    isCorrectNetwork: false,
  });

  // Check if wallet is available on mount
  useEffect(() => {
    if (!isWalletAvailable()) {
      setState((prev) => ({
        ...prev,
        error: 'MetaMask not installed',
      }));
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isWalletAvailable()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    const handleChainChanged = () => {
      // Reload page on chain change to reset state
      window.location.reload();
    };

    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    return () => {
      (window as any).ethereum.off('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.off('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result: WalletConnectResult = await connectWallet();

      // Check if on correct network
      const isCorrect = await isSepoliaNetwork(result.provider);
      if (!isCorrect) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: result.address,
          provider: result.provider,
          signer: result.signer,
          network: result.network,
          isLoading: false,
          isCorrectNetwork: false,
          error: 'Please switch to Sepolia network',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isConnected: true,
        address: result.address,
        provider: result.provider,
        signer: result.signer,
        network: result.network,
        isLoading: false,
        isCorrectNetwork: true,
      }));

      console.log('[v0] Wallet connected:', result.address);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect wallet';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('[v0] Wallet connection error:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      network: null,
      isLoading: false,
      error: null,
      isCorrectNetwork: false,
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await switchToSepolia();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isCorrectNetwork: true,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to switch network';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('[v0] Network switch error:', error);
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
  };
}
