import { safeFetchPoolManager, safeFetchTokenManager, findPoolManagerPda, findTokenManagerPda, PoolManager, TokenManager, createTestQuote, SetupOptions, toggleActive, setup, SOLD_STAKING_PROGRAM_ID } from "@builderz/sold";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { createSplAssociatedTokenProgram, createSplTokenProgram } from "@metaplex-foundation/mpl-toolbox"
import { toast } from "sonner";
import { TransactionBuilder } from "@metaplex-foundation/umi"
// @ts-ignore
import bs58 from "bs58";

// TODO: Move this into npm package
const bigIntToFloat = (bigIntValue: bigint, decimals: number): number => {
    return Number(bigIntValue) / Math.pow(10, decimals);
};

export const useSold = () => {
    const [loading, setLoading] = useState(false);

    const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);
    const [poolManager, setPoolManager] = useState<PoolManager | null>(null);
    const [reset, setReset] = useState(0);

    const [statCardData, setStatCardData] = useState<{
        totalSupply: number;
        usdcInPool: number;
        totalStaked: number;
        xSoldSupply: number;
        [key: string]: number;
    }>({
        totalSupply: 0,
        usdcInPool: 0,
        totalStaked: 0,
        xSoldSupply: 0
    });

    const wallet = useWallet();
    const { connection } = useConnection()

    const umi = createUmi(connection);
    umi.programs.add(createSplAssociatedTokenProgram());
    umi.programs.add(createSplTokenProgram());

    umi.use(walletAdapterIdentity(wallet))

    const tokenManagerPubKey = findTokenManagerPda(umi);
    const poolManagerPubKey = findPoolManagerPda(umi);

    useEffect(() => {
        const fetchState = async () => {
            setLoading(true);

            const tokenManagerAcc = await safeFetchTokenManager(umi, tokenManagerPubKey);
            const poolManagerAcc = await safeFetchPoolManager(umi, poolManagerPubKey);

            setTokenManager(tokenManagerAcc);
            setPoolManager(poolManagerAcc);

            // Stat stat cards
            tokenManagerAcc && (
                setStatCardData({
                    totalSupply: bigIntToFloat(tokenManagerAcc.totalSupply, tokenManagerAcc.mintDecimals),
                    usdcInPool: bigIntToFloat(tokenManagerAcc.totalCollateral, tokenManagerAcc.quoteMintDecimals),
                    totalStaked: 0,
                    xSoldSupply: 0
                })
            )

            setLoading(false);
        }

        if (wallet.publicKey) {
            fetchState()
        }
    }, [wallet.publicKey, reset])

    const refetch = () => {
        setReset(prev => prev + 1);
    }

    const createTestQuoteMint = async (setupOptions: SetupOptions) => {
        try {
            const { mint, txBuilder } = await createTestQuote(umi, setupOptions.baseMintDecimals);
            const resCreateQuote = await txBuilder.sendAndConfirm(umi);
            return { mint, resCreateQuote };
        } catch (error) {
            console.error("Failed to create test quote mint:", error);
            throw error;
        }
    }

    const handleSystemSetup = async (setupOptions: SetupOptions) => {
        try {
            const txBuilderSetup = await setup(umi, setupOptions);
            const resSetup = await txBuilderSetup.sendAndConfirm(umi, { confirm: { commitment: "finalized" } });
            console.log(resSetup);
            refetch()
        } catch (error) {
            console.error("Failed to handle system setup:", error);
            toast("Failed to handle system setup")
            refetch()
        }
    }

    const handleToggleActive = async () => {
        try {
            let txBuilder = new TransactionBuilder()

            txBuilder = txBuilder.add(toggleActive(umi, {
                tokenManager: tokenManagerPubKey,
                active: !tokenManager?.active
            }));

            console.log(txBuilder);

            const resToggleActive = await txBuilder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
            console.log(bs58.encode(resToggleActive.signature));

            toast(`${tokenManager?.active ? "Paused" : "Unpaused"}`)
            refetch()
        } catch (error) {
            console.error("Failed to handle toggle active:", error);
            toast("Failed to handle toggle active")
            refetch()
        }
    }

    return { tokenManager, poolManager, refetch, loading, createTestQuoteMint, handleSystemSetup, handleToggleActive, statCardData };
};