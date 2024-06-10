'use client'

import React, { useState } from 'react'

export default function YieldUpdate() {
  const [inputValue, setInputValue] = useState(''); // Changed to string to allow empty input
  const [yieldValue, setYieldValue] = useState(0); // State to hold the updated yield value

  function handleInputChange(event: { target: { value: string; }; }) {
    const value = event.target.value;
    const numValue = parseInt(value, 10);
    if (!value || (numValue >= 0 && numValue <= 100)) { // Allow empty string and numbers from 0 to 100
      setInputValue(value);
    }
  }

  function updateYield() {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      setYieldValue(numValue); // Update the yieldValue with the current input value if it's a number
    }
    setInputValue(''); // Reset input value after updating yield
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10 bg-opacity-50 backdrop-blur-xl">
      <span className='text-xl font-black -mt-2'>Yield Update</span>
      <div className="max-w-md mx-auto">
        <div className="w-full flex items-center justify-between gap-4">
          <input
            type="number"
            placeholder="%"
            className="input input-bordered w-full bg-transparent"
            min="0"
            max="100"
            step="1"
            value={inputValue}
            onChange={handleInputChange}
          />
          <span className='text-xs opacity-50'>{yieldValue}%</span>
        </div>
        <div className="w-full flex items-center justify-center gap-4 mt-4">
          <button className='secondaryCTA' onClick={updateYield} disabled={isNaN(parseInt(inputValue, 10)) || parseInt(inputValue, 10) < 0 || parseInt(inputValue, 10) > 100}>
            {inputValue ? `Update to ${inputValue}%` : `Update Yield`}
          </button>
        </div>
      </div>
    </div>
  )
}