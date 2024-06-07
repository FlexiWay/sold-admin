'use client'

import React, { useState } from 'react'

const UpdateModal = ({ open, setOpen }: any) => {
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
            <textarea className="textarea textarea-bordered w-full" placeholder="
            Paste the updated .json to whitelist here...
            "></textarea>
            <div className="w-full flex items-center justify-between gap-4 mt-4">
              <button className='mainCTA w-full'>Update</button>
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
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8  bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-20">
        <span className='text-xl font-black -mt-2'>Whitelist Update</span>
        <div className="max-w-md mx-auto">
          <div className="w-full flex items-center justify-center gap-4 mt-4">
            <button className='mainCTA' onClick={() => setOpen(true)}>Update</button>
            {/* <button className='secondaryCTA'>Withdraw</button> */}
          </div>
        </div>
      </div>

      {open && <UpdateModal setOpen={setOpen} />}
    </>
  )
}
