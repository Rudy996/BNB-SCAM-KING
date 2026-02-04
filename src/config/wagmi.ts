'use client';

import { http, createConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// BSC Mainnet configuration
export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org/'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
