"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import SecondRow from "../components/shared/SecondRow";
import StatsCards from "../components/shared/StatsCards";
import ThirdRow from "../components/shared/ThirdRow";
import { useSold } from "../hooks/useSold";
import Setup from "../components/shared/Setup";
import { Spin } from "antd";
import { Logo } from '../components/Logo';
import MyMultiButton from '../components/layout/MyMultiButton';
import Image from "next/image";

const Index: React.FC = () => {
  const wallet = useWallet();
  const sold = useSold();
  const { loading } = sold;

  // TODO: Wallet Check
  if (!wallet.connected) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center mt-10">
        <Image
          src="/logo.svg"
          width={140}
          height={140}
          alt=""
          className="w-3/4 md:w-2/4 lg:w-1/4"
        />        <h1>Please connect your wallet</h1>
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
      <section className="w-full flex flex-grow h-full flex-col items-center justify-center gap-20">


        <div className="w-full flex flex-col items-center justify-center gap-6">
          {/* first row */}
          <StatsCards />
          {/* second row */}
          <SecondRow />
          {/* third row */}
          <ThirdRow />
          {/* yield update */}
        </div>
      </section>
    </>
  );
};

export default Index;
