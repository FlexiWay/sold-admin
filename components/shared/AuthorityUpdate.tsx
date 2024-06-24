'use client'

import React, { useState, useRef } from 'react';
import { useSold } from '../../hooks/useSold';
import { toast } from 'sonner';

const UpdateModal = ({ open, setOpen }: any) => {
  const sold = useSold();
  const modalRef = useRef<HTMLDivElement>(null);
  const [textareaValue, setTextareaValue] = useState('[]');
  const [error, setError] = useState('');

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(event.target.value);
    setError(''); // Clear error on new input
  };

  const handleUpdateClick = () => {
    try {
      const parsedValue = JSON.parse(textareaValue);
      if (Array.isArray(parsedValue) && parsedValue.every(item => typeof item === 'string')) {
        // Valid JSON string array
        sold.handleUpdateAuthority(parsedValue);
        setOpen(false);
      } else {
        throw new Error('Invalid format');
      }
    } catch (error) {
      setError('Invalid input. Please enter a valid JSON string array, e.g., ["1", "2"].');
    }
  };

  return (
    <div className="absolute z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center" onClick={handleClickOutside}>
      <div className="w-full max-w-md bg-card-bg rounded-lg p-8" ref={modalRef}>
        <div className="w-full flex items-center justify-between">
          <span className='text-xl font-black'>Update Authority</span>
          <button onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-4 mt-4">
          <textarea
            className="textarea textarea-bordered w-full bg-transparent"
            // placeholder='Paste the updated authority .json here...'
            value={textareaValue}
            onChange={handleTextareaChange}
          ></textarea>
          {error && <span className="text-red-500">{error}</span>}
          <div className="w-full flex items-center justify-between gap-4 mt-4">
            <button className='secondaryCTA w-full' onClick={handleUpdateClick}>Update</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthorityUpdate() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className='text-xl font-black -mt-2'>Authority Update</span>
        <div className="max-w-md mx-auto">
          <div className="w-full flex items-center justify-center gap-4 mt-4">
            <button className='secondaryCTA' onClick={() => setOpen(true)}>Update</button>
          </div>
        </div>
      </div>

      {open && <UpdateModal open={open} setOpen={setOpen} />}
    </>
  );
}
