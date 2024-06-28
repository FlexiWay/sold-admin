"use client";

import React, { useState, useRef } from "react";
import { useSold } from "../../hooks/useSold";
import { toast } from "sonner";
import { Spin } from 'antd';

const MetadataUpdateModal = ({ open, setOpen }: any) => {
  const sold = useSold();
  const modalRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [xMintUpdate, setXMintUpdate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [metadataValues, setMetadataValues] = useState({
    name: "",
    symbol: '',
    uri: "",
    xmint: false
  })


  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
    const { name, value } = event.target;
    setMetadataValues((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on new input
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state
    toast.loading("Updating Metadata...");
    try {
      await sold.handleMetadataUpdate(metadataValues);
      toast.success("Metadata update successful");
      setOpen(false); // Close the modal
    } catch (e) {
      setError("Failed to update metadata");
      console.error("Error updating metadata:", e);
      toast.error("Failed to update metadata");
    } finally {
      setLoading(false); // Reset loading state
      toast.dismiss();
    }
  };

  return (
    <div
      className="fixed z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div className="w-full max-w-md bg-card-bg rounded-lg p-8" ref={modalRef}>
        <div className="w-full flex items-center justify-between">
          <span className="text-xl font-black">Update Metadata</span>
          <button onClick={() => setOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out"
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
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-start justify-start gap-2"
          >
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={metadataValues.name}
              onChange={handleInputChange}
              className="input w-full bg-transparent"
            />
            <input
              type="text"
              placeholder="Symbol"
              name="symbol"
              value={metadataValues.symbol}
              onChange={handleInputChange}
              className="input w-full bg-transparent"
            />
            <input
              type="text"
              placeholder="URI"
              name="uri"
              value={metadataValues.uri}
              onChange={handleInputChange}
              className="input w-full bg-transparent"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle"
                checked={metadataValues.xmint}
                onChange={() =>
                  setMetadataValues((prev) => ({
                    ...prev,
                    xmint: !prev.xmint,
                  }))
                }
              />
              <span>xMint</span>
            </label>
            <div className="w-full flex items-center justify-between gap-4 mt-4">
              <button
                type="submit"
                className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-brand-first ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
                disabled={loading}
              >
                {loading ? <><Spin size='small' /> Updating...</> : "Update"}
              </button>
            </div>
          </form>
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default function MetadataUpdate() {
  const [open, setOpen] = useState(false);
  const sold = useSold();

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <div className="w-full flex items-center justify-start">
          <span className="text-xl font-black -mt-2">Metadata</span>
        </div>
        {/* <div className="flex items-center justify-end gap-2 w-full">
          <div className='w-1/2 flex flex-col items-center justify-center bg-slate-900  rounded-xl gap-4 p-4'>
            <span className='text-[10px] text-opacity-80'>Mint:</span>
            <span>NAME</span>
            <span className='italic'>SYMBOL</span>
            <span className='w-full truncate'>URI</span>
          </div>
          <div className='w-1/2 flex flex-col items-center justify-center bg-slate-900  rounded-xl gap-4 p-4'>
            <span className='text-[10px] text-opacity-80'>xMint:</span>
            <span>NAME</span>
            <span className='italic'>SYMBOL</span>
            <span className='w-full truncate'>URI</span>
          </div>
        </div> */}
        <div className="w-full max-w-md mx-auto">
          <div className="w-full flex items-center justify-between gap-4 mt-4">

            <button
              className={`w-full h-full rounded-lg text-white py-4 px-8 disabled:cursor-not-allowed uppercase bg-[#1B1E24] ${sold.loading && `text-opacity-50`} disabled:text-gray-80 disabled:text-opacity-20  bg-opacity-100 disabled:bg-opacity-10 hover:bg-opacity-20 ease-in-out transition-all duration-300`}
              onClick={() => setOpen(true)}>
              Update Metdata
            </button>
          </div>
        </div>
      </div >

      {open && <MetadataUpdateModal open={open} setOpen={setOpen} />
      }
    </>
  );
}
