import { SetupOptions } from '@builderz/sold';
import React, { useState } from 'react';
import { useSold } from '../../hooks/useSold';
import { toast } from 'sonner';

const Setup: React.FC = () => {
    const [setupOptions, setSetupOptions] = useState<SetupOptions>({
        baseMintName: "SOLD",
        baseMintSymbol: "SOLD",
        baseMintUri: "https://builderz.dev/_next/image?url=%2Fimages%2Fheader-gif.gif&w=3840&q=75",
        baseMintDecimals: 6,
        xMintDecimals: 6,
        quoteMint: "",
        exchangeRate: 1.0,
        stakingInitialExchangeRate: 1.0,
        emergencyFundBasisPoints: 100,
        mintLimitPerSlot: 1000,
        redemptionLimitPerSlot: 1000,
        allowList: []
    });
    const [createQuoteMint, setCreateQuoteMint] = useState<string | null>(null);

    const sold = useSold();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setSetupOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTestQuoteMint = async () => {
        try {
            const { mint, resCreateQuote } = await sold.createTestQuoteMint(setupOptions);
            console.log(mint, resCreateQuote);

            setCreateQuoteMint(mint.publicKey);
            toast("Quote mint created")
        } catch (error) {
            toast("Failed to create test quote mint")
        }
    }

    const handleSetup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await sold.handleSystemSetup(setupOptions);
        toast("System setup complete")
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-center gap-4">
                <button className="btn" onClick={handleCreateTestQuoteMint}>Create Test Quote Mint</button>
                {createQuoteMint && <div>{createQuoteMint}</div>}
            </div>

            <form onSubmit={handleSetup}>
                <div className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
                    <label className="flex flex-col gap-2">
                        Base Mint Name
                        <input type="text" name="baseMintName" value={setupOptions.baseMintName} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Base Mint Symbol
                        <input type="text" name="baseMintSymbol" value={setupOptions.baseMintSymbol} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Base Mint URI
                        <input type="text" name="baseMintUri" value={setupOptions.baseMintUri} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Base Mint Decimals
                        <input type="number" name="baseMintDecimals" value={setupOptions.baseMintDecimals} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        xMint Decimals
                        <input type="number" name="xMintDecimals" value={setupOptions.xMintDecimals} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Quote Mint
                        <input type="text" name="quoteMint" value={setupOptions.quoteMint || ''} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Exchange Rate
                        <input type="number" name="exchangeRate" value={setupOptions.exchangeRate} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Staking Initial Exchange Rate
                        <input type="number" name="stakingInitialExchangeRate" value={setupOptions.stakingInitialExchangeRate} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Emergency Fund Basis Points
                        <input type="number" name="emergencyFundBasisPoints" value={setupOptions.emergencyFundBasisPoints} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Mint Limit Per Slot
                        <input type="number" name="mintLimitPerSlot" value={setupOptions.mintLimitPerSlot} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Redemption Limit Per Slot
                        <input type="number" name="redemptionLimitPerSlot" value={setupOptions.redemptionLimitPerSlot} onChange={handleInputChange} className="input input-bordered w-full bg-transparent" />
                    </label>
                    <label className="flex flex-col gap-2">
                        Allow List (comma-separated public keys)
                        <textarea name="allowList" value={setupOptions.allowList.join(', ')} onChange={handleInputChange} className="textarea textarea-bordered w-full bg-transparent" placeholder="Enter public keys separated by commas"></textarea>
                    </label>
                    <button type="submit" className="secondaryCTA">Initialize System</button>
                </div>
            </form>
        </div>
    );
};

export default Setup;