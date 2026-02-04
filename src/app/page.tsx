'use client';

import { WalletButton } from '@/components/WalletButton';
import { OnChainBlock } from '@/components/OnChainBlock';
import { TheoryBlock } from '@/components/TheoryBlock';
import { SwapBlock } from '@/components/SwapBlock';
import { SwapGemsToBNBBlock } from '@/components/SwapGemsToBNBBlock';
import { BuildBlock } from '@/components/BuildBlock';
import { BattleBlock } from '@/components/BattleBlock';
import { UpgradeBlock } from '@/components/UpgradeBlock';

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1>BNB King</h1>
            <p className="subtitle">Kingdom Manager • BSC Mainnet</p>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="main-container">
        <div className="grid-layout">
          <OnChainBlock />
          <TheoryBlock />
          <BattleBlock />
          <SwapBlock />
          <SwapGemsToBNBBlock />
          <BuildBlock />
          <UpgradeBlock />
        </div>
      </main>
    </>
  );
}
