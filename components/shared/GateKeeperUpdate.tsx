"use client";

import React, { useState, useRef } from "react";
import { useSold } from "../../hooks/useSold";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";

const GateKeeperModal = ({ open, setOpen }: any) => {
  const sold = useSold();
  const modalRef = useRef<HTMLDivElement>(null);
  const [textareaValue, setTextareaValue] = useState("[]");
  const [error, setError] = useState("");

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
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className="text-xl font-black -mt-2">Gatekeeper</span>
        <div className="max-w-md mx-auto">
          <div className="w-full flex items-center justify-center gap-4 mt-4">
            <div className="w-full flex flex-col items-start justify-between gap-2 h-4 bg-gray-500 bg-opacity-50 overflow-y-scroll">
              {sold.gateKeepers.length > 0 &&
                sold.gateKeepers.map((keeper, index) => (
                  <span key={index} className="text-xs text-white truncate">
                    {keeper.toBase58()}
                  </span>
                ))}
            </div>
            <button className="secondaryCTA" onClick={() => setOpen(true)}>
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
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && <GateKeeperModal open={open} setOpen={setOpen} />}
    </>
  );
}
