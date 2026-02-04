'use client';

import { useKingdom } from '@/hooks/useKingdom';
import { usePlaceBuildings } from '@/hooks/useContractWrite';
import { formatNumber, validateTileId, findNextFreeTile, calculateTheory } from '@/utils/calculations';
import { BUILDING_STATS, BSC_EXPLORER } from '@/config/contract';
import { useState, useEffect } from 'react';
import { useBSCNetwork } from '@/hooks/useBSCNetwork';

export function BuildBlock() {
  const [mounted, setMounted] = useState(false);
  const { kingdom, isConnected, refetch } = useKingdom();
  const { build, hash, isPending, isConfirming, isConfirmed, isError, error, reset } = usePlaceBuildings();
  const { isWrongNetwork } = useBSCNetwork();
  
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);
  const [tileInput, setTileInput] = useState('');
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [tileError, setTileError] = useState<string | null>(null);

  const buildingStats = BUILDING_STATS[selectedLevel];
  const totalCost = buildingStats.cost * selectedTiles.length;
  const totalPerHour = buildingStats.perHour * selectedTiles.length;

  // Get current theory silver
  const theory = kingdom 
    ? calculateTheory(kingdom.gold, kingdom.gems, kingdom.perHour, kingdom.claimTime)
    : null;

  // Validate tile input
  useEffect(() => {
    if (!tileInput) {
      setTileError(null);
      return;
    }

    const tileId = parseInt(tileInput);
    
    if (!kingdom) {
      setTileError('Загрузка данных...');
      return;
    }

    const validation = validateTileId(tileId, kingdom.occupiedSet, selectedTiles);
    setTileError(validation.valid ? null : validation.error || null);
  }, [tileInput, kingdom, selectedTiles]);

  // Refetch after confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      setSelectedTiles([]);
      setTileInput('');
    }
  }, [isConfirmed, refetch]);

  const handleAddTile = () => {
    const tileId = parseInt(tileInput);
    if (isNaN(tileId) || tileError) return;
    
    setSelectedTiles([...selectedTiles, tileId]);
    setTileInput('');
  };

  const handleRemoveTile = (tileId: number) => {
    setSelectedTiles(selectedTiles.filter(t => t !== tileId));
  };

  const handleAddNextFree = () => {
    if (!kingdom) return;
    
    const lastSelected = selectedTiles.length > 0 
      ? Math.max(...selectedTiles) + 1 
      : 0;
    
    let nextFree = findNextFreeTile(kingdom.occupiedSet, lastSelected);
    
    // If not found from last selected, start from 0
    if (nextFree === null && lastSelected > 0) {
      nextFree = findNextFreeTile(kingdom.occupiedSet, 0);
    }
    
    // Skip already selected tiles
    while (nextFree !== null && selectedTiles.includes(nextFree)) {
      nextFree = findNextFreeTile(kingdom.occupiedSet, nextFree + 1);
    }
    
    if (nextFree !== null) {
      setSelectedTiles([...selectedTiles, nextFree]);
    }
  };

  const handleBuild = () => {
    if (selectedTiles.length === 0) return;
    if (isWrongNetwork) {
      setTileError('Пожалуйста, переключитесь на BSC Mainnet');
      return;
    }
    build(selectedTiles, selectedLevel);
  };

  const handleReset = () => {
    reset();
    setSelectedTiles([]);
    setTileInput('');
  };

  if (!mounted) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">🏗️</span>
          Строительство
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
          <span className="icon">🏗️</span>
          Строительство
        </h2>
        <div className="card-content">
          <p className="text-gray-500 text-center py-4">Подключите кошелёк</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card build-card">
      <h2 className="card-title">
        <span className="icon">🏗️</span>
        Строительство
      </h2>
      
      <div className="card-content">
        {isWrongNetwork && (
          <div className="error-box mb-4">
            <span className="text-red-400">⚠️ Неверная сеть! Переключитесь на BSC Mainnet для выполнения транзакций.</span>
          </div>
        )}
        
        {/* Level Selection */}
        <div className="form-group">
          <label className="form-label">Уровень здания</label>
          <div className="level-grid">
            {Object.entries(BUILDING_STATS).map(([level, stats]) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(parseInt(level))}
                className={`level-btn ${selectedLevel === parseInt(level) ? 'active' : ''}`}
                disabled={isPending || isConfirming}
              >
                <span className="level-num">Lv{level}</span>
                <span className="level-cost">{formatNumber(stats.cost)}</span>
                <span className="level-per-hour">+{stats.perHour}/ч</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Level Info */}
        <div className="selected-level-info mb-4">
          <div className="info-row">
            <span>Выбран:</span>
            <span className="text-gold-400">Уровень {selectedLevel}</span>
          </div>
          <div className="info-row">
            <span>Стоимость:</span>
            <span className="text-gold-400">{formatNumber(buildingStats.cost)} Серебро</span>
          </div>
          <div className="info-row">
            <span>Доход:</span>
            <span className="text-green-400">+{buildingStats.perHour}/час</span>
          </div>
        </div>

        {/* Tile Input */}
        <div className="form-group">
          <label className="form-label">ID клетки (0-359)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={tileInput}
              onChange={(e) => setTileInput(e.target.value)}
              placeholder="Введите ID"
              className={`form-input flex-1 ${tileError ? 'error' : ''}`}
              disabled={isPending || isConfirming}
              min="0"
              max="359"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTile()}
            />
            <button
              onClick={handleAddTile}
              disabled={!tileInput || !!tileError || isPending || isConfirming}
              className="btn btn-secondary"
            >
              Добавить
            </button>
          </div>
          {tileError && (
            <span className="form-error">{tileError}</span>
          )}
        </div>

        <button
          onClick={handleAddNextFree}
          disabled={isPending || isConfirming || !kingdom}
          className="btn btn-outline w-full mb-4"
        >
          + Добавить следующий свободный тайл
        </button>

        {/* Selected Tiles */}
        {selectedTiles.length > 0 && (
          <div className="selected-tiles mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="form-label">Выбранные клетки ({selectedTiles.length}):</span>
              <button
                onClick={() => setSelectedTiles([])}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Очистить все
              </button>
            </div>
            <div className="tiles-selected-grid">
              {selectedTiles.map((tileId) => (
                <div key={tileId} className="selected-tile-badge">
                  <span>#{tileId}</span>
                  <button
                    onClick={() => handleRemoveTile(tileId)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Cost Preview */}
        {selectedTiles.length > 0 && (
          <div className="preview-box mb-4">
            <div className="preview-row">
              <span>Всего клеток:</span>
              <span>{selectedTiles.length}</span>
            </div>
            <div className="preview-row">
              <span>Общая стоимость:</span>
              <span className={`${theory && totalCost > theory.goldTheory ? 'text-red-400' : 'text-gold-400'}`}>
                {formatNumber(totalCost)} Серебро
              </span>
            </div>
            <div className="preview-row">
              <span>Доход после постройки:</span>
              <span className="text-green-400">+{formatNumber(totalPerHour)}/час</span>
            </div>
            {theory && totalCost > theory.goldTheory && (
              <div className="text-red-400 text-xs mt-2">
                ⚠️ Недостаточно Серебра! (доступно: {formatNumber(theory.goldTheory)})
              </div>
            )}
          </div>
        )}

        {isConfirmed ? (
          <div className="success-box mb-4">
            <span className="text-green-400">✓ Здания построены!</span>
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
              Построить ещё
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
            onClick={handleBuild}
            disabled={isPending || isConfirming || selectedTiles.length === 0 || isWrongNetwork}
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
              `Построить (${selectedTiles.length} клеток)`
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
