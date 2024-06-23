
import { SetupOptions } from '@builderz/sold';
import React, { useState } from 'react';
import { useSold } from '../../hooks/useSold';
import { toast } from 'sonner';
import { Spin, Tooltip } from 'antd';

const Setup: React.FC = () => {
    const [setupOptions, setSetupOptions] = useState<SetupOptions>({
        baseMintName: "SOLD",
        baseMintSymbol: "SOLD",
        baseMintUri: "https://shdw-drive.genesysgo.net/4d35gSa4Z8WHF265V196rhdgdZ6jFzpLULmeczQUjG5t/pusd_metadata.json",
        baseMintDecimals: 6,
        xMintDecimals: 6,
        quoteMint: "",
        exchangeRate: 1 * 10 ** 6, // Has to include quoteMintDecimals
        stakingInitialExchangeRate: 1 * 10 ** 6, // Has to include quoteMintDecimals
        emergencyFundBasisPoints: 1000,
        mintLimitPerSlot: 1000,
        redemptionLimitPerSlot: 1000,
        allowList: [],
        withdrawTimeLock: 3600,
        withdrawExecutionWindow: 3600
    });
    const [createQuoteMint, setCreateQuoteMint] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const sold = useSold();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setSetupOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTestQuoteMint = async () => {
        setLoading(true);
        try {
            const { mint, resCreateQuote } = await sold.createTestQuoteMint(setupOptions);
            console.log(mint, resCreateQuote);

            setCreateQuoteMint(mint.publicKey);
            toast("Quote mint created")
        } catch (error) {
            toast("Failed to create test quote mint")
        }
        setLoading(false);
    }

    const handleSetup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await sold.handleSystemSetup(setupOptions);
        toast("System setup complete")
    }

    return (
        <div className='w-full'>
            <div className="w-full flex flex-col items-center justify-center gap-4 mb-8">
                <span className='text-xs opacity-50'>Create a test mint and copy paste it into the quoteMint field of the form showing up after</span>
                <button className="secondaryCTA" onClick={handleCreateTestQuoteMint}>{loading && <Spin />}Create Test Quote Mint</button>
                {createQuoteMint && (
                    <div
                        className='text-green-500 cursor-pointer hover:underline'
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(createQuoteMint);
                                toast.success("Copied to clipboard!");
                            } catch (error) {
                                toast.error("Failed to copy!");
                            }
                        }}
                    >
                        {createQuoteMint}
                    </div>
                )}
            </div>



            <form onSubmit={handleSetup}>
                <div className="w-full grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Base Mint Name
                        <input type="text" name="baseMintName" value={setupOptions.baseMintName} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Base Mint Symbol
                        <input type="text" name="baseMintSymbol" value={setupOptions.baseMintSymbol} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Base Mint URI
                        <input type="text" name="baseMintUri" value={setupOptions.baseMintUri} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Base Mint Decimals
                        <input type="number" name="baseMintDecimals" value={setupOptions.baseMintDecimals} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        xMint Decimals
                        <input type="number" name="xMintDecimals" value={setupOptions.xMintDecimals} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        <div className="flex gap-2">
                            <span>Quote Mint</span> <span className="text-xs text-red-500">*</span></div>
                        <input required type="text" name="quoteMint" value={setupOptions.quoteMint || ''} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Exchange Rate
                        <div className="flex items-center gap-2">
                            <input type="number" name="exchangeRate" value={setupOptions.exchangeRate} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                            <Tooltip title="Includes quoteMintDecimals">
                                <span className="text-gray-500 cursor-help">ℹ️</span>
                            </Tooltip>
                        </div>
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Staking Initial Exchange Rate
                        <div className="flex items-center gap-2">
                            <input type="number" name="stakingInitialExchangeRate" value={setupOptions.stakingInitialExchangeRate} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                            <Tooltip title="Includes quoteMintDecimals">
                                <span className="text-gray-500 cursor-help">ℹ️</span>
                            </Tooltip>
                        </div>
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Mint Limit Per Slot
                        <input type="number" name="mintLimitPerSlot" value={setupOptions.mintLimitPerSlot} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Redemption Limit Per Slot
                        <input type="number" name="redemptionLimitPerSlot" value={setupOptions.redemptionLimitPerSlot} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Allow List (comma-separated public keys)
                        <textarea name="allowList" value={setupOptions.allowList.join(', ')} onChange={handleInputChange} className="textarea textarea-bordered w-full bg-transparent" placeholder="Enter public keys separated by commas"></textarea>
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Withdraw Timelock
                        <input type="number" name="withdrawTimelock" value={setupOptions.withdrawTimeLock} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2 items-start justify-start">
                        Withdraw Execution Window
                        <input type="number" name="withdrawExecutionWindow" value={setupOptions.withdrawExecutionWindow} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <div className="w-full flex items-center justify-center md:col-span-2 lg:col-span-3">
                        <button type="submit" className="secondaryCTA flex-grow">Initialize System</button>
                    </div>
                </div>
            </form>

        </div>
    );
};

export default Setup;