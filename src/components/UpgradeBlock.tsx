'use client';

import { useKingdom } from '@/hooks/useKingdom';
import { useUpgradeBuilding } from '@/hooks/useContractWrite';
import { formatNumber, parseBuildingsForUpgrade, calculateTheory } from '@/utils/calculations';
import { BUILDING_STATS, BSC_EXPLORER } from '@/config/contract';
import { useState, useEffect, useMemo } from 'react';
import { useBSCNetwork } from '@/hooks/useBSCNetwork';

export function UpgradeBlock() {
  const [mounted, setMounted] = useState(false);
  const { kingdom, isConnected, refetch } = useKingdom();
  const { upgrade, hash, isPending, isConfirming, isConfirmed, isError, error, reset } = useUpgradeBuilding();
  const { isWrongNetwork } = useBSCNetwork();
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Парсим здания для апгрейда
  const buildings = useMemo(() => {
    if (!kingdom) return [];
    return parseBuildingsForUpgrade(kingdom.tiles, BUILDING_STATS);
  }, [kingdom]);

  // Получаем текущую теорию серебра
  const theory = kingdom 
    ? calculateTheory(kingdom.gold, kingdom.gems, kingdom.perHour, kingdom.claimTime)
    : null;

  // Выбранное здание
  const selectedBuilding = selectedTileId !== null 
    ? buildings.find(b => b.tileId === selectedTileId)
    : null;

  // Валидация для выбранного здания
  const canUpgrade = selectedBuilding && 
    selectedBuilding.upgrades < 9 && 
    theory && 
    theory.goldTheory >= selectedBuilding.upgradeCost;

  // Refetch после подтверждения
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      setSelectedTileId(null);
    }
  }, [isConfirmed, refetch]);

  const handleUpgrade = () => {
    if (!selectedBuilding || !canUpgrade) return;
    if (isWrongNetwork) {
      return;
    }
    upgrade(selectedBuilding.tileId);
  };

  const handleReset = () => {
    reset();
    setSelectedTileId(null);
  };

  if (!mounted) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">⬆️</span>
          Апгрейд зданий
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
          <span className="icon">⬆️</span>
          Апгрейд зданий
        </h2>
        <div className="card-content">
          <p className="text-gray-500 text-center py-4">Подключите кошелёк</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card upgrade-block-full-width">
      <h2 className="card-title">
        <span className="icon">⬆️</span>
        Апгрейд зданий
      </h2>
      
      <div className="card-content">
        {isWrongNetwork && (
          <div className="error-box mb-4">
            <span className="text-red-400">⚠️ Неверная сеть! Переключитесь на BSC Mainnet для выполнения транзакций.</span>
          </div>
        )}

        {buildings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Нет зданий для апгрейда</p>
        ) : (
          <>
            {/* Таблица зданий */}
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse upgrade-table">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">Tile ID</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">Уровень</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">Апгрейды</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">Стоимость</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">+Доход/ч</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">Осталось</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-300">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {buildings.map((building) => {
                    const isMaxUpgrades = building.upgrades >= 9;
                    const hasEnoughGold = theory && theory.goldTheory >= building.upgradeCost;
                    const isSelected = selectedTileId === building.tileId;
                    
                    return (
                      <tr 
                        key={building.tileId} 
                        className={`border-b border-gray-800 hover:bg-gray-800/30 ${isSelected ? 'bg-gold-400/10' : ''}`}
                      >
                        <td className="p-3 text-base font-medium">#{building.tileId}</td>
                        <td className="p-3 text-base text-gold-400 font-semibold">Lv{building.level}</td>
                        <td className="p-3 text-base">{building.upgrades}/9</td>
                        <td className="p-3 text-base text-gold-400 font-medium">{formatNumber(building.upgradeCost)}</td>
                        <td className="p-3 text-base text-green-400 font-medium">+{formatNumber(building.upgradePerHour)}</td>
                        <td className="p-3 text-base">
                          {isMaxUpgrades ? (
                            <span className="text-red-400 font-semibold">Макс</span>
                          ) : (
                            <span className="font-medium">{building.upgradesLeft}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isMaxUpgrades ? (
                            <span className="text-sm text-gray-500">Макс</span>
                          ) : (
                            <button
                              onClick={() => setSelectedTileId(building.tileId)}
                              disabled={isPending || isConfirming}
                              className={`text-sm px-3 py-1.5 rounded font-medium transition-colors ${
                                isSelected 
                                  ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30' 
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                              }`}
                            >
                              Выбрать
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Форма апгрейда */}
            {selectedBuilding && (
              <div className="preview-box mb-4">
                <div className="preview-row">
                  <span>Выбрано здание:</span>
                  <span className="text-gold-400">Tile #{selectedBuilding.tileId} (Lv{selectedBuilding.level})</span>
                </div>
                <div className="preview-row">
                  <span>Текущие апгрейды:</span>
                  <span>{selectedBuilding.upgrades}/9</span>
                </div>
                <div className="preview-row">
                  <span>Стоимость апгрейда:</span>
                  <span className={`${canUpgrade ? 'text-gold-400' : 'text-red-400'}`}>
                    {formatNumber(selectedBuilding.upgradeCost)} Серебро
                  </span>
                </div>
                <div className="preview-row">
                  <span>Доход после апгрейда:</span>
                  <span className="text-green-400">+{formatNumber(selectedBuilding.upgradePerHour)}/час</span>
                </div>
                {selectedBuilding.upgrades >= 9 && (
                  <div className="text-red-400 text-xs mt-2">
                    ⚠️ Максимальное количество апгрейдов достигнуто
                  </div>
                )}
                {theory && selectedBuilding.upgradeCost > theory.goldTheory && (
                  <div className="text-red-400 text-xs mt-2">
                    ⚠️ Недостаточно Серебра! (доступно: {formatNumber(theory.goldTheory)})
                  </div>
                )}
              </div>
            )}

            {isConfirmed ? (
              <div className="success-box mb-4">
                <span className="text-green-400">✓ Здание улучшено!</span>
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
                  Улучшить ещё
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
                onClick={handleUpgrade}
                disabled={!selectedBuilding || !canUpgrade || isPending || isConfirming || isWrongNetwork}
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
                  `Улучшить здание #${selectedBuilding?.tileId || ''}`
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
