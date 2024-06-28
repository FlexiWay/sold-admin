"use client";

import React, { useState } from "react";
import { useSold } from "../../hooks/useSold";
import { Spin } from "antd";
import { useWallet } from "@solana/wallet-adapter-react";

export function YieldUpdate() {
  const sold = useSold();
  const [inputValue, setInputValue] = useState(""); // Changed to string to allow empty input
  const [yieldValue, setYieldValue] = useState(0); // State to hold the updated yield value
  const wallet = useWallet();

  const { annualYieldRate, loading } = sold;

  function handleInputChange(event: { target: { value: string } }) {
    const value = event.target.value;
    const numValue = parseInt(value, 10);
    if (!value || (numValue >= 0 && numValue <= 100)) {
      // Allow empty string and numbers from 0 to 100
      setInputValue(value);
    }
  }

  function updateYield() {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      setYieldValue(numValue); // Update the yieldValue with the current input value if it's a number
      sold.handleYieldUpdate(numValue);
    }
    setInputValue(""); // Reset input value after updating yield
  }

  return (
    <div className="w-full flex flex-col items-start justify-between gap-2 h-[320px] p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
      <div className="w-full flex items-center justify-between">
        <span className="text-xl font-black">Yield Update</span>
        <div className="w-2/5 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl py-1 flex items-center justify-center gap-2 text-sm">
          <span>sPUSD APY</span>
          {annualYieldRate && wallet.publicKey && (
            <span className="bg-apy-gradient text-transparent bg-clip-text">
              {loading ? <> </> : <>{annualYieldRate}%</>}
            </span>
          )}
        </div>
      </div>
      <div className="w-full">
        <div className="w-full relative flex items-center justify-start -mt-4">
          <div className="absolute top-1/2 -translate-y-1/2 left-4 opacity-50 flex flex-col items-start justify-start">
            <span className="font-bold text-[14px]">%</span>
          </div>
          <input
            type="number"
            // placeholder="0"
            className="input input-bordered w-full bg-transparent !text-transparent"
            // value={inputValue}
            onChange={handleInputChange}
            onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-12 z-0 pointer-events-none flex flex-col items-start justify-start">
            <span className="font-bold uppercase text-[18px]">
              {inputValue}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-center gap-4 mt-4">
        <button
          className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
          onClick={updateYield}
          disabled={
            isNaN(parseInt(inputValue, 10)) ||
            parseInt(inputValue, 10) < 0 ||
            parseInt(inputValue, 10) > 100
          }
        >
          {sold.loading ? (
            <Spin size="small" className="" />
          ) : (
            <>{inputValue ? `Update to ${inputValue}%` : `Update Yield`}</>
          )}
        </button>
      </div>
    </div>
  );
}
