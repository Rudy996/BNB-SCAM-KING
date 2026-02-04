'use client';

import { useReadContract, useAccount } from 'wagmi';
import { BNBKING_ADDRESS, BNBKING_ABI } from '@/config/contract';
import { useMemo } from 'react';
import { 
  parseTiles, 
  calculateTheory, 
  safeToNumber,
  type TileInfo, 
  type TheoryCalc 
} from '@/utils/calculations';

export interface KingdomData {
  gold: number;
  gems: number;
  perHour: number;
  alliesCount: number;
  alliesEarned: number;
  claimTime: number;
  battleTime: number;
  battleId: number;
  battlesInRow: number;
  isWinInRow: boolean;
  ally: string;
  tiles: number[];
}

export interface ParsedKingdom extends KingdomData {
  occupiedTiles: TileInfo[];
  freeTiles: number[];
  occupiedSet: Set<number>;
  theory: TheoryCalc;
}

export function useKingdom() {
  const { address, isConnected } = useAccount();

  const { 
    data: rawKingdom, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useReadContract({
    address: BNBKING_ADDRESS,
    abi: BNBKING_ABI,
    functionName: 'getKingdom',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const kingdom = useMemo<ParsedKingdom | null>(() => {
    if (!rawKingdom) return null;

    // rawKingdom is a tuple: [gold, gems, perHour, alliesCount, alliesEarned, claimTime, battleTime, battleId, battlesInRow, isWinInRow, ally, tiles]
    const gold = safeToNumber(rawKingdom.gold);
    const gems = safeToNumber(rawKingdom.gems);
    const perHour = safeToNumber(rawKingdom.perHour);
    const alliesCount = safeToNumber(rawKingdom.alliesCount);
    const alliesEarned = safeToNumber(rawKingdom.alliesEarned);
    const claimTime = safeToNumber(rawKingdom.claimTime);
    const battleTime = safeToNumber(rawKingdom.battleTime);
    const battleId = safeToNumber(rawKingdom.battleId);
    const battlesInRow = safeToNumber(rawKingdom.battlesInRow);
    const isWinInRow = rawKingdom.isWinInRow;
    const ally = rawKingdom.ally;
    const tiles = Array.from(rawKingdom.tiles).map(safeToNumber);

    const { occupiedTiles, freeTiles, occupiedSet } = parseTiles(tiles);
    const theory = calculateTheory(gold, gems, perHour, claimTime);

    return {
      gold,
      gems,
      perHour,
      alliesCount,
      alliesEarned,
      claimTime,
      battleTime,
      battleId,
      battlesInRow,
      isWinInRow,
      ally,
      tiles,
      occupiedTiles,
      freeTiles,
      occupiedSet,
      theory,
    };
  }, [rawKingdom]);

  return {
    kingdom,
    isLoading,
    isError,
    error,
    refetch,
    isConnected,
    address,
  };
}
