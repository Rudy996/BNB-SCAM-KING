'use client';

import { useKingdom } from '@/hooks/useKingdom';
import { useBattle } from '@/hooks/useContractWrite';
import { formatNumber } from '@/utils/calculations';
import { useState, useEffect } from 'react';
import { BSC_EXPLORER, BATTLE_COOLDOWN, MIN_WIN_CHANCE, MAX_WIN_CHANCE } from '@/config/contract';
import { useBSCNetwork } from '@/hooks/useBSCNetwork';

export function BattleBlock() {
  const [mounted, setMounted] = useState(false);
  const { kingdom, isConnected, refetch } = useKingdom();
  const { battle, hash, isPending, isConfirming, isConfirmed, isError, error, reset } = useBattle();
  const { isWrongNetwork } = useBSCNetwork();
  const [winChance, setWinChance] = useState(50);
  const [timeUntilBattle, setTimeUntilBattle] = useState<number | null>(null);
  const [canBattle, setCanBattle] = useState(false);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate time until next battle
  useEffect(() => {
    if (!kingdom) {
      setTimeUntilBattle(null);
      setCanBattle(false);
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const nextBattleTime = kingdom.battleTime + BATTLE_COOLDOWN;
    const timeLeft = nextBattleTime - now;

    if (timeLeft <= 0) {
      setTimeUntilBattle(0);
      setCanBattle(true);
    } else {
      setTimeUntilBattle(timeLeft);
      setCanBattle(false);
    }

    // Update every second
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const nextBattleTime = kingdom.battleTime + BATTLE_COOLDOWN;
      const timeLeft = nextBattleTime - now;
      
      if (timeLeft <= 0) {
        setTimeUntilBattle(0);
        setCanBattle(true);
      } else {
        setTimeUntilBattle(timeLeft);
        setCanBattle(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [kingdom]);

  // Refetch after confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Доступно';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м ${secs}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    } else {
      return `${secs}с`;
    }
  };

  const handleBattle = () => {
    if (!canBattle || kingdom?.perHour === 0) return;
    battle(winChance);
  };

  const handleReset = () => {
    reset();
  };

  // Check battle conditions
  const canStartBattle = canBattle && 
    kingdom && 
    kingdom.perHour > 0 && 
    kingdom.claimTime > 0 &&
    !isWrongNetwork;

  // Calculate potential rewards
  const winReward = kingdom 
    ? Math.floor((kingdom.perHour * 16 * 50) / winChance)
    : 0;
  const loseReward = kingdom 
    ? kingdom.perHour * 8
    : 0;
  const isFirstBattle = kingdom?.battlesInRow === 0;

  if (!mounted) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">⚔️</span>
          Батл
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
          <span className="icon">⚔️</span>
          Батл
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
        <span className="icon">⚔️</span>
        Батл
      </h2>
      
      <div className="card-content">
        {isWrongNetwork && (
          <div className="error-box mb-4">
            <span className="text-red-400">⚠️ Неверная сеть! Переключитесь на BSC Mainnet для выполнения транзакций.</span>
          </div>
        )}

        {kingdom && (
          <>
            {/* Battle Timer */}
            <div className="stat-box mb-4">
              <span className="stat-label">Следующий батл через</span>
              <span className={`stat-value ${canBattle ? 'text-green-400' : 'text-blue-400'}`}>
                {timeUntilBattle !== null ? formatTime(timeUntilBattle) : 'Загрузка...'}
              </span>
            </div>

            {/* Battle Stats */}
            {kingdom.battlesInRow > 0 && (
              <div className="info-banner mb-4">
                <span className="text-xs">📊</span>
                <span className="text-xs">
                  Серия: {kingdom.battlesInRow} батлов подряд
                  {kingdom.isWinInRow ? ' (победы)' : ' (поражения)'}
                </span>
              </div>
            )}

            {/* Conditions Check */}
            {kingdom.perHour === 0 && (
              <div className="error-box mb-4">
                <span className="text-red-400">❌ Нет зданий (perHour = 0). Постройте здания для участия в батлах.</span>
              </div>
            )}

            {kingdom.claimTime === 0 && (
              <div className="error-box mb-4">
                <span className="text-red-400">❌ Вы не зарегистрированы. Выполните любое действие для регистрации.</span>
              </div>
            )}

            {/* Win Chance Input */}
            <div className="form-group">
              <label className="form-label">Win Chance ({MIN_WIN_CHANCE}-{MAX_WIN_CHANCE})</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={winChance}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      if (value < MIN_WIN_CHANCE) setWinChance(MIN_WIN_CHANCE);
                      else if (value > MAX_WIN_CHANCE) setWinChance(MAX_WIN_CHANCE);
                      else setWinChance(value);
                    }
                  }}
                  min={MIN_WIN_CHANCE}
                  max={MAX_WIN_CHANCE}
                  className="form-input flex-1"
                  disabled={isPending || isConfirming}
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setWinChance(40)}
                    className={`btn btn-outline text-xs px-2 py-1 ${winChance === 40 ? 'active' : ''}`}
                    disabled={isPending || isConfirming}
                  >
                    40
                  </button>
                  <button
                    onClick={() => setWinChance(50)}
                    className={`btn btn-outline text-xs px-2 py-1 ${winChance === 50 ? 'active' : ''}`}
                    disabled={isPending || isConfirming}
                  >
                    50
                  </button>
                  <button
                    onClick={() => setWinChance(60)}
                    className={`btn btn-outline text-xs px-2 py-1 ${winChance === 60 ? 'active' : ''}`}
                    disabled={isPending || isConfirming}
                  >
                    60
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {winChance === 40 && 'Высокий риск, максимальная награда'}
                {winChance === 50 && 'Баланс (рекомендуется)'}
                {winChance === 60 && 'Минимальный риск, минимальная награда'}
                {winChance > 40 && winChance < 50 && 'Средний риск'}
                {winChance > 50 && winChance < 60 && 'Низкий риск'}
              </div>
            </div>

            {/* Potential Rewards */}
            {kingdom.perHour > 0 && (
              <div className="preview-box mb-4">
                <div className="preview-row">
                  <span>Первый батл:</span>
                  <span className="text-green-400">
                    {isFirstBattle ? '✓ Гарантированная победа' : 'Нет'}
                  </span>
                </div>
                <div className="preview-row">
                  <span>Награда за WIN:</span>
                  <span className="text-green-400">{formatNumber(winReward)} Серебро</span>
                </div>
                <div className="preview-row">
                  <span>Награда за LOSE:</span>
                  <span className="text-yellow-400">{formatNumber(loseReward)} Серебро</span>
                </div>
                <div className="preview-formula">
                  WIN: (perHour × 16 × 50) / winChance | LOSE: perHour × 8
                </div>
              </div>
            )}

            {/* Battle Button */}
            {isConfirmed ? (
              <div className="success-box mb-4">
                <span className="text-green-400">✓ Батл завершён!</span>
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
                  Новый батл
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
                onClick={handleBattle}
                disabled={isPending || isConfirming || !canStartBattle}
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
                ) : !canBattle ? (
                  `Батл недоступен (${timeUntilBattle !== null ? formatTime(timeUntilBattle) : '...'})`
                ) : kingdom.perHour === 0 ? (
                  'Нет зданий'
                ) : (
                  `Начать батл (winChance: ${winChance})`
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
          </>
        )}
      </div>
    </div>
  );
}
