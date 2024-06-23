import { safeFetchPoolManager, safeFetchTokenManager, findPoolManagerPda, findTokenManagerPda, PoolManager, TokenManager, createTestQuote, SetupOptions, toggleActive, setup, depositFunds, updateTokenManagerAdmin, updateAnnualYield, SOLD_ISSUANCE_PROGRAM_ID, getMerkleRoot, initializeWithdrawFunds, withdrawFunds, updateTokenManagerOwner } from "@builderz/sold";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { createSplAssociatedTokenProgram, createSplTokenProgram, SPL_ASSOCIATED_TOKEN_PROGRAM_ID } from "@metaplex-foundation/mpl-toolbox"
import { toast } from "sonner";
import { TransactionBuilder, Umi } from "@metaplex-foundation/umi"
import { findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox"
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
    console.log(Number(poolManager?.annualYieldRate));

    const [allowList, setAllowList] = useState<string[]>([]);

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
            tokenManagerAcc && poolManagerAcc && (
                setStatCardData({
                    totalSupply: bigIntToFloat(tokenManagerAcc.totalSupply, tokenManagerAcc.mintDecimals),
                    usdcInPool: bigIntToFloat(tokenManagerAcc.totalCollateral, tokenManagerAcc.quoteMintDecimals),
                    totalStaked: bigIntToFloat(poolManagerAcc.baseBalance, poolManagerAcc.baseMintDecimals),
                    xSoldSupply: bigIntToFloat(poolManagerAcc.xSupply, poolManagerAcc.xMintDecimals)
                })
            )

            setLoading(false);
        }

        if (wallet.publicKey) {
            fetchState()
        }
    }, [wallet.publicKey, reset])

    useEffect(() => {
        const fetchAllowList = async () => {
            try {
                const response = await fetch('/api/get-allowlist'); // Adjust the endpoint as needed
                if (!response.ok) {
                    throw new Error('Failed to fetch allowlist');
                }
                const data = await response.json();
                setAllowList(data.addresses);
            } catch (error) {
                console.error("Failed to fetch allowlist:", error);
                toast("Failed to fetch allowlist");
            }
        };

        fetchAllowList();
    }, [reset]);

    const refetch = () => {
        setReset(prev => prev + 1);
    }

    const getPendingWithdrawAmount = () => {
        return tokenManager?.pendingWithdrawalAmount;
    }

    const getWithdrawIntiationTime = () => {
        return tokenManager?.withdrawalInitiationTime;
    }

    const getWithdrawExecutionWindow = () => {
        return tokenManager?.withdrawExecutionWindow;
    }

    const getWithdrawTimeLock = () => {
        return tokenManager?.withdrawTimeLock;
    }

    const getCurrentYieldPercentage = () => {
        if (poolManager) {
            return poolManager.annualYieldRate / BigInt(100);
        } else {
            return 0;
        }

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
            refetch();
        } catch (error) {
            console.error("Failed to handle toggle active:", error);
            toast("Failed to handle toggle active")
            refetch();
        }
    }

    const bigIntWithDecimal = (amount: number, decimal: number) => {
        return (BigInt(amount) * BigInt(10 ** decimal));
        // return BigInt(Math.floor(amount * (10 ** decimal))) * BigInt(10 ** decimal);
    }

    const handleDeposit = async (depositAmount: number) => {
        try {
            if (!tokenManager) {
                throw new Error("Token Manager is not set");
            }

            const amountToDeposit = bigIntWithDecimal(depositAmount, tokenManager.quoteMintDecimals);
            const quantityAllowed = Number(((tokenManager.totalSupply / BigInt(10 ** tokenManager.mintDecimals)) * BigInt(tokenManager.exchangeRate) / BigInt(10 ** tokenManager.quoteMintDecimals)) - (tokenManager.totalCollateral / BigInt(10 ** tokenManager.quoteMintDecimals))) * 10 ** tokenManager.quoteMintDecimals;

            if (quantityAllowed <= 0 || amountToDeposit > quantityAllowed) {
                toast("You cannot deposit more!!");
                return;
            }

            console.log("Quantity to Deposit allowed: ", quantityAllowed);
            console.log("TotalSupply: ", Number(tokenManager.totalSupply / BigInt(10 ** tokenManager.mintDecimals)));
            console.log("TotalCollateral: ", Number(tokenManager.totalCollateral / BigInt(10 ** tokenManager.quoteMintDecimals)));
            console.log("Amount entered to deposit:", amountToDeposit);

            let txBuilder = new TransactionBuilder();
            let authorityQuoteMintAta = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: tokenManager.quoteMint });
            let vault = findAssociatedTokenPda(umi, { owner: tokenManagerPubKey[0], mint: tokenManager.quoteMint });

            txBuilder = txBuilder.add(depositFunds(umi, {
                tokenManager: tokenManagerPubKey,
                quoteMint: tokenManager.quoteMint,
                authorityQuoteMintAta: authorityQuoteMintAta,
                vault: vault,
                admin: umi.identity,
                associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
                quantity: amountToDeposit
            }));

            const resDeposit = await txBuilder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
            console.log("Transaction signature:", bs58.encode(resDeposit.signature));
            console.log("Refetching state after successful deposit");
            refetch();
        } catch (error: any) {
            console.error("Failed to handle deposit:", error);

            // Specific error handling based on the error type
            if (error.message.includes("custom program error: 0x1775")) {
                console.error("Custom program error 0x1775 occurred.");
                toast("Custom program error 0x1775 occurred during deposit which means excessive deposit");
            } else {
                toast("Failed to handle deposit");
            }
            refetch();
        }
    };

    const handleInitiateWithdraw = async (withdrawAmount: number) => {
        try {
            if (!tokenManager) {
                throw new Error("Token Manager is not set");
            }

            console.log("pending withdraw amount: " + getPendingWithdrawAmount());

            let txBuilder = new TransactionBuilder();
            let withdrawQuantityAllowed = (Number(tokenManager.totalCollateral) * (1 - tokenManager.emergencyFundBasisPoints / 10000));
            console.log("Amount that allowed to be withdrawed: " + withdrawQuantityAllowed);
            console.log("Amount entered to withdraw: " + withdrawAmount);

            if (withdrawQuantityAllowed <= 0) {
                toast("You cannot withdraw more!!");
                return;
            }

            let convertAmount = bigIntWithDecimal(withdrawAmount, tokenManager.quoteMintDecimals);
            console.log("Converted entered amount to withdraw: " + convertAmount);


            txBuilder = txBuilder.add(initializeWithdrawFunds(umi, {
                tokenManager: tokenManagerPubKey,
                quantity: convertAmount,
                admin: umi.identity
            }));

            console.log(txBuilder);

            //return;

            const resInitializeUpdate = await txBuilder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
            console.log(bs58.encode(resInitializeUpdate.signature));

            toast('Initialization successful');
            refetch();
        } catch (e) {
            console.error("Failed to handle Initialization withdraw:", e);
            toast("Failed to handle Initialization withdraw");
            refetch();
        }
    }

    const handleWithdraw = async (withdrawAmount: number) => {
        try {
            if (!tokenManager) {
                throw new Error("Token Manager is not set");
            }

            console.log("pending withdraw amount: " + getPendingWithdrawAmount());

            let txBuilder = new TransactionBuilder();

            let authorityQuoteMintAta = findAssociatedTokenPda(umi, { owner: umi.identity.publicKey, mint: tokenManager.quoteMint });
            let vault = findAssociatedTokenPda(umi, { owner: tokenManagerPubKey[0], mint: tokenManager.quoteMint });

            txBuilder = txBuilder.add(withdrawFunds(umi, {
                tokenManager: tokenManagerPubKey,
                quoteMint: tokenManager!.quoteMint,
                vault: vault,
                authorityQuoteMintAta: authorityQuoteMintAta,
                associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
                admin: umi.identity
            }));

            console.log(txBuilder);

            const resWithdrawUpdate = await txBuilder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
            console.log(bs58.encode(resWithdrawUpdate.signature));

            toast('Withdraw successful');
            refetch();
        } catch (e) {
            console.error("Failed to handle withdraw:", e);
            toast("Failed to handle withdraw");
            refetch();
        }
    }

    const handleYieldUpdate = async (yieldPercentage: any) => {
        console.log("Yield percentage: ", yieldPercentage);
        try {
            if (!tokenManager || !poolManager) {
                throw new Error("Token Manager or Pool Manager is not set");
            }

            let txBuilder = new TransactionBuilder();

            const yieldBasisPoints = yieldPercentage * 100;

            // const totalSupply = BigInt(tokenManager!.totalSupply);
            // const annualYieldRate = (totalSupply * BigInt(yieldPercentage)) / BigInt(100);
            // console.log("Yield amount in BIGINT: " + annualYieldRate);
            // console.log("Yield amount in float: " + bigIntToFloat(annualYieldRate, tokenManager.mintDecimals));

            let vaultPubKey = findAssociatedTokenPda(umi, { owner: poolManagerPubKey[0], mint: poolManager.baseMint });

            txBuilder = txBuilder.add(updateAnnualYield(umi, {
                poolManager: poolManagerPubKey[0],
                admin: umi.identity,
                annualYieldRate: yieldBasisPoints,
                tokenManager: tokenManagerPubKey,
                soldIssuanceProgram: SOLD_ISSUANCE_PROGRAM_ID,
                associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
                baseMint: poolManager.baseMint,
                vault: vaultPubKey
            }));

            console.log(txBuilder);

            const resYieldUpdate = await txBuilder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" }, send: { skipPreflight: true } });
            console.log('Yield update confirmed:', resYieldUpdate.signature);

            toast('Yield update successful');
            refetch();
        } catch (e) {
            console.error("Failed to handle yield update:", e);
            toast("Failed to handle yield update");
            refetch();
        }
    };

    const handleUpdateAuthority = async (newAllowedWallets: any) => {
        try {
            if (!tokenManager) {
                throw new Error("Token Manager is not set");
            }

            // const newAllowedWallets = ["4GG9RNpVhhH5Q6oqQtMs9wqmeuQBTeVQbXfWyJRJJHv6"];
            //const originalMerkleRoot=tokenManager.merkleRoot;
            console.log(newAllowedWallets);
            const newMerkleRoot = getMerkleRoot(newAllowedWallets);

            let txBuilder = new TransactionBuilder();

            txBuilder = txBuilder.add(updateTokenManagerAdmin(umi, {
                tokenManager: tokenManagerPubKey,
                admin: umi.identity,
                newMerkleRoot: newMerkleRoot,
                newGateKeepers: null,
                newMintLimitPerSlot: null,
                newRedemptionLimitPerSlot: null
            }));

            console.log(txBuilder);

            const resAdminUpdate = await txBuilder.sendAndConfirm(umi);
            console.log(bs58.encode(resAdminUpdate.signature));

            //console.log('admin update confirmed:', resAdminUpdate.signature);

            toast('Admin updated successful');
            refetch();
        } catch (e) {
            console.error("Failed to handle admin update:", e);
            toast("Failed to handle admin update");
            refetch();
        }
    }

    const handleWithdrawTimeUpdate = async (LockTimeSecs: number | null, excutionTimeSecs: number | null) => {
        try {
            let txBuilder = new TransactionBuilder()

            txBuilder = txBuilder.add(updateTokenManagerOwner(umi, {
                tokenManager: tokenManagerPubKey,
                owner: umi.identity,
                newWithdrawTimeLock: LockTimeSecs,
                newOwner: null,
                newAdmin: null,
                newMinter: null,
                emergencyFundBasisPoints: null,
                newWithdrawExecutionWindow: excutionTimeSecs
            }));

            console.log(txBuilder);

            const resTime = await txBuilder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
            console.log(bs58.encode(resTime.signature));

            refetch();
        } catch (error) {
            console.error("Failed to handle time update:", error);
            toast("Failed to handle time update")
            refetch();
        }
    }

    // Function to update allowList
    // @XtronSolutions you can call this function directly in the function that invoked the whitelist update on-chain
    const updateAllowList = async (newAddresses: string[]) => {
        try {
            const response = await fetch('/api/update-allowlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ addresses: newAddresses })
            });

            if (!response.ok) {
                throw new Error('Failed to update allowlist');
            }

            const data = await response.json();
            setAllowList(data.updatedAddresses); // Assuming the response includes the updated list
            toast("Allowlist updated successfully");
        } catch (error) {
            console.error("Failed to update allowlist:", error);
            toast("Failed to update allowlist");
        }
    };

    return { tokenManager, poolManager, refetch, loading, createTestQuoteMint, handleSystemSetup, handleToggleActive, statCardData, handleDeposit, handleYieldUpdate, getCurrentYieldPercentage, handleUpdateAuthority, getPendingWithdrawAmount, handleInitiateWithdraw, handleWithdraw, getWithdrawIntiationTime, getWithdrawExecutionWindow, getWithdrawTimeLock, handleWithdrawTimeUpdate, allowList };
};
