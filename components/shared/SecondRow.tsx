"use client";

import React, { useState } from "react";
import { DepositWithdraw } from "./DepositWithdraw";
import { PauseUnpause } from "./PauseUnpause";
import { YieldUpdate } from "./YieldUpdate";
import { WithdrawTimeUpdate } from "./WithdrawTimeUpdate";

export default function SecondRow() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4  gap-8 ">
      <DepositWithdraw />
      <PauseUnpause />
      <YieldUpdate />
      <WithdrawTimeUpdate />
    </div>
  );
}
