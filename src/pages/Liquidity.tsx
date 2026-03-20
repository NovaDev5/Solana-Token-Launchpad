import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Droplets, Info } from "lucide-react";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionModal } from "@/components/common/TransactionModal";
import { DataContext } from "@/Context/AppContext";
import { useAppContext } from "@/providers/AppProvider";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import {
  type Provider,
} from "@reown/appkit-adapter-solana/react";
import { LaunchpadModel } from "@/lib/launchpadmodel";

type Tab = "add" | "remove";

export default function Liquidity() {
  const context = useContext(DataContext);
  const { apiData } = context;
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { txState, setStatus, reset } = useTransaction();
  const [tab, setTab] = useState<Tab>("add");
  const [MintAddress, setMintAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [solAmount, setSolAmount] = useState("");
  const [poolID, setpoolID] = useState("");
  const [lpBalance, setLpBalance] = useState<string | null>(null);
  const [removePercent, setRemovePercent] = useState(50);
  const [fetchingLp, setFetchingLp] = useState(false);

  const handleFetchLp = async () => {
    if (!poolID.trim()) return;
    setFetchingLp(true);
    setLpBalance(null);
    await new Promise((r) => setTimeout(r, 1500));
    setLpBalance("125.50"); // Simulated
    setFetchingLp(false);
  };

  const handleAddLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    try {
      setStatus("pending", "Adding liquidity...");
      const solana_launchpad = new LaunchpadModel(
        address,
        apiData,
        walletProvider,
      );
      const poolInfo = await solana_launchpad.TokenLiquidityCreation(
        MintAddress,
        tokenAmount,
        solAmount,
      );
      setStatus("success", "Liquidity added successfully!", {
        txSignature: poolInfo.poolId,
      });
    } catch (err: any) {
      setStatus("error", "Failed to add liquidity", { error: err.message });
    }
  };

  const handleRemoveLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !lpBalance) return;
    try {
      setStatus("pending", "Removing liquidity...");
      const solana_launchpad = new LaunchpadModel(
        address,
        apiData,
        walletProvider,
      );
      const LpRemovalTx = await solana_launchpad.TokenLiquidityRemoval(
        poolID,
        tokenAmount,
      );
      setStatus("success", "Liquidity removed successfully!", {
        txSignature: "sim_rm_liq_tx",
      });
    } catch (err: any) {
      setStatus("error", "Failed to remove liquidity", { error: err.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-sol-green flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Liquidity
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage Raydium liquidity pools
            </p>
          </div>
        </div>

        <div className="flex bg-secondary rounded-lg p-1 mb-6">
          {(["add", "remove"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-display font-medium rounded-md transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "add" ? "Add Liquidity" : "Remove Liquidity"}
            </button>
          ))}
        </div>

        {tab === "add" && (
          <form
            onSubmit={handleAddLiquidity}
            className="glass-card p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Token Mint Address *
              </label>
              <input
                type="text"
                value={MintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Enter token mint address"
                className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors font-mono"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Token Amount *
                </label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step="any"
                  className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  SOL Amount *
                </label>
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step="any"
                  className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={
                !isConnected || !MintAddress.trim() || !tokenAmount || !solAmount
              }
              className="w-full py-3 sol-gradient-bg text-primary-foreground rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isConnected ? "Connect Wallet First" : "Add Liquidity"}
            </button>
          </form>
        )}

        {tab === "remove" && (
          <form
            onSubmit={handleRemoveLiquidity}
            className="glass-card p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Token Mint Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={poolID}
                  onChange={(e) => setpoolID(e.target.value)}
                  placeholder="Enter token mint address"
                  className="flex-1 px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={handleFetchLp}
                  disabled={!poolID.trim() || fetchingLp}
                  className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {fetchingLp ? "Fetching..." : "Fetch LP"}
                </button>
              </div>
            </div>

            {lpBalance !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Your LP Balance
                  </p>
                  <p className="text-lg font-display font-bold text-foreground">
                    {lpBalance} LP
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Remove Amount</span>
                    <span className="font-display font-semibold text-foreground">
                      {removePercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={removePercent}
                    onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setRemovePercent(p)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${removePercent === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isConnected}
                  className="w-full py-3 sol-gradient-bg text-primary-foreground rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isConnected
                    ? "Connect Wallet First"
                    : `Remove ${removePercent}% Liquidity`}
                </button>
              </motion.div>
            )}
          </form>
        )}
      </motion.div>

      <TransactionModal state={txState} onClose={reset} />
    </div>
  );
}
