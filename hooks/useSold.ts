import {
  safeFetchPoolManager,
  safeFetchTokenManager,
  findPoolManagerPda,
  findTokenManagerPda,
  PoolManager,
  TokenManager,
  createTestQuote,
  updateTokenManagerOwner,
  SetupOptions,
  toggleActive,
  setup,
  depositFunds,
  updateTokenManagerAdmin,
  updateAnnualYield,
  SOLD_ISSUANCE_PROGRAM_ID,
  getMerkleRoot,
  initializeWithdrawFunds,
  withdrawFunds,
} from "@builderz/sold";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SetStateAction, useEffect, useState } from "react";
import {
  createSplAssociatedTokenProgram,
  createSplTokenProgram,
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@metaplex-foundation/mpl-toolbox";
import { toast } from "sonner";
import { TransactionBuilder, Umi, some, none } from "@metaplex-foundation/umi";
import { findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
// @ts-ignore
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import {
  PublicKey as UmiPublicKey,
  publicKey,
} from "@metaplex-foundation/umi-public-keys";

// TODO: Move this into npm package
const bigIntToFloat = (bigIntValue: bigint, decimals: number): number => {
  return Number(bigIntValue) / Math.pow(10, decimals);
};

const bigIntWithDecimal = (amount: number, decimal: number) => {
  return BigInt(amount) * BigInt(10 ** decimal);
  // return BigInt(Math.floor(amount * (10 ** decimal))) * BigInt(10 ** decimal);
};

export const useSold = () => {
  const [loading, setLoading] = useState(false);

  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);
  const [poolManager, setPoolManager] = useState<PoolManager | null>(null);
  // console.log(Number(poolManager?.annualYieldRate));
  const [owner, setOwner] = useState<PublicKey | null>(null);
  const [admin, setAdmin] = useState<PublicKey | null>(null);
  const [gateKeepers, setGateKeepers] = useState<PublicKey[]>([]);

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
    xSoldSupply: 0,
  });

  const wallet = useWallet();
  const { connection } = useConnection();

  const umi = createUmi(connection);
  umi.programs.add(createSplAssociatedTokenProgram());
  umi.programs.add(createSplTokenProgram());

  umi.use(walletAdapterIdentity(wallet));

  const tokenManagerPubKey = findTokenManagerPda(umi);
  const poolManagerPubKey = findPoolManagerPda(umi);

  useEffect(() => {
    const fetchState = async () => {
      setLoading(true);

      const tokenManagerAcc = await safeFetchTokenManager(
        umi,
        tokenManagerPubKey,
      );
      const poolManagerAcc = await safeFetchPoolManager(umi, poolManagerPubKey);

      setTokenManager(tokenManagerAcc);
      setPoolManager(poolManagerAcc);

      // Stat stat cards
      tokenManagerAcc &&
        poolManagerAcc &&
        setStatCardData({
          totalSupply: bigIntToFloat(
            tokenManagerAcc.totalSupply,
            tokenManagerAcc.mintDecimals,
          ),
          usdcInPool: bigIntToFloat(
            tokenManagerAcc.totalCollateral,
            tokenManagerAcc.quoteMintDecimals,
          ),
          totalStaked: bigIntToFloat(
            poolManagerAcc.baseBalance,
            poolManagerAcc.baseMintDecimals,
          ),
          xSoldSupply: bigIntToFloat(
            poolManagerAcc.xSupply,
            poolManagerAcc.xMintDecimals,
          ),
        });

      setLoading(false);
    };

    if (wallet.publicKey) {
      fetchState();
    }
  }, [wallet.publicKey, reset]);

  useEffect(() => {
    const fetchAllowList = async () => {
      if (allowList.length === 0) {
        try {
          const response = await fetch("/api/get-allowlist");
          if (!response.ok) {
            console.error(
              `Error fetching allowlist: ${response.status} ${response.statusText}`,
            );
            throw new Error("Failed to fetch allowlist");
          }
          const data = await response.json();
          toast.success("Allowlist fetched successfully");
          setAllowList(data.addresses);
        } catch (error) {
          if (error instanceof Error) {
            console.error("Failed to fetch allowlist:", error.message);
            toast.error("Failed to fetch allowlist");
          } else {
            console.error("An unexpected error occurred:", error);
            toast.error("An unexpected error occurred");
          }
        }
      }
    };

    fetchAllowList();
  }, [allowList]);

  useEffect(() => {
    const fetchState = async () => {
      setLoading(true);

      const tokenManagerAcc = await safeFetchTokenManager(
        umi,
        tokenManagerPubKey,
      );
      setTokenManager(tokenManagerAcc);

      if (tokenManagerAcc) {
        setOwner(new PublicKey(tokenManagerAcc.owner));
        setAdmin(new PublicKey(tokenManagerAcc.admin));
        setGateKeepers(
          tokenManagerAcc.gateKeepers.map((key) => new PublicKey(key)),
        );
      }

      setLoading(false);
    };

    if (wallet.publicKey) {
      fetchState();
    }
  }, [wallet.publicKey]);

  const refetch = () => {
    setReset((prev) => prev + 1);
  };

  const getPendingWithdrawAmount = () => {
    return tokenManager?.pendingWithdrawalAmount;
  };

  const getWithdrawIntiationTime = () => {
    return tokenManager?.withdrawalInitiationTime;
  };

  const getWithdrawExecutionWindow = () => {
    return tokenManager?.withdrawExecutionWindow;
  };

  const getWithdrawTimeLock = () => {
    return tokenManager?.withdrawTimeLock;
  };

  const getCurrentYieldPercentage = () => {
    if (poolManager) {
      return poolManager.annualYieldRate / BigInt(100);
    } else {
      return 0;
    }
  };

  const createTestQuoteMint = async (setupOptions: SetupOptions) => {
    setLoading(true);
    try {
      const { mint, txBuilder } = await createTestQuote(
        umi,
        setupOptions.baseMintDecimals,
      );
      const resCreateQuote = await txBuilder.sendAndConfirm(umi);
      setLoading(false);

      toast.success("Test quote mint created successfully");
      return { mint, resCreateQuote };
    } catch (error) {
      console.error("Failed to create test quote mint:", error);
      setLoading(false);

      toast.error("Failed to create test quote mint");
      throw error;
    }
  };

  const handleSystemSetup = async (setupOptions: SetupOptions) => {
    setLoading(true);
    try {
      const txBuilderSetup = await setup(umi, setupOptions);
      const resSetup = await txBuilderSetup.sendAndConfirm(umi, {
        confirm: { commitment: "finalized" },
      });
      console.log(resSetup);

      toast.success("System setup successful");
      refetch();
    } catch (error) {
      console.error("Failed to handle system setup:", error);
      toast.error("Failed to handle system setup");
      refetch();
    }
    setLoading(false);
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      let txBuilder = new TransactionBuilder();

      txBuilder = txBuilder.add(
        toggleActive(umi, {
          tokenManager: tokenManagerPubKey,
          active: !tokenManager?.active,
        }),
      );

      console.log(txBuilder);

      const resToggleActive = await txBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      console.log(bs58.encode(resToggleActive.signature));

      toast.success(`${tokenManager?.active ? "Paused" : "Unpaused"}`);
      refetch();
    } catch (error) {
      console.error("Failed to handle toggle active:", error);
      toast.error("Failed to handle toggle active");
      refetch();
    }
    setLoading(false);
  };

  const handleDeposit = async (depositAmount: number) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      const amountToDeposit = bigIntWithDecimal(
        depositAmount,
        tokenManager.quoteMintDecimals,
      );
      const quantityAllowed =
        Number(
          ((tokenManager.totalSupply /
            BigInt(10 ** tokenManager.mintDecimals)) *
            BigInt(tokenManager.exchangeRate)) /
            BigInt(10 ** tokenManager.quoteMintDecimals) -
            tokenManager.totalCollateral /
              BigInt(10 ** tokenManager.quoteMintDecimals),
        ) *
        10 ** tokenManager.quoteMintDecimals;

      if (quantityAllowed <= 0 || amountToDeposit > quantityAllowed) {
        toast("You cannot deposit more!!");
        return;
      }

      console.log("Quantity to Deposit allowed: ", quantityAllowed);
      console.log(
        "TotalSupply: ",
        Number(
          tokenManager.totalSupply / BigInt(10 ** tokenManager.mintDecimals),
        ),
      );
      console.log(
        "TotalCollateral: ",
        Number(
          tokenManager.totalCollateral /
            BigInt(10 ** tokenManager.quoteMintDecimals),
        ),
      );
      console.log("Amount entered to deposit:", amountToDeposit);

      let txBuilder = new TransactionBuilder();
      let authorityQuoteMintAta = findAssociatedTokenPda(umi, {
        owner: umi.identity.publicKey,
        mint: tokenManager.quoteMint,
      });
      let vault = findAssociatedTokenPda(umi, {
        owner: tokenManagerPubKey[0],
        mint: tokenManager.quoteMint,
      });

      txBuilder = txBuilder.add(
        depositFunds(umi, {
          tokenManager: tokenManagerPubKey,
          quoteMint: tokenManager.quoteMint,
          authorityQuoteMintAta: authorityQuoteMintAta,
          vault: vault,
          admin: umi.identity,
          associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
          quantity: amountToDeposit,
        }),
      );

      const resDeposit = await txBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      console.log("Transaction signature:", bs58.encode(resDeposit.signature));
      console.log("Refetching state after successful deposit");

      toast.success("Deposit successful");
      refetch();
    } catch (error: any) {
      console.error("Failed to handle deposit:", error);

      // Specific error handling based on the error type
      if (error.message.includes("custom program error: 0x1775")) {
        console.error("Custom program error 0x1775 occurred.");
        toast.error(
          "Custom program error 0x1775 occurred during deposit which means excessive deposit",
        );
      } else {
        toast.error("Failed to handle deposit");
      }
      refetch();
    }
    setLoading(false);
  };

  const handleInitiateWithdraw = async (withdrawAmount: number) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      console.log("pending withdraw amount: " + getPendingWithdrawAmount());

      let txBuilder = new TransactionBuilder();
      let withdrawQuantityAllowed =
        Number(tokenManager.totalCollateral) *
        (1 - tokenManager.emergencyFundBasisPoints / 10000);
      console.log(
        "Amount that allowed to be withdrawed: " + withdrawQuantityAllowed,
      );
      console.log("Amount entered to withdraw: " + withdrawAmount);

      if (withdrawQuantityAllowed <= 0) {
        toast("You cannot withdraw more!!");
        return;
      }

      let convertAmount = bigIntWithDecimal(
        withdrawAmount,
        tokenManager.quoteMintDecimals,
      );
      console.log("Converted entered amount to withdraw: " + convertAmount);

      txBuilder = txBuilder.add(
        initializeWithdrawFunds(umi, {
          tokenManager: tokenManagerPubKey,
          quantity: convertAmount,
          admin: umi.identity,
        }),
      );

      console.log(txBuilder);

      //return;

      const resInitializeUpdate = await txBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      console.log(bs58.encode(resInitializeUpdate.signature));

      toast.success("Initialization successful");
      refetch();
    } catch (e) {
      console.error("Failed to handle Initialization withdraw:", e);
      toast.error("Failed to handle Initialization withdraw");
      refetch();
    }
    setLoading(false);
  };

  const handleWithdraw = async (withdrawAmount: number) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      console.log("pending withdraw amount: " + getPendingWithdrawAmount());

      let txBuilder = new TransactionBuilder();

      let authorityQuoteMintAta = findAssociatedTokenPda(umi, {
        owner: umi.identity.publicKey,
        mint: tokenManager.quoteMint,
      });
      let vault = findAssociatedTokenPda(umi, {
        owner: tokenManagerPubKey[0],
        mint: tokenManager.quoteMint,
      });

      txBuilder = txBuilder.add(
        withdrawFunds(umi, {
          tokenManager: tokenManagerPubKey,
          quoteMint: tokenManager!.quoteMint,
          vault: vault,
          authorityQuoteMintAta: authorityQuoteMintAta,
          associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
          admin: umi.identity,
        }),
      );

      console.log(txBuilder);

      const resWithdrawUpdate = await txBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      console.log(bs58.encode(resWithdrawUpdate.signature));

      toast.success("Withdraw successful");
      refetch();
    } catch (e) {
      console.error("Failed to handle withdraw:", e);
      toast.error("Failed to handle withdraw");
      refetch();
    }
    setLoading(false);
  };

  const handleYieldUpdate = async (yieldPercentage: any) => {
    console.log("Yield percentage: ", yieldPercentage);
    setLoading(true);
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

      let vaultPubKey = findAssociatedTokenPda(umi, {
        owner: poolManagerPubKey[0],
        mint: poolManager.baseMint,
      });

      txBuilder = txBuilder.add(
        updateAnnualYield(umi, {
          poolManager: poolManagerPubKey[0],
          admin: umi.identity,
          annualYieldRate: yieldBasisPoints,
          tokenManager: tokenManagerPubKey,
          soldIssuanceProgram: SOLD_ISSUANCE_PROGRAM_ID,
          associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
          baseMint: poolManager.baseMint,
          vault: vaultPubKey,
        }),
      );

      console.log(txBuilder);

      const resYieldUpdate = await txBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
        send: { skipPreflight: false },
      });
      console.log("Yield update confirmed:", resYieldUpdate.signature);

      toast.success("Yield update successful");
      refetch();
    } catch (e) {
      console.error("Failed to handle yield update:", e);
      toast.error("Failed to handle yield update");
      refetch();
    }
    setLoading(false);
  };

  const handleUpdateAdmin = async (newAdminPublicKey: string) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      // Ensure the newAdminPublicKey is a valid public key
      const newAdminPubKeyInstance = publicKey(newAdminPublicKey);

      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        updateTokenManagerOwner(umi, {
          tokenManager: tokenManagerPubKey,
          owner: umi.identity,

          newOwner: none(),
          newAdmin: some(newAdminPubKeyInstance),
          newMinter: none(),
          emergencyFundBasisPoints: none(),
          newWithdrawTimeLock: none(),
          newWithdrawExecutionWindow: none(),
        }),
      );

      const resAdminUpdate = await transactionBuilder.sendAndConfirm(umi);
      console.log(bs58.encode(resAdminUpdate.signature));

      toast.success("Admin updated successfully");
      refetch();
    } catch (e) {
      console.error("Failed to handle admin update:", e);
      // Handle 'e' being of type 'unknown'
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      toast.error("Failed to handle admin update: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOwner = async (newOwnerPublicKey: string) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      // Ensure the newOwnerPublicKey is a valid public key
      const newOwnerPubKeyInstance = publicKey(newOwnerPublicKey);

      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        updateTokenManagerOwner(umi, {
          tokenManager: tokenManagerPubKey,
          owner: umi.identity,
          newOwner: some(newOwnerPubKeyInstance),
          newAdmin: none(),
          newMinter: none(),
          emergencyFundBasisPoints: none(),
          newWithdrawTimeLock: none(),
          newWithdrawExecutionWindow: none(),
        }),
      );

      const resOwnerUpdate = await transactionBuilder.sendAndConfirm(umi);
      console.log(bs58.encode(resOwnerUpdate.signature));

      toast.success("Owner updated successfully");
      refetch();
    } catch (e) {
      console.error("Failed to handle owner update:", e);
      // Handle 'e' being of type 'unknown'
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      toast.error("Failed to handle owner update: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGatekeeper = async (newGatekeeperPublicKeys: string[]) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      // Ensure all newGatekeeperPublicKeys are valid public keys
      const newGatekeeperPubKeys = newGatekeeperPublicKeys.map((key) =>
        publicKey(key),
      );

      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        updateTokenManagerAdmin(umi, {
          tokenManager: tokenManagerPubKey,
          admin: umi.identity,
          newMerkleRoot: none(),
          newGateKeepers: some(newGatekeeperPubKeys),
          newMintLimitPerSlot: none(),
          newRedemptionLimitPerSlot: none(),
        }),
      );

      const resGatekeeperUpdate = await transactionBuilder.sendAndConfirm(umi);
      console.log(bs58.encode(resGatekeeperUpdate.signature));

      toast.success("Gatekeepers updated successfully");
      setGateKeepers(newGatekeeperPubKeys.map((key) => new PublicKey(key)));
      refetch();
    } catch (e) {
      console.error("Failed to handle gatekeepers update:", e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      toast.error("Failed to handle gatekeepers update: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawTimeUpdate = async (
    LockTimeSecs: number | null,
    excutionTimeSecs: number | null,
  ) => {
    setLoading(true);
    try {
      let txBuilder = new TransactionBuilder();

      txBuilder = txBuilder.add(
        updateTokenManagerOwner(umi, {
          tokenManager: tokenManagerPubKey,
          owner: umi.identity,
          newWithdrawTimeLock: LockTimeSecs,
          newOwner: null,
          newAdmin: null,
          newMinter: null,
          emergencyFundBasisPoints: null,
          newWithdrawExecutionWindow: excutionTimeSecs,
        }),
      );

      console.log(txBuilder);

      const resTime = await txBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      console.log(bs58.encode(resTime.signature));

      toast.success("Time updated successful");
      refetch();
    } catch (error) {
      console.error("Failed to handle time update:", error);
      toast.error("Failed to handle time update");
      refetch();
    }
    setLoading(false);
  };

  // Function to update allowList
  // @XtronSolutions you can call this function directly in the function that invoked the whitelist update on-chain
  const updateAllowList = async (newAddresses: string[]) => {
    setLoading(true);
    try {
      const response = await fetch("/api/update-allowlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses: newAddresses }),
      });

      if (!response.ok) {
        throw new Error("Failed to update allowlist");
      }

      const data = await response.json();
      setAllowList(data.updatedAddresses); // Assuming the response includes the updated list
      toast.success("Allowlist updated successfully");
      refetch();
    } catch (error) {
      console.error("Failed to update allowlist:", error);
      toast.error("Failed to update allowlist");
      refetch();
    }
    setLoading(false);
  };

  return {
    tokenManager,
    poolManager,
    refetch,
    loading,
    createTestQuoteMint,
    handleSystemSetup,
    handleToggleActive,
    updateAllowList,
    statCardData,
    handleDeposit,
    handleYieldUpdate,
    getCurrentYieldPercentage,
    handleUpdateAdmin,
    getPendingWithdrawAmount,
    handleInitiateWithdraw,
    handleWithdraw,
    getWithdrawIntiationTime,
    getWithdrawExecutionWindow,
    getWithdrawTimeLock,
    handleWithdrawTimeUpdate,
    allowList,
    handleUpdateOwner,
    admin,
    owner,
    gateKeepers,
    handleUpdateGatekeeper,
  };
};
