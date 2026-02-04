'use client';

import { useKingdom } from '@/hooks/useKingdom';
import { useSellGems } from '@/hooks/useContractWrite';
import { formatNumber, calculateTheory } from '@/utils/calculations';
import { useState, useEffect } from 'react';
import { BSC_EXPLORER, GEMS_TO_BNB_RATE } from '@/config/contract';
import { useBSCNetwork } from '@/hooks/useBSCNetwork';

export function SwapGemsToBNBBlock() {
  const [mounted, setMounted] = useState(false);
  const { kingdom, isConnected, refetch } = useKingdom();
  const { sell, hash, isPending, isConfirming, isConfirmed, isError, error, reset } = useSellGems();
  const { isWrongNetwork } = useBSCNetwork();
  const [gemsInput, setGemsInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Live theory calculation - обновляется каждую секунду
  const [theory, setTheory] = useState(kingdom?.theory);

  useEffect(() => {
    if (!kingdom) {
      setTheory(undefined);
      return;
    }

    const updateTheory = () => {
      const newTheory = calculateTheory(
        kingdom.gold,
        kingdom.gems,
        kingdom.perHour,
        kingdom.claimTime
      );
      setTheory(newTheory);
    };

    updateTheory();
    const interval = setInterval(updateTheory, 1000);

    return () => clearInterval(interval);
  }, [kingdom]);

  const gemsAmount = parseInt(gemsInput) || 0;
  const bnbAmount = gemsAmount * GEMS_TO_BNB_RATE;

  // Validate input
  useEffect(() => {
    if (!gemsInput) {
      setInputError(null);
      return;
    }

    const amount = parseInt(gemsInput);
    
    if (isNaN(amount) || amount <= 0) {
      setInputError('Введите положительное число');
      return;
    }

    if (theory && amount > theory.gemsTheory) {
      setInputError(`Недостаточно gems (макс: ${formatNumber(theory.gemsTheory)})`);
      return;
    }

    setInputError(null);
  }, [gemsInput, theory]);

  // Refetch after confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  const handleSell = () => {
    if (!gemsAmount || inputError) return;
    if (isWrongNetwork) {
      setInputError('Пожалуйста, переключитесь на BSC Mainnet');
      return;
    }
    sell(BigInt(gemsAmount));
  };

  const handleReset = () => {
    reset();
    setGemsInput('');
  };

  if (!mounted) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">💰</span>
          Swap Gems → BNB
        </h2>
        <div className="card-content">
          <div className="flex items-center justify-center py-8">
            <span className="spinner-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">💰</span>
          Swap Gems → BNB
        </h2>
        <div className="card-content">
          <p className="text-gray-500 text-center py-4">Подключите кошелёк</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        <span className="icon">💰</span>
        Swap Gems → BNB
      </h2>
      
      <div className="card-content">
        {isWrongNetwork && (
          <div className="error-box mb-4">
            <span className="text-red-400">⚠️ Неверная сеть! Переключитесь на BSC Mainnet для выполнения транзакций.</span>
          </div>
        )}
        
        {theory && (
          <div className="mb-4 text-sm text-gray-400">
            Доступно gems (теория): <span className="text-gem-400">{formatNumber(theory.gemsTheory)}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Количество Gems</label>
          <input
            type="number"
            value={gemsInput}
            onChange={(e) => setGemsInput(e.target.value)}
            placeholder="Введите количество"
            className={`form-input ${inputError ? 'error' : ''}`}
            disabled={isPending || isConfirming}
          />
          {inputError && (
            <span className="form-error">{inputError}</span>
          )}
        </div>

        {gemsAmount > 0 && !inputError && (
          <div className="preview-box mb-4">
            <div className="preview-row">
              <span>Отдаёте:</span>
              <span className="text-gem-400">{formatNumber(gemsAmount)} Gems</span>
            </div>
            <div className="preview-row">
              <span>Получите:</span>
              <span className="text-gold-400">{bnbAmount.toFixed(8)} BNB</span>
            </div>
            <div className="preview-formula">
              (1 Gem = {GEMS_TO_BNB_RATE} BNB)
            </div>
          </div>
        )}

        {isConfirmed ? (
          <div className="success-box mb-4">
            <span className="text-green-400">✓ Транзакция подтверждена!</span>
            {hash && (
              <a
                href={`${BSC_EXPLORER}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                Посмотреть на BscScan →
              </a>
            )}
            <button onClick={handleReset} className="btn btn-secondary mt-2">
              Новый swap
            </button>
          </div>
        ) : isError ? (
          <div className="error-box mb-4">
            <span className="text-red-400">Ошибка: {error?.message || 'Транзакция отклонена'}</span>
            <button onClick={handleReset} className="btn btn-secondary mt-2">
              Попробовать снова
            </button>
          </div>
        ) : (
          <button
            onClick={handleSell}
            disabled={isPending || isConfirming || !gemsAmount || !!inputError || isWrongNetwork}
            className="btn btn-primary w-full"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Подтвердите в MetaMask...
              </span>
            ) : isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Ожидание подтверждения...
              </span>
            ) : (
              'Sell Gems for BNB'
            )}
          </button>
        )}

        {hash && !isConfirmed && (
          <div className="mt-2 text-center">
            <a
              href={`${BSC_EXPLORER}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
