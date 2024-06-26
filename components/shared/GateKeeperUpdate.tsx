"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSold } from "../../hooks/useSold";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";

const GateKeeperModal = ({ open, setOpen }: any) => {
  const sold = useSold();
  const modalRef = useRef<HTMLDivElement>(null);
  const [textareaValue, setTextareaValue] = useState(JSON.stringify(sold.gateKeepers, null, 1),);
  const [error, setError] = useState("");

  useEffect(() => {
    setTextareaValue(JSON.stringify(sold.gateKeepers, null, 1)); // Update textarea when gateKeepers changes
  }, [sold.gateKeepers]);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setTextareaValue(event.target.value);
    setError(""); // Clear error on new input
  };

  const isValidPublicKey = (key: string): boolean => {
    try {
      new PublicKey(key);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateClick = async () => {
    try {
      const parsedValue = JSON.parse(textareaValue);
      if (
        Array.isArray(parsedValue) &&
        parsedValue.every(
          (item) =>
            typeof item === "string" &&
            item.length > 0 &&
            isValidPublicKey(item),
        )
      ) {
        if (parsedValue.length > 5) {
          throw new Error("Too many keys. The maximum is 5.");
        }
        // Valid JSON string array with valid Solana public keys
        await sold.handleUpdateGatekeeper(parsedValue);
        setOpen(false);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      setError(
        'Invalid input. Please enter a valid JSON string array with up to 5 valid Solana public keys, e.g., ["key1", "key2"].',
      );
    }
  };

  return (
    <div
      className="absolute z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div className="w-full max-w-md bg-card-bg rounded-lg p-8" ref={modalRef}>
        <div className="w-full flex items-center justify-between">
          <span className="text-xl font-black">Update Gatekeepers</span>
          <button onClick={() => setOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-4 mt-4">
          <textarea
            className="textarea textarea-bordered w-full bg-transparent min-h-12 h-full"
            // placeholder='Paste the updated authority .json here...'
            value={textareaValue}
            onChange={handleTextareaChange}
          ></textarea>
          {error && <span className="text-red-500">{error}</span>}
          <div className="w-full flex items-center justify-between gap-4 mt-4">
            <button className="secondaryCTA w-full" onClick={handleUpdateClick}>
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GateKeeperUpdate() {
  const [open, setOpen] = useState(false);
  const sold = useSold();

  return (
    <>
      <div className="w-full flex flex-col items-center justify-between gap-4 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <div className="w-full flex items-center justify-center">
          <span className="text-xl font-black">Gatekeepers</span>
        </div>
        <div className="w-full">
          <div className="w-full flex items-center justify-center gap-4">
            {/* <div className="w-full flex flex-col items-start justify-between gap-2 h-4 bg-gray-500 bg-opacity-50 overflow-y-scroll">
              {sold.gateKeepers.length > 0 &&
                sold.gateKeepers.map((keeper, index) => (
                  <span key={index} className="text-xs text-white truncate">
                    {keeper.toBase58()}
                  </span>
                ))}
            </div> */}
            <button
              className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={() => setOpen(true)}>
              Update
            </button>
          </div>
        </div>
      </div>

      {open && <GateKeeperModal open={open} setOpen={setOpen} />}
    </>
  );
}
