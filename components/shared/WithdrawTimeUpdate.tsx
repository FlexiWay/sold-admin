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
                    />
                    <div className="w-full flex items-center justify-between gap-4 mt-4">
                        <div className="flex items-center justify-center gap-1 flex-col">
                            <button className='mainCTA' onClick={(e) => { sold.handleWithdrawTimeUpdate(inputValue, null) }}>Update Time Lock</button>
                            <span>{sold.getWithdrawTimeLock()?.toString() || 0}s</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 flex-col">
                            <button className='secondaryCTA' onClick={(e) => { sold.handleWithdrawTimeUpdate(null, inputValue) }}>Update Execution Time</button>
                            <span>{sold.getWithdrawExecutionWindow()?.toString() || 0}s</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
