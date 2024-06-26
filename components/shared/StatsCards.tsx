import React from "react";
import { useSold } from "../../hooks/useSold";

const cardTitles = [
  { title: "Total USDC in pool", key: "usdcInPool", img: "/usdc.svg" },
  { title: "Total PUSD supply", key: "totalSupply", img: "/pusd.png" },
  { title: "Total SPUSD supply", key: "xSoldSupply", img: "/spusd.png" },
];

const StatCard = ({ title, number, img }: any) => {
  const formattedNumber = number != null // Check if number is not null or undefined
    ? title === "Total USDC in pool"
      ? `$ ${number.toLocaleString()}`
      : `${number.toLocaleString()}`
    : 'N/A'; // Default text if number is undefined


  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8  bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className="opacity-60 text-xs">{title}</span>
        <div className="w-full flex items-center justify-center gap-3">
          <img src={img} alt={title} className='rounded-full object-center w-8 h-8' />
          <span className="text-[24px] font-black -mt-1 leading-8">{formattedNumber}</span>
        </div>
      </div>
    </>
  );
};

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
      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {cardTitles.map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {cardTitles.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            number={sold.statCardData[card.key]}
            img={card.img}
          />
        ))}
      </div>
    </>
  );
};

export default StatsCards;
