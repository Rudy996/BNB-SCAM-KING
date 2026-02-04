'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { useEffect, useState } from 'react';
import { useBSCNetwork } from '@/hooks/useBSCNetwork';
import { BNBKING_ADDRESS } from '@/config/contract';
import { formatUnits } from 'viem';

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { isBSC, isWrongNetwork, chainId } = useBSCNetwork();
  
  // Читаем баланс BNB смарт-контракта
  const { data: contractBalance } = useBalance({
    address: BNBKING_ADDRESS,
    chainId: bsc.id,
    query: {
      enabled: mounted,
      refetchInterval: 10000, // Обновляем каждые 10 секунд
    },
  });

  const { connect, connectors, isPending, error: connectError } = useConnect({
    mutation: {
      onSuccess: () => {
        console.log('Кошелёк подключен успешно');
      },
      onError: (error) => {
        console.error('Ошибка подключения:', error);
      },
    },
  });

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Автоматическое переключение на BSC после подключения
  useEffect(() => {
    if (mounted && isConnected && isWrongNetwork && !isSwitching) {
      console.log('Автоматическое переключение на BSC...', 'Текущий chainId:', chainId);
      switchChain({ chainId: bsc.id });
    }
  }, [mounted, isConnected, isWrongNetwork, isSwitching, switchChain, chainId]);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBNB = (value: bigint | undefined) => {
    if (!value) return '0.00';
    const bnb = formatUnits(value, 18);
    const num = parseFloat(bnb);
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  const handleConnect = () => {
    const metaMaskConnector = connectors.find((c) => c.id === 'injected' || c.name === 'MetaMask');
    if (metaMaskConnector) {
      console.log('Подключение к MetaMask...');
      connect({ connector: metaMaskConnector });
    } else if (connectors.length > 0) {
      console.log('Подключение к первому доступному коннектору...');
      connect({ connector: connectors[0] });
    } else {
      console.error('Коннекторы не найдены');
    }
  };

  if (!mounted) {
    return (
      <div className="wallet-button">
        <div className="btn btn-secondary">
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="wallet-button">
        {connectors.length === 0 ? (
          <div className="text-xs text-red-400">MetaMask не найден</div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isPending || isSwitching}
            className="btn btn-primary"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="spinner" />
                Подключение...
              </span>
            ) : (
              'Подключить'
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-button">
      <div className="wallet-info">
        {contractBalance && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="text-yellow-400">BNB:</span>
            <span className="font-mono">{formatBNB(contractBalance.value)}</span>
          </div>
        )}
        <div className="wallet-address">
          <span className="font-mono text-gold-400">{formatAddress(address!)}</span>
          <span className={`wallet-network ${isWrongNetwork ? 'wrong' : 'correct'}`}>
            {isWrongNetwork ? '⚠️' : '✓'}
          </span>
        </div>
        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: bsc.id })}
            disabled={isSwitching}
            className="btn btn-warning text-xs px-2 py-1"
          >
            {isSwitching ? '...' : 'BSC'}
          </button>
        )}
        <button
          onClick={() => disconnect()}
          className="btn btn-secondary text-xs px-2 py-1"
        >
          Отключить
        </button>
      </div>
    </div>
  );
}
