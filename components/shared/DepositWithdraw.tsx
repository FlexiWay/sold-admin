"use client";

import React, { useEffect } from "react";
import { useSold } from "../../hooks/useSold";
import CountdownTimer from "./CountDownTimer";
import { Spin } from "antd";
import Image from "next/image";

export const DepositWithdraw = ({ deposit, withdraw }: any) => {
  const sold = useSold();
  const [inputValue, setInputValue] = React.useState(0);

  const [isExecuteWindow, setIsExecuteWindow] = React.useState(false);
  const [withdrawExpired, setWithdrawExpired] = React.useState(false);

  useEffect(() => {
    checkTimeWindow();
    //const interval = setInterval(checkTimeWindow, 1000);
    // return () => clearInterval(interval);
  }, [sold]);

  const handleInputChange = (event: { target: { value: string } }) => {
    const value = event.target.value;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setInputValue(numValue);
    }
  };

  const checkTimeWindow = () => {
    if (!sold.tokenManager) return;

    const {
      pendingWithdrawalAmount,
      withdrawExecutionWindow,
      withdrawTimeLock,
    } = sold.tokenManager;
    if (pendingWithdrawalAmount <= 0) return;

    const now = Date.now();
    const withdrawInitiationTime =
      Number(sold.getWithdrawIntiationTime()) * 1000; // Convert to milliseconds
    const elapsed = now - withdrawInitiationTime;

    const withdrawTimeLockDuration = Number(withdrawTimeLock) * 1000;
    const withdrawExecutionWindowDuration =
      Number(withdrawExecutionWindow) * 1000;

    console.log(elapsed);
    console.log(withdrawTimeLockDuration);
    console.log(withdrawExecutionWindowDuration);
    if (elapsed < withdrawTimeLockDuration) {
      // Keep running the withdraw time lock timer
      console.log("running withdraw timer");
      setIsExecuteWindow(false);
      setWithdrawExpired(false);
    } else if (
      elapsed <
      withdrawTimeLockDuration + withdrawExecutionWindowDuration
    ) {
      console.log("running execution timer");
      // Run withdraw execution timer
      setIsExecuteWindow(true);
      setWithdrawExpired(false);
    } else {
      console.log("both time has expired");
      // Both timers have expired
      setIsExecuteWindow(false);
      setWithdrawExpired(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-between gap-2 h-[320px] p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
      <span className="text-xl font-black -mt-2">Deposit/Withdraw</span>
      <div className="w-full relative flex items-center justify-start">
        <Image
          width={32}
          height={32}
          src="/usdc.svg"
          alt="usdc"
          className="w-6 h-6 absolute z-30 left-3 top-1/2 -translate-y-1/2 rounded-full"
        />
        <input
          type="number"
          placeholder="0"
          className="input input-bordered w-full bg-transparent !text-transparent"
          // value={inputValue}
          onChange={handleInputChange}
          onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
        />
        <span className="pr-10 absolute right-0 z-0 top-1/2 -translate-y-[55%] text-[14px] opacity-100 flex flex-col items-end justify-center -gap-0 pointer-events-none">
          <span className="text-[20px] text-white">{inputValue}</span>
        </span>
        <div className="absolute top-1/2 -translate-y-1/2 left-12  z-0 pointer-events-none flex flex-col items-start justify-start">
          <span className="font-bold uppercase text-[18px]">USDC</span>
        </div>
      </div>
      <div className="w-full flex items-center justify-between gap-4 mt-4">
        <button
          className={`w-1/2 h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
          onClick={() => sold.handleDeposit(inputValue)}
          disabled={inputValue <= 0}
        >
          Deposit
        </button>
        {(sold.tokenManager?.pendingWithdrawalAmount || 0 > 0) &&
        !withdrawExpired ? (
          !isExecuteWindow ? (
            <div className="w-1/2 flex items-center justify-center gap-1 flex-col">
              <button
                className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                disabled={true}
                onClick={() => sold.handleWithdraw(inputValue)}
              >
                Withdraw
              </button>
              <CountdownTimer
                timerMsg={"opens in"}
                onFinish={checkTimeWindow}
                totalTime={Number(sold.getWithdrawTimeLock())}
                targetTimestamp={Number(sold.getWithdrawIntiationTime())}
              />
            </div>
          ) : (
            <div className="w-1/2 flex items-center justify-center gap-1 flex-col">
              <button
                className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                onClick={() => sold.handleWithdraw(inputValue)}
                disabled={withdrawExpired || inputValue <= 0 || sold.loading}
              >
                {sold.loading ? <Spin size="small" /> : "Withdraw"}
              </button>
              <CountdownTimer
                timerMsg={"closes in"}
                onFinish={checkTimeWindow}
                totalTime={Number(sold.getWithdrawExecutionWindow())}
                targetTimestamp={
                  Number(sold.getWithdrawIntiationTime()) +
                  Number(sold.getWithdrawTimeLock())
                }
              />
            </div>
          )
        ) : (
          <div className="w-1/2 flex items-center justify-center gap-1 flex-col">
            <button
              className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={() => sold.handleInitiateWithdraw(inputValue)}
              disabled={withdrawExpired || inputValue <= 0 || sold.loading}
            >
              {sold.loading ? <Spin size="small" /> : "Init. Withdraw"}
            </button>
            {withdrawExpired && <span>Withdraw Expired!!</span>}
          </div>
        )}
      </div>
    </div>
  );
};
