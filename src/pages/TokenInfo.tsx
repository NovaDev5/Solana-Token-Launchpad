import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { TokenInfo } from "@/lib/utils";
import { DataContext } from "@/Context/AppContext";
import { LaunchpadModel } from "@/lib/launchpadmodel";
import { Search, ExternalLink, Globe, Twitter } from "lucide-react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { type Provider } from "@reown/appkit-adapter-solana/react";

export default function TokenInfoPage() {
  const context = useContext(DataContext);
  const { apiData } = context;
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [mintAddress, setMintAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<TokenInfo | null>(null);
  const [error, setError] = useState("");

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAddress.trim()) return;
    setLoading(true);
    try {
      const solana_launchpad = new LaunchpadModel(
        address,
        apiData,
        walletProvider,
      );
      const tokenInfo = await solana_launchpad.FetchTokenInfo(
        mintAddress.trim(),
      );
      setTokenData(tokenInfo);
    } catch {
      setError(
        "Failed to fetch token information. Please verify the mint address.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sol-green to-primary flex items-center justify-center">
            <Search className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Token Info
            </h1>
            <p className="text-sm text-muted-foreground">
              Look up any Solana token
            </p>
          </div>
        </div>

        <form onSubmit={handleFetch} className="glass-card p-6 mb-6">
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Token Mint Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="Enter token mint address"
              className="flex-1 px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={!mintAddress.trim() || loading}
              className="px-5 py-2.5 sol-gradient-bg text-primary-foreground rounded-lg font-display font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="glass-card p-6 space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-secondary rounded w-24" />
                <div className="h-4 bg-secondary rounded w-32" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {tokenData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
              <div className="w-14 h-14 rounded-xl sol-gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">
                  {tokenData.tokensymbol}
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {tokenData.tokenname}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {tokenData.tokensymbol}
                </p>
              </div>
              <a
                href={`https://solscan.io/token/${tokenData.tokenaddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ["Price USD", tokenData.tokenpriceusd],
                ["Token Liquidity USD", tokenData.tokenliquidityusd],
                ["Total Supply", tokenData.totalsupply],
                ["Token Burns", tokenData.tokenburns],
                ["Holders", tokenData.tokenholders],
                ["Total Trades", tokenData.totaltrades],
                ["Token Market ", tokenData.tokenmarket || "None"],
                ["Token Dev Holdings", tokenData.tokendevholdings],
                [
                  "Token Dev Holdings Percentage",
                  tokenData.tokendevholdingspercentage,
                ],
                ["Total Token Snipers", tokenData.tokentotalsnipers],
                ["Total Token Insiders", tokenData.tokentotalinsiders],
                ["Total Token Trading Fees SOL", tokenData.totaltokenfees],
                ["Total Token Trading Tips SOL", tokenData.totaltradingtips],
                ["Token Top 10 Hold", tokenData.tokentoptenholderscount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Mint Address</span>
                <code className="text-xs text-foreground bg-secondary px-2 py-1 rounded max-w-[200px] truncate">
                  {tokenData.tokenaddress}
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
