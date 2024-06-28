"use client";
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
  calculateExchangeRate,
  initiateUpdateManagerOwner,
  updateManagerOwner,
  SOLD_STAKING_PROGRAM_ID,
  initiateUpdatePoolOwner,
  updatePoolOwner,
  updateXmintMetadata,
  updateMintMetadata,
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
import { useSoldStateContext } from "../contexts/SoldStateProvider";
import {
  findMetadataPda,
  safeFetchMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

// TODO: Move this into npm package
const bigIntToFloat = (bigIntValue: bigint, decimals: number): number => {
  return Number(bigIntValue) / Math.pow(10, decimals);
};

const bigIntWithDecimal = (amount: number, decimal: number) => {
  return BigInt(amount) * BigInt(10 ** decimal);
};

let isFetching = false; //local variable so it wont re-render
export const useSold = () => {
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);

  const {
    tokenManager,
    setTokenManager,
    poolManager,
    setPoolManager,
    owner,
    setOwner,
    admin,
    setAdmin,
    gateKeepers,
    setGateKeepers,
    allowList,
    setAllowList,
    reset,
    setReset,
    statCardData,
    setStatCardData,
    listFetched,
    setListFetched,
  } = useSoldStateContext();

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

      console.log("Token Manager: ", tokenManagerAcc);
      console.log("Pool Manager : ", poolManagerAcc);

      // Calculate exchange rate if poolManager is available
      if (poolManagerAcc) {
        const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
        const lastYieldChangeTimestamp = Number(
          poolManagerAcc.lastYieldChangeTimestamp,
        ); // Convert bigint to number
        const lastYieldChangeExchangeRate = Number(
          poolManagerAcc.lastYieldChangeExchangeRate,
        ); // Convert bigint to number
        const rate = calculateExchangeRate(
          lastYieldChangeTimestamp,
          currentTimestamp,
          Number(poolManagerAcc.annualYieldRate), // Convert bigint to number
          lastYieldChangeExchangeRate,
        );
        setExchangeRate(rate);
      }

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

  useEffect(() => {
    const fetchAllowList = async () => {
      if (!isFetching && allowList.length == 0 && !listFetched) {
        try {
          isFetching = true;
          console.log("fetching allow list..........");
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
          setListFetched(true);
        } catch (error) {
          if (error instanceof Error) {
            console.error("Failed to fetch allowlist:", error.message);
            toast.error("Failed to fetch allowlist");
          } else {
            console.error("An unexpected error occurred:", error);
            toast.error("An unexpected error occurred");
          }
          setListFetched(false);
        } finally {
          isFetching = false;
        }
      }
    };

    fetchAllowList();
  }, [allowList]);

  const refetch = () => {
    setReset((prev) => prev + 1);
  };

  const annualYieldRate = poolManager
    ? (Number(poolManager.annualYieldRate) / 100).toString()
    : "0";

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

  const getConnectedWalletPubKey = () => {
    return umi.identity.publicKey;
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

  const handleInitiateOwner = async (newOwnerPubkey: string) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }
      // Ensure the newOwnerPublicKey is a valid public key
      const newOwnerPubKeyInstance = publicKey(newOwnerPubkey);
      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        initiateUpdateManagerOwner(umi, {
          tokenManager: tokenManagerPubKey,
          owner: umi.identity,
          newOwner: newOwnerPubKeyInstance,
        }),
      );

      const resInitiateOwnerUpdate = await transactionBuilder.sendAndConfirm(
        umi,
        {
          confirm: { commitment: "confirmed" },
        },
      );
      console.log(bs58.encode(resInitiateOwnerUpdate.signature));

      toast.success("Owner Initiated successfully");
      refetch();
    } catch (e) {
      console.error("Failed to handle Initiate owner update:", e);
      // Handle 'e' being of type 'unknown'
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      toast.error("Failed to handle Initiate owner update: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptUpdateOwner = async () => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }

      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        updateManagerOwner(umi, {
          tokenManager: tokenManagerPubKey,
          newOwner: umi.identity,
        }),
      );

      const resOwnerUpdate = await transactionBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });

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

  const handleInitiatePoolOwner = async (newOwnerPubkey: string) => {
    setLoading(true);
    try {
      if (!poolManager) {
        throw new Error("Pool Manager is not set");
      }
      // Ensure the newOwnerPublicKey is a valid public key
      const newOwnerPubKeyInstance = publicKey(newOwnerPubkey);
      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        initiateUpdatePoolOwner(umi, {
          poolManager: poolManagerPubKey,
          owner: umi.identity,
          newOwner: newOwnerPubKeyInstance,
        }),
      );

      const resInitiateOwnerUpdate = await transactionBuilder.sendAndConfirm(
        umi,
        {
          confirm: { commitment: "confirmed" },
        },
      );
      console.log(bs58.encode(resInitiateOwnerUpdate.signature));

      toast.success("Pool Owner Initiated successfully");
      refetch();
    } catch (e) {
      console.error("Failed to handle Initiate owner update:", e);
      // Handle 'e' being of type 'unknown'
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      toast.error("Failed to handle Initiate owner update: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptUpdatePoolOwner = async () => {
    setLoading(true);
    try {
      if (!poolManager) {
        throw new Error("Pool Manager is not set");
      }

      let transactionBuilder = new TransactionBuilder();

      transactionBuilder = transactionBuilder.add(
        updatePoolOwner(umi, {
          poolManager: poolManagerPubKey,
          newOwner: umi.identity,
        }),
      );

      const resOwnerUpdate = await transactionBuilder.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });

      console.log(bs58.encode(resOwnerUpdate.signature));
      toast.success("Pool Owner updated successfully");
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

  const handleWhiteList = async (newWhiteListPublicKeys: string[]) => {
    setLoading(true);
    try {
      if (!tokenManager) {
        throw new Error("Token Manager is not set");
      }
      // Ensure all whitelist are valid public keys
      const newWhiteListPubKeys = newWhiteListPublicKeys.map((key) =>
        publicKey(key),
      );

      let transactionBuilder = new TransactionBuilder();

      const newMerkleRoot = getMerkleRoot(newWhiteListPubKeys);
      transactionBuilder = transactionBuilder.add(
        updateTokenManagerAdmin(umi, {
          tokenManager: tokenManagerPubKey,
          admin: umi.identity,
          newMerkleRoot: newMerkleRoot,
          newGateKeepers: none(),
          newMintLimitPerSlot: none(),
          newRedemptionLimitPerSlot: none(),
        }),
      );

      const resWhiteListUpdate = await transactionBuilder.sendAndConfirm(umi);
      console.log(bs58.encode(resWhiteListUpdate.signature));

      toast.success("Whitelist updated successfully");
      const allowListArray = newWhiteListPubKeys.map((key) => key.toString());
      setAllowList(allowListArray);
      updateAllowList(allowListArray);
      refetch();
    } catch (e) {
      console.error("Failed to handle whitelist update:", e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      toast.error("Failed to handle whitelist update: " + errorMessage);
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
      console.log(data);
      //setAllowList(data.updatedAddresses[0].addresses); // Assuming the response includes the updated list
      toast.success("Allowlist updated successfully");
      //refetch();
    } catch (error) {
      console.error("Failed to update allowlist:", error);
      toast.error("Failed to update allowlist");
      //refetch();
    }
    setLoading(false);
  };

  const handleMetadataUpdate = async (metadataValues: any) => {
    setLoading(true);
    toast.loading("Updating Metadata...");

    try {
      console.log("Starting metadata update...");

      const baseMint = umi.eddsa.findPda(SOLD_ISSUANCE_PROGRAM_ID, [
        Buffer.from("mint"),
      ]);
      const baseMetadata = findMetadataPda(umi, { mint: baseMint[0] });
      const xMint = umi.eddsa.findPda(SOLD_STAKING_PROGRAM_ID, [
        Buffer.from("mint"),
      ])[0];
      const xMetadata = findMetadataPda(umi, { mint: xMint });

      let txBuilder = new TransactionBuilder();

      if (metadataValues.xmint) {
        console.log("Updating xMint metadata...");

        if (!poolManager) {
          throw new Error("Pool Manager is not set");
        }

        txBuilder = txBuilder.add(
          updateXmintMetadata(umi, {
            poolManager: poolManager.publicKey,
            metadataAccount: xMetadata,
            owner: umi.identity,
            name: metadataValues.name,
            symbol: metadataValues.symbol,
            uri: metadataValues.uri,
          }),
        );
      } else {
        console.log("Updating normal mint metadata...");

        if (!tokenManager) {
          throw new Error("Token Manager is not set");
        }

        txBuilder = txBuilder.add(
          updateMintMetadata(umi, {
            tokenManager: tokenManager.publicKey,
            metadataAccount: baseMetadata,
            owner: umi.identity,
            name: metadataValues.name,
            symbol: metadataValues.symbol,
            uri: metadataValues.uri,
          }),
        );
      }

      console.log("Sending transaction...");
      const response = await txBuilder.sendAndConfirm(umi, {
        send: { skipPreflight: true },
      });
      console.log("Transaction response:", response);

      toast.success("Metadata update successful");
      console.log("Updated Metadata:", metadataValues);
    } catch (error) {
      console.error("Failed to update metadata:", error);
      toast.error("Failed to update metadata");
    } finally {
      setLoading(false);
      toast.dismiss();
      refetch();
    }
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
    handleMetadataUpdate,
    getWithdrawTimeLock,
    handleWithdrawTimeUpdate,
    allowList,
    handleAcceptUpdateOwner,
    admin,
    owner,
    gateKeepers,
    handleUpdateGatekeeper,
    handleWhiteList,
    listFetched,
    setListFetched,
    annualYieldRate,
    getConnectedWalletPubKey,
    handleInitiateOwner,
    handleInitiatePoolOwner,
    handleAcceptUpdatePoolOwner,
  };
};
