import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana } from "@reown/appkit/networks";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Wallet } from "lucide-react";

export const WalletModal = () => {
  const projectId = import.meta.env.VITE_PROJECT_ID;
  const solanaAdapter = new SolanaAdapter();
  const metadata = {
    name: "SolForge Launchpad",
    description: "Deploy Token and Liquidity Pool on Solana with SolForge Launchpad",
    url: window.location.origin,
    icons: [],
  };

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana],
    projectId,
    metadata,
    features: {
      analytics: false,
      email: false,
      socials: [],
    },
    themeMode: (localStorage.getItem("theme") as "dark" | "light") || "dark",
  });

  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "Select Wallet";

  return (
    <button
      type="button"
      onClick={() => open()}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      <Wallet className="h-4 w-4" />
      {isConnected ? shortAddress : "Select Wallet"}
    </button>
  );
};
