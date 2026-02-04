'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { bsc } from 'wagmi/chains';

/**
 * Хук для явной проверки сети BSC через window.ethereum
 * Возвращает реальный chainId из MetaMask
 */
export function useBSCNetwork() {
  const { isConnected } = useAccount();
  const wagmiChainId = useChainId();
  const [realChainId, setRealChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      setRealChainId(null);
      setIsLoading(false);
      return;
    }

    const checkNetwork = async () => {
      try {
        // Проверяем через window.ethereum напрямую
        if (typeof window !== 'undefined' && window.ethereum) {
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          console.log('Реальный chainId из MetaMask:', chainId);
          setRealChainId(chainId);
        } else {
          // Fallback на wagmi chainId
          console.log('Используем chainId из wagmi:', wagmiChainId);
          setRealChainId(wagmiChainId);
        }
      } catch (error) {
        console.error('Ошибка проверки сети:', error);
        // Fallback на wagmi chainId
        setRealChainId(wagmiChainId);
      } finally {
        setIsLoading(false);
      }
    };

    checkNetwork();

    // Слушаем изменения сети
    if (window.ethereum) {
      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        console.log('Сеть изменилась на:', chainId);
        setRealChainId(chainId);
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected, wagmiChainId]);

  const isBSC = realChainId === bsc.id;
  const isWrongNetwork = isConnected && !isBSC;

  return {
    chainId: realChainId,
    isBSC,
    isWrongNetwork,
    isLoading,
  };
}

// Расширяем Window interface для TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (data: any) => void) => void;
      removeListener: (event: string, handler: (data: any) => void) => void;
    };
  }
}
