import { Toaster } from "sonner";
import "../styles/globals.css";
import LayoutWrapper from "./LayoutWrapper";
import NewAppBar from "../components/shared/NewAppBar";
import Sidebar from "../components/shared/Sidebar";

require("@solana/wallet-adapter-react-ui/styles.css");

export const metadata = {
  title: "SOLD Admin Dashboard",
  description: "SOLD Admin Dashboard for managing the SOLD protocol",
};

export default async function RootLayout({ children }: any) {
  return (
    <LayoutWrapper>
      <html lang="en">
        <body className="relative">
          {/* <AppBar /> */}
          {/* <Sidebar /> */}
          <div className="">
            <NewAppBar />
            <main className="py-10 ">
              <div className="px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
          {/* <Footer /> */}
          <Toaster position="bottom-right" theme="dark" />
        </body>
      </html>
    </LayoutWrapper>
  );
}

// lg: pl - 72
