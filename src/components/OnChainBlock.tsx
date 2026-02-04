'use client';

import { useKingdom } from '@/hooks/useKingdom';
import { formatNumber, formatClaimTime } from '@/utils/calculations';
import { useState, useEffect } from 'react';

export function OnChainBlock() {
  const [mounted, setMounted] = useState(false);
  const { kingdom, isLoading, isError, error, isConnected, refetch } = useKingdom();
  const [showAllTiles, setShowAllTiles] = useState(false);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Показываем placeholder во время гидратации
  if (!mounted) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">📊</span>
          On-Chain данные
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
          <span className="icon">📊</span>
          On-Chain данные
        </h2>
        <div className="card-content">
          <p className="text-gray-500 text-center py-4">Подключите кошелёк</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">📊</span>
          On-Chain данные
        </h2>
        <div className="card-content">
          <div className="flex items-center justify-center py-8">
            <span className="spinner-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">📊</span>
          On-Chain данные
        </h2>
        <div className="card-content">
          <div className="text-red-400 text-center py-4">
            <p>Ошибка загрузки: {error?.message || 'Неизвестная ошибка'}</p>
            <button onClick={() => refetch()} className="btn btn-secondary mt-2">
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!kingdom) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">📊</span>
          On-Chain данные
        </h2>
        <div className="card-content">
          <p className="text-gray-500 text-center py-4">Нет данных</p>
        </div>
      </div>
    );
  }

  const displayedTiles = showAllTiles 
    ? kingdom.occupiedTiles 
    : kingdom.occupiedTiles.slice(0, 10);

  return (
    <div className="card">
      <h2 className="card-title">
        <span className="icon">📊</span>
        On-Chain данные
        <button onClick={() => refetch()} className="ml-auto text-sm btn-icon" title="Обновить">
          🔄
        </button>
      </h2>
      
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat-box gold">
            <span className="stat-label">Серебро (storage)</span>
            <span className="stat-value">{formatNumber(kingdom.gold)}</span>
          </div>
          <div className="stat-box gem">
            <span className="stat-label">Gems (storage)</span>
            <span className="stat-value">{formatNumber(kingdom.gems)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat-box">
            <span className="stat-label">Доход/час</span>
            <span className="stat-value text-green-400">+{formatNumber(kingdom.perHour)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Claim Time</span>
            <span className="stat-value text-sm">{formatClaimTime(kingdom.claimTime)}</span>
          </div>
        </div>

        <div className="tiles-section">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">
              Занято клеток: <span className="text-gold-400">{kingdom.occupiedTiles.length}</span> / 360
            </span>
            <span className="text-gray-500 text-xs">
              Свободно: {kingdom.freeTiles.length}
            </span>
          </div>

          {kingdom.occupiedTiles.length > 0 && (
            <div className="tiles-list">
              <div className="tiles-grid">
                {displayedTiles.map((tile) => (
                  <div key={tile.tileId} className="tile-badge">
                    <span className="tile-id">#{tile.tileId}</span>
                    <span className="tile-level">Lv{tile.level}</span>
                    {tile.upgrades > 0 && (
                      <span className="tile-upgrades">+{tile.upgrades}</span>
                    )}
                  </div>
                ))}
              </div>
              
              {kingdom.occupiedTiles.length > 10 && (
                <button
                  onClick={() => setShowAllTiles(!showAllTiles)}
                  className="text-xs text-gold-400 hover:text-gold-300 mt-2"
                >
                  {showAllTiles 
                    ? 'Скрыть' 
                    : `Показать все (${kingdom.occupiedTiles.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
