import { useState } from "react";
import { useSold } from "../../hooks/useSold";
import { Spin } from "antd";

export const PauseUnpause = () => {
  const sold = useSold();
  const [isDisabled,setIsDisabled] = useState(!sold.getTokenAdminState());

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-6 p-8  bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10 bg-opacity-50 backdrop-blur-xl">
        <span className="text-xl font-black -mt-2">Pause/Unpause</span>
        <div className={`${isDisabled?"opacity-[0.2]":""} w-full flex items-center justify-center`}>
          <div
            className={`cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center ${sold.tokenManager?.active ? `rounded-full p-2 bg-[#1B1E24] bg-opacity-100 ` : `rounded-full bg-black p-4 animate-bounce`}`}
          >
            {!sold.tokenManager?.active ? (
              <>
                {/* pause */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-12 -mr-2 -mt-2 "
                  onClick={(e)=>{
                    if(!isDisabled) sold.handleToggleActive();
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                  />
                </svg>
              </>
            ) : (
              <>
                {/* start */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-8   "
                  onClick={(e)=>{
                    if(!isDisabled) sold.handleToggleActive();
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                  />
                </svg>
              </>
            )}
          </div>
        </div>
        {/* <div className="w-full flex items-center justify-center gap-4 mt-4">
          <button
            className={`${sold.tokenManager?.active ? "secondaryCTA" : "secondaryCTA"}`}
            onClick={sold.handleToggleActive}
            disabled={sold.tokenManager?.active || sold.loading}
          >
            {sold.loading ? <Spin size="small" /> : "Unpause"}
          </button>
          <button
            className={`${sold.tokenManager?.active ? "secondaryCTA" : "secondaryCTA"}`}
            onClick={sold.handleToggleActive}
            disabled={!sold.tokenManager?.active || sold.loading}
          >
            {sold.loading ? <Spin size="small" /> : "Pause"}
          </button>
        </div> */}
      </div>
    </>
  );
};
