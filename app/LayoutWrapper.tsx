import React from "react";

// TODO: Change to other toast provider
import ContextProvider from "../contexts/ContextProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { SoldStateProvider } from "../contexts/SoldStateProvider";

// Providers

/**
 *
 * @param Children --> This will be the rendered component in the current page
 * @returns --> A wrapper of providers such as Session, WalletContext around the Children param
 */
type LayoutWrapperProps = {
  children: React.ReactNode;
};

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <SoldStateProvider>
      <ContextProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ContextProvider>
    </SoldStateProvider>
  );
};

export default LayoutWrapper;
