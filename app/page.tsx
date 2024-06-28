"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import StatsCards from "../components/shared/StatsCards";
import { useSold } from "../hooks/useSold";
import Setup from "../components/shared/Setup";
import { Spin } from "antd";
import MyMultiButton from "../components/layout/MyMultiButton";
import Image from "next/image";
import AdminUpdate from "../components/shared/AdminUpdate";
import { DepositWithdraw } from "../components/shared/DepositWithdraw";
import GateKeeperUpdate from "../components/shared/GateKeeperUpdate";
import MetadataUpdate from "../components/shared/MetadataUpdate";
import OwnerUpdate from "../components/shared/OwnerUpdate";
import { PauseUnpause } from "../components/shared/PauseUnpause";
import PoolOwnerUpdate from "../components/shared/PoolOwnerUpdate";
import WhitelistUpdate from "../components/shared/WhitelistUpdate";
import { WithdrawTimeUpdate } from "../components/shared/WithdrawTimeUpdate";
import { YieldUpdate } from "../components/shared/YieldUpdate";

const Index: React.FC = () => {
  const wallet = useWallet();
  const sold = useSold();

  if (!wallet.connected) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center mt-10">
        <Image
          src="/logo.svg"
          width={140}
          height={140}
          alt=""
          className="w-3/4 md:w-2/4 lg:w-1/4"
        />{" "}
        <h1>Please connect your wallet</h1>
        <MyMultiButton />
      </div>
    );
  }

  if (sold.loading) {
    return (
      <div className="flex items-center justify-center ">
        <Spin size="large" />
      </div>
    );
  }

  if (!sold.poolManager && !sold.tokenManager) {
    return (
      <div className="flex flex-col space-y-4 items-center justify-center w-full container">
        <h1>System needs to be initialized</h1>
        <Setup />
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-6">
        {/* first row */}
        <StatsCards />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <DepositWithdraw />
          <WithdrawTimeUpdate />
          <YieldUpdate />
          <WhitelistUpdate />
          <GateKeeperUpdate />
          <PauseUnpause />
          <AdminUpdate />
          <OwnerUpdate />
          <PoolOwnerUpdate />
          <MetadataUpdate />
        </div>
      </div>
    </>
  );
};

export default Index;
