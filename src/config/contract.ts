// BNBKing Contract Configuration
export const BNBKING_ADDRESS = '0x864ee1d1b51306e30836b84ade81e39ebb6e8e0c' as const;

export const BNBKING_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_player', type: 'address' }],
    name: 'getKingdom',
    outputs: [
      {
        components: [
          { internalType: 'uint32', name: 'gold', type: 'uint32' },
          { internalType: 'uint32', name: 'gems', type: 'uint32' },
          { internalType: 'uint32', name: 'perHour', type: 'uint32' },
          { internalType: 'uint32', name: 'alliesCount', type: 'uint32' },
          { internalType: 'uint32', name: 'alliesEarned', type: 'uint32' },
          { internalType: 'uint32', name: 'claimTime', type: 'uint32' },
          { internalType: 'uint32', name: 'battleTime', type: 'uint32' },
          { internalType: 'uint16', name: 'battleId', type: 'uint16' },
          { internalType: 'uint8', name: 'battlesInRow', type: 'uint8' },
          { internalType: 'bool', name: 'isWinInRow', type: 'bool' },
          { internalType: 'address', name: 'ally', type: 'address' },
          { internalType: 'uint8[360]', name: 'tiles', type: 'uint8[360]' },
        ],
        internalType: 'struct Kingdom',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_gems', type: 'uint256' }],
    name: 'swapGemsToGold',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16[]', name: '_tileIds', type: 'uint16[]' },
      { internalType: 'uint8', name: '_level', type: 'uint8' },
    ],
    name: 'placeBuildings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_gems', type: 'uint256' }],
    name: 'sellGems',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'winChance', type: 'uint8' }],
    name: 'battle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint16', name: '_tileId', type: 'uint16' }],
    name: 'upgradeBuilding',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Building Stats Table
export const BUILDING_STATS: Record<number, { cost: number; perHour: number }> = {
  1: { cost: 10000, perHour: 8 },
  2: { cost: 28000, perHour: 24 },
  3: { cost: 54000, perHour: 48 },
  4: { cost: 100000, perHour: 96 },
  5: { cost: 250000, perHour: 248 },
  6: { cost: 500000, perHour: 520 },
  7: { cost: 1000000, perHour: 1100 },
  8: { cost: 2000000, perHour: 2300 },
};

// Exchange Rates
// 1 Gem = 2 Серебро (для swapGemsToGold)
export const GEMS_TO_GOLD_RATE = 2;

// Курс обмена Gems → BNB
// 1 000 000 Gems = 1 BNB
// 1 Gem = 0.000001 BNB
export const GEMS_TO_BNB_RATE = 0.000001;

// Battle Configuration
export const BATTLE_COOLDOWN = 86400; // 24 hours in seconds
export const MIN_WIN_CHANCE = 40;
export const MAX_WIN_CHANCE = 60;

// BSC Explorer URL
export const BSC_EXPLORER = 'https://bscscan.com';
