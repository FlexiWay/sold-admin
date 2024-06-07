import React from 'react'


const cardData = [
  { title: 'Total supply', number: 120 },
  { title: 'USDC in pool', number: 160594054950 },
  { title: 'Total staked', number: 3204893 },
  { title: 'xSOLD supply', number: 3498230498 },
]

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
  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {cardData.map((card, index) => (
          <StatCard key={index} title={card.title} number={card.number} />
        ))}
      </div>
    </>
  )
}

export default StatsCards