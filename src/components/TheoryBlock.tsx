'use client';

import { useKingdom } from '@/hooks/useKingdom';
import { formatNumber, calculateTheory } from '@/utils/calculations';
import { useEffect, useState } from 'react';

export function TheoryBlock() {
  const [mounted, setMounted] = useState(false);
  const { kingdom, isConnected } = useKingdom();
  const [theory, setTheory] = useState(kingdom?.theory);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update theory every second for live display
  useEffect(() => {
    if (!kingdom) return;

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

  if (!mounted) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">🧮</span>
          Теоретический расчёт
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
          <span className="icon">🧮</span>
          Теоретический расчёт
        </h2>
        <div className="card-content">
          <p className="text-gray-500 text-center py-4">Подключите кошелёк</p>
        </div>
      </div>
    );
  }

  if (!kingdom || !theory) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="icon">🧮</span>
          Теоретический расчёт
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
    <div className="card theory-card">
      <h2 className="card-title">
        <span className="icon">🧮</span>
        Теоретический расчёт
        <span className="ml-auto text-xs text-gray-500 font-normal">
          (без транзакции)
        </span>
      </h2>
      
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat-box gold theory">
            <span className="stat-label">Серебро (теория)</span>
            <span className="stat-value">{formatNumber(theory.goldTheory)}</span>
            <span className="stat-diff">+{formatNumber(theory.earned)} от storage</span>
          </div>
          <div className="stat-box gem theory">
            <span className="stat-label">Gems (теория)</span>
            <span className="stat-value">{formatNumber(theory.gemsTheory)}</span>
            <span className="stat-diff">+{formatNumber(theory.earned)} от storage</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="stat-box">
            <span className="stat-label">Часов прошло</span>
            <span className="stat-value text-blue-400">{theory.hoursPassed}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Начислено</span>
            <span className="stat-value text-green-400">+{formatNumber(theory.earned)}</span>
          </div>
        </div>

        <div className="formula-box mt-4">
          <span className="text-xs text-gray-500">Формула:</span>
          <code className="text-xs">
            hoursPassed = floor(now/3600) - floor(claimTime/3600)
            <br />
            earned = hoursPassed × perHour
          </code>
        </div>

        <div className="info-banner mt-4">
          <div className="flex items-start gap-2">
            <span className="text-sm">ℹ️</span>
            <div className="flex-1 text-xs text-gray-300 leading-relaxed">
              <strong className="text-white">Почему есть теоретический расчёт?</strong>
              <br />
              В смарт-контракте хранятся данные на момент последней транзакции (gold, gems, claimTime, perHour). 
              Дальше мы сами рассчитываем, сколько должно накопиться за прошедшее время по формуле collect. 
              Реальные значения обновятся только при следующей транзакции в контракте.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
