import React from 'react'
import { useSold } from '../../hooks/useSold';

export const WithdrawTimeUpdate = ({ deposit, withdraw }: any) => {
    const sold = useSold();
    const [inputValue, setInputValue] = React.useState(0)

    const handleInputChange = (event: { target: { value: string } }) => {
        const value = event.target.value;
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
            setInputValue(numValue);
        }
    };

    return (
        <>
            <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
                <span className='text-xl font-black -mt-2'>Withdraw Time</span>
                <div className="max-w-md mx-auto">
                    <input
                        type="number"
                        placeholder="0"
                        className="input input-bordered w-full bg-transparent"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                    />
                    <div className="w-full flex items-center justify-between gap-4 mt-4">
                        <div className="flex items-center justify-center gap-1 flex-col">
                            <span className='my-2 font-bold'>
                                {sold.getWithdrawTimeLock()?.toString() || 0}s
                            </span>
                            <span className='opacity-50 text-xs'>Time Lock</span>
                            <button
                                className='mainCTA'
                                onClick={(e) => { sold.handleWithdrawTimeUpdate(inputValue, null) }}
                                disabled={inputValue <= 0 || sold.loading}
                            >
                                Update
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-1 flex-col">
                            <span className='my-2 font-bold'>
                                {sold.getWithdrawExecutionWindow()?.toString() || 0}s
                            </span>
                            <span className='opacity-50 text-xs'>Execution Time Lock</span>
                            <button
                                className='secondaryCTA'
                                onClick={(e) => { sold.handleWithdrawTimeUpdate(null, inputValue) }}
                                disabled={inputValue <= 0 || sold.loading}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
