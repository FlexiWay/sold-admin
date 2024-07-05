"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSold } from "../../hooks/useSold";
import { PublicKey } from "@solana/web3.js";

const GateKeeperModal = ({ open, setOpen }: any) => {
  const sold = useSold();
  const modalRef = useRef<HTMLDivElement>(null);
  const [gatekeeperInput, setGatekeeperInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {}, [sold.gateKeepers]);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const isValidPublicKey = (key: string): boolean => {
    try {
      new PublicKey(key);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAddClick = () => {
    const trimmedInput = gatekeeperInput.trim();
    if (trimmedInput && isValidPublicKey(trimmedInput)) {
      sold.handleAddGatekeeper(trimmedInput);
      setGatekeeperInput("");
      setError("");
    } else {
      setError("Invalid Solana public key.");
    }
  };

  const handleRemoveClick = (index: number) => {
    const updatedGatekeepers = sold.gateKeepers.filter((_, i) => i !== index);
    //sold.handleUpdateGatekeeper(updatedGatekeepers);
  };

  return (
    <div
      className="absolute z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div className="w-full max-w-xl bg-card-bg rounded-lg p-8" ref={modalRef}>
        <div className="w-full flex items-center justify-between">
          <span className="text-xl font-black">Manage Gatekeepers</span>
          <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
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
          <div
            id="gatekeeperList"
            className="w-full bg-gray-800 bg-opacity-50 rounded-lg p-4 max-h-60 overflow-y-auto"
          >
            {sold.gateKeepers.length>0 && sold.gateKeepers.map((keeper, index) => (
              <div key={index} className="wallet flex items-center gap-4 mb-4">
                <button onClick={() => handleRemoveClick(index)} className="bg-red-500 text-white w-[30px] p-1 rounded">
                  X
                </button>
                <span className="text-left">{keeper.toBase58()}</span>
              </div>
            ))}

            {sold.gateKeepers.length==0 && <span>[ ]</span>}
          </div>
          <input
            type="text"
            className="text-black w-full mt-2 p-2 border rounded"
            placeholder="Add Gatekeeper..."
            value={gatekeeperInput}
            onChange={(e) => setGatekeeperInput(e.target.value)}
          />
          <button className="secondaryCTA w-full mt-2" onClick={handleAddClick}>
            Add
          </button>
          {error && <span className="text-red-500">{error}</span>}
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
            <button
              className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={() => setOpen(true)}
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {open && <GateKeeperModal open={open} setOpen={setOpen} />}
    </>
  );
}
