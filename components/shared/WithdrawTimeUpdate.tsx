import React from "react";
import { useSold } from "../../hooks/useSold";
import { Spin } from "antd";

export const WithdrawTimeUpdate = ({ deposit, withdraw }: any) => {
  const sold = useSold();
  const [inputValue, setInputValue] = React.useState(0);

  const handleInputChange = (event: { target: { value: string } }) => {
    const value = event.target.value;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >=0) {
      setInputValue(numValue);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-start justify-between gap-0 h-[320px] p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className="text-xl font-black -mt-2">Withdraw Time</span>
        <div className="w-full relative flex items-center justify-start">
          <div className="absolute top-1/2 -translate-y-1/2 left-4 opacity-50 flex flex-col items-start justify-start">
            <span className="font-bold text-[14px]">
              s
            </span>
          </div>
          <input
            type="number"
            //placeholder="0"
            className="input input-bordered w-full bg-transparent !text-transparent"
            //value={inputValue}
            onChange={handleInputChange}
            onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
          />
          <div className="absolute top-1/2 -translate-y-1/2  z-0 pointer-events-none right-12 flex flex-col items-start justify-start">
            <span className="font-bold uppercase text-[18px]">
              {/* USDC */}
              {inputValue}
            </span>
          </div>
        </div>

        <div className="w-full flex items-center justify-center gap-4 -mt-4">
          <div className="w-1/2 flex items-center justify-center gap-1 flex-col">
            <span className=" font-bold text-xl">
              {sold.getWithdrawTimeLock()?.toString() || 0}s
            </span>
            <span className="opacity-50 text-xs">Time Lock</span>
            <button
              className={`w-full h-full rounded-full text-white py-2 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={(e) => {
                sold.handleWithdrawTimeUpdate(inputValue, null);
              }}
              disabled={inputValue < 0 || sold.loading}
            >
              {sold.loading ? <Spin size="small" /> : "Update"}
            </button>
          </div>
          <div className="w-1/2 flex items-center justify-center gap-1 flex-col">
            <span className=" font-bold text-xl">
              {sold.getWithdrawExecutionWindow()?.toString() || 0}s
            </span>
            <span className="opacity-50 text-xs">Execution Time Lock</span>
            <button
              className={`w-full h-full rounded-full text-white py-2 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={(e) => {
                sold.handleWithdrawTimeUpdate(null, inputValue);
              }}
              disabled={inputValue < 0 || sold.loading}
            >
              {sold.loading ? <Spin size="small" /> : "Update"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
