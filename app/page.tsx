"use client"

import { useWallet } from '@solana/wallet-adapter-react';
import SecondRow from '../components/shared/SecondRow';
import StatsCards from '../components/shared/StatsCards';
import ThirdRow from '../components/shared/ThirdRow';
import { useSold } from '../hooks/useSold';
import Setup from '../components/shared/Setup';


const Index: React.FC = () => {

  const wallet = useWallet();
  const sold = useSold();

  console.log(sold);

  // TODO: Wallet Check
  if (!wallet.connected) {
    return <div className='flex items-center justify-center '>
      <p>Please connect your wallet</p>
    </div>
  }

  if (sold.loading) {
    return <div className='flex items-center justify-center '>
      <p>Loading...</p>
    </div>
  }

  if (!sold.poolManager && !sold.tokenManager) {
    return <div className='flex flex-col space-y-4 items-center justify-center '>
      <p>System needs to be initialized</p>
      <Setup />
    </div>
  }

  return (
    <>
      <section
        className='w-full flex flex-grow h-full flex-col items-center justify-center gap-20'

      >
        <div className="w-full flex flex-col items-center justify-center gap-4">
          <h1>Admin Dashboard</h1>
          <p className='opacity-50 text-center max-w-2xl'>
            Join us in redefining the Solana-based stablecoin space, with our unparalleled 20% yield Solana Dollar.
            Cast your vote and become an early supporter of Solana Dollar.
          </p>
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-6">
          {/* first row */}
          <StatsCards />
          {/* second row */}
          <SecondRow />
          {/* third row */}
          <ThirdRow />
          {/* yield update */}
        </div>
      </section >
    </>
  );
};

export default Index;