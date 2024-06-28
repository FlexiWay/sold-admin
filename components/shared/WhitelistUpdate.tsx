"use client";

import React, { useEffect, useState } from "react";
import { useSold } from "../../hooks/useSold";
import { PublicKey } from "@solana/web3.js";
import { Spin } from "antd";

const UpdateModal = ({ open, setOpen }: any) => {
  const sold = useSold();
  const [error, setError] = useState("");

  const [textareaValue, setTextareaValue] = useState(
    JSON.stringify(sold.allowList, null, 1),
  );

  useEffect(() => {
    setTextareaValue(JSON.stringify(sold.allowList, null, 1)); // Update textarea when allowList changes
  }, [sold.allowList]);

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
      console.log(parsedValue);
      if (
        Array.isArray(parsedValue) &&
        parsedValue.every(
          (item) =>
            typeof item === "string" &&
            item.length > 0 &&
            isValidPublicKey(item),
        )
      ) {
        // Valid JSON string array with valid Solana public keys
        await sold.handleWhiteList(parsedValue);
        setOpen(false);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      setError(
        'Invalid input. Please enter a valid JSON string array with valid Solana public keys, e.g., ["key1", "key2"].',
      );
    }
  };

  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  return (
    <>
      <div
        className="absolute z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center"
        onClick={handleClickOutside}
      >
        <div
          className="w-full max-w-md bg-card-bg rounded-lg p-8"
          ref={modalRef}
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-xl font-black">Update Whitelist</span>
            <button onClick={() => setOpen(false)}>
              {/* close */}
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
              value={textareaValue}
              className="textarea textarea-bordered w-full bg-transparent"
              placeholder="
            Paste the updated .json to whitelist here...
            "
              onChange={handleTextareaChange}
            ></textarea>
            {error && <span className="text-red-500">{error}</span>}
            <div className="w-full flex items-center justify-between gap-4 mt-4">
              <button
                className="secondaryCTA w-full"
                onClick={handleUpdateClick}
              >
                Update
              </button>
              {/* <button className='secondaryCTA'>Reset</button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function WhitelistUpdate() {
  const [open, setOpen] = useState(false);
  const sold = useSold();

  return (
    <>
      <div className="w-full flex flex-col items-center justify-between gap-4 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <div className="w-full flex items-center justify-center ">
          <span className="text-xl font-black">WhiteList</span>
        </div>
        <div className="w-full">
          <div className="w-full flex items-center justify-center gap-4">
            {sold.listFetched && (
              <button
                className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                onClick={() => setOpen(true)}
              >
                Update
              </button>
            )}
            {!sold.listFetched && <Spin />}
          </div>
        </div>
      </div>

      {open && <UpdateModal setOpen={setOpen} />}
    </>
  );
}
