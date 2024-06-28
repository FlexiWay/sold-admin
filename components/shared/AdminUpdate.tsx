'use client'

import React, { useState, useRef } from "react";
import { useSold } from "../../hooks/useSold";
import { Spin } from "antd";

const AdminUpdateModal = ({ setOpen }: any) => {
  const sold = useSold();
  const modalRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setError("");
  };

  const handleUpdateClick = async () => {
    setLoading(true);
    try {
      if (inputValue.trim()) {
        await sold.handleUpdateAdmin(inputValue.trim());
        setOpen(false);
      } else {
        throw new Error("Invalid input");
      }
    } catch (error) {
      setError("Invalid input. Please enter a valid public key.");
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div className="w-full max-w-md bg-card-bg rounded-lg p-8" ref={modalRef}>
        <div className="w-full flex items-center justify-between">
          <span className="text-xl font-black">Update Authority</span>
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
          <input
            type="text"
            className="input input-bordered w-full bg-transparent"
            value={inputValue}
            placeholder="Enter new admin..."
            onChange={handleInputChange}
          />
          {error && <span className="text-red-500">{error}</span>}
          <div className="w-full flex items-center justify-between gap-4 mt-4">
            <button className="secondaryCTA w-full" onClick={handleUpdateClick}>
              {loading ? <Spin size="small" /> : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUpdate() {
  const sold = useSold();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <div className="w-full flex items-center justify-start">
          <span className="text-xl font-black -mt-2">Admin</span>
        </div>
        <div className="w-full max-w-md mx-auto">
          <div className="w-full flex items-center justify-between gap-4 mt-4">
            <span className="text-xs text-white truncate">
              {sold.admin?.toBase58()}
            </span>
            <button className="btn btn-sm" onClick={() => setOpen(true)}>
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

      {open && <AdminUpdateModal setOpen={setOpen} />}
    </>
  );
}
