'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { useEffect, useState } from 'react';
import { useBSCNetwork } from '@/hooks/useBSCNetwork';

export function WalletBlock() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { isBSC, isWrongNetwork, chainId } = useBSCNetwork();

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
      <div className="card">
        <h2 className="card-title">
          <span className="icon">👛</span>
          Кошелёк
        </h2>
        <div className="card-content">
          <div className="flex items-center justify-center py-8">
            <span className="spinner-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        <span className="icon">👛</span>
        Кошелёк
      </h2>
      
      <div className="card-content">
        {connectError && (
          <div className="error-box mb-4">
            <span className="text-red-400 text-sm">
              Ошибка: {connectError.message || 'Не удалось подключиться'}
            </span>
          </div>
        )}

        {!isConnected ? (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-sm">Подключите MetaMask для работы с контрактом</p>
            
            {connectors.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm mb-2">MetaMask не найден</p>
                <p className="text-xs text-gray-500">
                  Установите расширение MetaMask и обновите страницу
                </p>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isPending || isSwitching}
                className="btn btn-primary"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Подключение...
                  </span>
                ) : (
                  'Подключить MetaMask'
                )}
              </button>
            )}
            
            <p className="text-xs text-gray-500 text-center mt-2">
              После подключения автоматически переключим на BSC Mainnet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Адрес:</span>
              <span className="font-mono text-gold-400">{formatAddress(address!)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Сеть:</span>
              <span className={isWrongNetwork ? 'text-red-400' : 'text-green-400'}>
                {isWrongNetwork ? `Неверная сеть! (ID: ${chainId})` : 'BSC Mainnet ✓'}
              </span>
            </div>

            {isWrongNetwork && (
              <button
                onClick={() => switchChain({ chainId: bsc.id })}
                disabled={isSwitching}
                className="btn btn-warning"
              >
                {isSwitching ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" />
                    Переключение...
                  </span>
                ) : (
                  'Переключить на BSC'
                )}
              </button>
            )}

            <button
              onClick={() => disconnect()}
              className="btn btn-secondary"
            >
              Отключить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
