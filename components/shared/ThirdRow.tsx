import React from "react";
import WhitelistUpdate from "./WhitelistUpdate";
import GateKeeperUpdate from "./GateKeeperUpdate";
import AdminUpdate from "./AdminUpdate";
import OwnerUpdate from "./OwnerUpdate";
import MetadataUpdate from './MetadataUpdate';
import { PauseUnpause } from './PauseUnpause';

export default function ThirdRow() {
  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3  gap-8">
        <WhitelistUpdate />
        <GateKeeperUpdate />
        <PauseUnpause />
        <AdminUpdate />
        <OwnerUpdate />
        <MetadataUpdate />
      </div>
    </>
  );
}
