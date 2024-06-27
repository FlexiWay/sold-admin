"use client";

import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export default function MyMultiButton() {
  return (
    <div className=" relative z-[999] bg-black">
      <WalletMultiButtonDynamic className="mymultibutton" />
    </div>
  );
}
