"use client";
import Brand from "/SD_logo.png";
import BrandW from "/SD_logo.png";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Logo = ({ isDark }: any) => {
  return (
    <Link href="/" passHref>
      <Image
        src="/logo.svg"
        width={140}
        height={140}
        alt=""
        className="min-w-[30px] md:w-32 max-w-[108px] cursor-pointer"
      />
    </Link>
  );
};
