import React from 'react'

export const DepositWithdraw = ({ deposit, withdraw }: any) => {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className='text-xl font-black -mt-2'>Deposit/Withdraw</span>
        <div className="max-w-md mx-auto">
          <input type="text" placeholder="Type here" className="input input-bordered w-full bg-transparent " />
          <div className="w-full flex items-center justify-between gap-4 mt-4">
            <button className='mainCTA'>Deposit</button>
            <button className='secondaryCTA'>Withdraw</button>
          </div>
        </div>
      </div>
    </>
  )
}

