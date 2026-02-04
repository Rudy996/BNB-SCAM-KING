'use client';

import { useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { BNBKING_ADDRESS, BNBKING_ABI } from '@/config/contract';
import { bsc } from 'wagmi/chains';
import { useCallback } from 'react';
import { useBSCNetwork } from './useBSCNetwork';

export function useSwapGemsToGold() {
  const { isBSC, isWrongNetwork } = useBSCNetwork();
  const { switchChain } = useSwitchChain();
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError,
    error,
    reset 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt 
  } = useWaitForTransactionReceipt({ hash, chainId: bsc.id });

  const swap = useCallback((gemsAmount: bigint) => {
    // Проверяем реальную сеть через наш хук
    if (!isBSC || isWrongNetwork) {
      switchChain({ chainId: bsc.id });
      throw new Error('Пожалуйста, переключитесь на BSC Mainnet (Chain ID: 56) и попробуйте снова');
    }
    
    // ЯВНО указываем chainId в параметрах writeContract
    writeContract({
      address: BNBKING_ADDRESS,
      abi: BNBKING_ABI,
      functionName: 'swapGemsToGold',
      args: [gemsAmount],
      chainId: bsc.id, // Явно указываем BSC
    });
  }, [writeContract, isBSC, isWrongNetwork, switchChain]);

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    receipt,
    reset,
  };
}

export function usePlaceBuildings() {
  const { isBSC, isWrongNetwork } = useBSCNetwork();
  const { switchChain } = useSwitchChain();
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError,
    error,
    reset 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt 
  } = useWaitForTransactionReceipt({ hash, chainId: bsc.id });

  const build = useCallback((tileIds: number[], level: number) => {
    // Проверяем реальную сеть через наш хук
    if (!isBSC || isWrongNetwork) {
      switchChain({ chainId: bsc.id });
      throw new Error('Пожалуйста, переключитесь на BSC Mainnet (Chain ID: 56) и попробуйте снова');
    }
    
    // ЯВНО указываем chainId в параметрах writeContract
    writeContract({
      address: BNBKING_ADDRESS,
      abi: BNBKING_ABI,
      functionName: 'placeBuildings',
      args: [tileIds.map(id => id), level],
      chainId: bsc.id, // Явно указываем BSC
    });
  }, [writeContract, isBSC, isWrongNetwork, switchChain]);

  return {
    build,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    receipt,
    reset,
  };
}

export function useSellGems() {
  const { isBSC, isWrongNetwork } = useBSCNetwork();
  const { switchChain } = useSwitchChain();
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError,
    error,
    reset 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt 
  } = useWaitForTransactionReceipt({ hash, chainId: bsc.id });

  const sell = useCallback((gemsAmount: bigint) => {
    // Проверяем реальную сеть через наш хук
    if (!isBSC || isWrongNetwork) {
      switchChain({ chainId: bsc.id });
      throw new Error('Пожалуйста, переключитесь на BSC Mainnet (Chain ID: 56) и попробуйте снова');
    }
    
    // ЯВНО указываем chainId в параметрах writeContract
    writeContract({
      address: BNBKING_ADDRESS,
      abi: BNBKING_ABI,
      functionName: 'sellGems',
      args: [gemsAmount],
      chainId: bsc.id, // Явно указываем BSC
    });
  }, [writeContract, isBSC, isWrongNetwork, switchChain]);

  return {
    sell,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    receipt,
    reset,
  };
}

export function useBattle() {
  const { isBSC, isWrongNetwork } = useBSCNetwork();
  const { switchChain } = useSwitchChain();
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError,
    error,
    reset 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt 
  } = useWaitForTransactionReceipt({ hash, chainId: bsc.id });

  const battle = useCallback((winChance: number) => {
    // Проверяем реальную сеть через наш хук
    if (!isBSC || isWrongNetwork) {
      switchChain({ chainId: bsc.id });
      throw new Error('Пожалуйста, переключитесь на BSC Mainnet (Chain ID: 56) и попробуйте снова');
    }
    
    // Проверяем диапазон winChance
    if (winChance < 40 || winChance > 60) {
      throw new Error('winChance должен быть от 40 до 60');
    }
    
    // ЯВНО указываем chainId в параметрах writeContract
    writeContract({
      address: BNBKING_ADDRESS,
      abi: BNBKING_ABI,
      functionName: 'battle',
      args: [winChance],
      chainId: bsc.id, // Явно указываем BSC
    });
  }, [writeContract, isBSC, isWrongNetwork, switchChain]);

  return {
    battle,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    receipt,
    reset,
  };
}
