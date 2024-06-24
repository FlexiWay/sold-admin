'use client'

import React, { useEffect, useState } from 'react'
import { useSold } from '../../hooks/useSold';

const UpdateModal = ({ open, setOpen }: any) => {
  const { allowList } = useSold();

  const [textareaValue, setTextareaValue] = useState(JSON.stringify(allowList, null, 2));

  useEffect(() => {
    setTextareaValue(JSON.stringify(allowList, null, 2)); // Update textarea when allowList changes
  }, [allowList]);

  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  return (
    <>
      <div className="absolute z-50 inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-xl flex items-center justify-center" onClick={handleClickOutside}>
        <div className="w-full max-w-md bg-card-bg rounded-lg p-8" ref={modalRef}>
          <div className="w-full flex items-center justify-between">
            <span className='text-xl font-black'>Update Whitelist</span>
            <button onClick={() => setOpen(false)}>
              {/* close */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-4 mt-4">
            <textarea value={textareaValue} className="textarea textarea-bordered w-full bg-transparent" placeholder="
            Paste the updated .json to whitelist here...
            "></textarea>
            <div className="w-full flex items-center justify-between gap-4 mt-4">
              <button className='secondaryCTA w-full'>Update</button>
              {/* <button className='secondaryCTA'>Reset</button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function WhitelistUpdate() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8  bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
        <span className='text-xl font-black -mt-2'>Whitelist</span>
        <div className="max-w-md mx-auto">
          <div className="w-full flex items-center justify-center gap-4 mt-4">
            <button className='secondaryCTA' onClick={() => setOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            {/* <button className='secondaryCTA'>Withdraw</button> */}
          </div>
        </div>
      </div>

      {open && <UpdateModal setOpen={setOpen} />}
    </>
  )
}
