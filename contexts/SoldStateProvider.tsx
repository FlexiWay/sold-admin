"use client"
import React, { createContext, useContext, useState } from 'react';
import { PublicKey } from "@solana/web3.js";
import { TokenManager, PoolManager } from '@builderz/sold';

interface SoldStateContextType {
  tokenManager: TokenManager | null;
  setTokenManager: React.Dispatch<React.SetStateAction<TokenManager | null>>;
  poolManager: PoolManager | null;
  setPoolManager: React.Dispatch<React.SetStateAction<PoolManager | null>>;
  owner: PublicKey | null;
  setOwner: React.Dispatch<React.SetStateAction<PublicKey | null>>;
  admin: PublicKey | null;
  setAdmin: React.Dispatch<React.SetStateAction<PublicKey | null>>;
  gateKeepers: PublicKey[];
  setGateKeepers: React.Dispatch<React.SetStateAction<PublicKey[]>>;
  allowList: string[];
  setAllowList: React.Dispatch<React.SetStateAction<string[]>>;
  reset: number;
  setReset: React.Dispatch<React.SetStateAction<number>>;
  statCardData: {
    totalSupply: number;
    usdcInPool: number;
    totalStaked: number;
    xSoldSupply: number;
    [key: string]: number;
  };
  setStatCardData: React.Dispatch<React.SetStateAction<{
    totalSupply: number;
    usdcInPool: number;
    totalStaked: number;
    xSoldSupply: number;
    [key: string]: number;
  }>>;

  listFetched: boolean;
  setListFetched: React.Dispatch<React.SetStateAction<boolean>>;
}

const SoldStateContext = createContext<SoldStateContextType | null>(null);

export const SoldStateProvider = ({ children }:any) => {
  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);
  const [poolManager, setPoolManager] = useState<PoolManager | null>(null);
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

  const [listFetched, setListFetched] = useState<boolean>(false);


  return (
    <SoldStateContext.Provider
      value={{
        tokenManager, setTokenManager,
        listFetched,setListFetched,
        poolManager, setPoolManager,
        owner, setOwner,
        admin, setAdmin,
        gateKeepers, setGateKeepers,
        allowList, setAllowList,
        reset, setReset,
        statCardData, setStatCardData,
      }}
    >
      {children}
    </SoldStateContext.Provider>
  );
};

export const useSoldStateContext = () => {
  const context = useContext(SoldStateContext);
  if (context === null) {
    throw new Error('useSoldStateContext must be used within a SoldStateProvider');
  }
  return context;
};