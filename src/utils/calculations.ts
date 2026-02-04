// Theoretical calculation utilities for BNBKing

export interface TileInfo {
  tileId: number;
  level: number;
  upgrades: number;
  raw: number;
}

export interface BuildingUpgradeInfo {
  tileId: number;
  rawValue: number;
  level: number;
  upgrades: number;
  upgradesLeft: number;
  upgradeCost: number;
  upgradePerHour: number;
}

export interface TheoryCalc {
  hoursPassed: number;
  earned: number;
  goldTheory: number;
  gemsTheory: number;
}

/**
 * Calculate theoretical silver/gems based on collect formula
 * hoursPassed = floor(now/3600) - floor(claimTime/3600)
 * earned = hoursPassed * perHour
 */
export function calculateTheory(
  gold: number,
  gems: number,
  perHour: number,
  claimTime: number
): TheoryCalc {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const hoursPassed = Math.max(0, Math.floor(nowSeconds / 3600) - Math.floor(claimTime / 3600));
  const earned = hoursPassed * perHour;
  
  return {
    hoursPassed,
    earned,
    goldTheory: gold + earned,
    gemsTheory: gems + earned,
  };
}

/**
 * Parse tiles array to get occupied and free tiles
 */
export function parseTiles(tiles: readonly number[] | number[]): {
  occupiedTiles: TileInfo[];
  freeTiles: number[];
  occupiedSet: Set<number>;
} {
  const occupiedTiles: TileInfo[] = [];
  const freeTiles: number[] = [];
  const occupiedSet = new Set<number>();

  for (let i = 0; i < 360; i++) {
    const value = Number(tiles[i] || 0);
    if (value === 0) {
      freeTiles.push(i);
    } else {
      occupiedSet.add(i);
      occupiedTiles.push({
        tileId: i,
        level: value % 10,
        upgrades: Math.floor(value / 10),
        raw: value,
      });
    }
  }

  return { occupiedTiles, freeTiles, occupiedSet };
}

/**
 * Find next free tile starting from a given index
 */
export function findNextFreeTile(occupiedSet: Set<number>, startFrom: number = 0): number | null {
  for (let i = startFrom; i < 360; i++) {
    if (!occupiedSet.has(i)) {
      return i;
    }
  }
  return null;
}

/**
 * Validate tile ID
 */
export function validateTileId(
  tileId: number,
  occupiedSet: Set<number>,
  selectedTiles: number[]
): { valid: boolean; error?: string } {
  if (isNaN(tileId) || tileId < 0 || tileId > 359) {
    return { valid: false, error: 'ID должен быть от 0 до 359' };
  }
  
  if (occupiedSet.has(tileId)) {
    return { valid: false, error: 'Клетка уже занята' };
  }
  
  if (selectedTiles.includes(tileId)) {
    return { valid: false, error: 'Тайл уже добавлен в список' };
  }
  
  return { valid: true };
}

/**
 * Format large numbers with spaces
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

/**
 * Convert timestamp to readable date
 */
export function formatClaimTime(timestamp: number): string {
  if (timestamp === 0) return 'Никогда';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Safely convert bigint to number
 */
export function safeToNumber(value: bigint | number): number {
  if (typeof value === 'number') return value;
  if (value <= BigInt(Number.MAX_SAFE_INTEGER)) {
    return Number(value);
  }
  console.warn('Value exceeds safe integer range:', value.toString());
  return Number(value);
}

/**
 * Parse occupied buildings with upgrade information
 * @param tiles - Array of 360 tile values
 * @param buildingStats - Building stats by level { cost, perHour }
 * @returns Array of BuildingUpgradeInfo for occupied tiles
 */
export function parseBuildingsForUpgrade(
  tiles: readonly number[] | number[],
  buildingStats: Record<number, { cost: number; perHour: number }>
): BuildingUpgradeInfo[] {
  const buildings: BuildingUpgradeInfo[] = [];

  for (let i = 0; i < 360; i++) {
    const rawValue = Number(tiles[i] || 0);
    if (rawValue === 0) continue; // Skip empty tiles

    const level = rawValue % 10;
    const upgrades = Math.floor(rawValue / 10);
    const upgradesLeft = 9 - upgrades;

    // Get building stats for this level
    const stats = buildingStats[level];
    if (!stats) continue; // Skip if level not found

    // Calculate upgrade cost and per hour (cost/4 and perHour/4)
    const upgradeCost = Math.floor(stats.cost / 4);
    const upgradePerHour = Math.floor(stats.perHour / 4);

    buildings.push({
      tileId: i,
      rawValue,
      level,
      upgrades,
      upgradesLeft,
      upgradeCost,
      upgradePerHour,
    });
  }

  return buildings;
}
