
import React from "react";
import { DepositWithdraw } from "./DepositWithdraw";
import { YieldUpdate } from "./YieldUpdate";
import { WithdrawTimeUpdate } from "./WithdrawTimeUpdate";

export default function SecondRow() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3  gap-8 ">
      <DepositWithdraw />
      <WithdrawTimeUpdate />
      <YieldUpdate />
    </div>
  );
}
