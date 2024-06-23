import React from 'react'
import { useSold } from '../../hooks/useSold';

const cardTitles = [
  { title: 'Total supply', key: 'totalSupply' },
  { title: 'USDC in pool', key: 'usdcInPool' },
  { title: 'Total staked', key: 'totalStaked' },
  { title: 'xSOLD supply', key: 'xSoldSupply' },
];

const StatCard = ({ title, number }: any) => {
  const formattedNumber = title === 'USDC in pool' ? `$ ${number.toLocaleString()}` : number.toLocaleString();

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8  bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className='text-xl font-black -mt-2'>{formattedNumber}</span>
        <span className='opacity-60'>Total {title}</span>
      </div>
    </>
  )
}

const StatsCards = () => {
  const sold = useSold();

  const SkeletonCard = () => (
    <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg bg-opacity-50 rounded-lg lg:rounded-xl text-center border border-white border-opacity-10 animate-pulse">
      <div className="h-6 bg-gray-300 w-full rounded"></div>
      <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
    </div>
  );

  if (sold.loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {cardTitles.map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {cardTitles.map((card, index) => (
          <StatCard key={index} title={card.title} number={sold.statCardData[card.key]} />
        ))}
      </div>
    </>
  )
}

export default StatsCards