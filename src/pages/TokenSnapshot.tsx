import { useState, useCallback, useContext } from "react";
import { motion } from "framer-motion";
import { Camera, Download } from "lucide-react";
import { DataContext } from "@/Context/AppContext";
import { TokenSnapshot, Tokenholders } from "@/lib/utils";
import { LaunchpadModel } from "@/lib/launchpadmodel";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { type Provider } from "@reown/appkit-adapter-solana/react";

export default function TokenSnapshotPge() {
  const context = useContext(DataContext);
  const { apiData } = context;
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [mintAddress, setMintAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [holders, setHolders] = useState<Tokenholders[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAddress.trim()) return;
    setLoading(true);
    setError("");
    setHolders([]);
    setPage(0);

    try {
      const solanalaunchpad = new LaunchpadModel(address, apiData, walletProvider);
      const tokenholders = await solanalaunchpad.TokenSnaphots(mintAddress);
      setHolders(tokenholders.holders);
    } catch {
      setError("Failed to fetch token holders.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = useCallback(() => {
    if (!holders.length) return;
    const csv =
      "Holder Address,Token Balance\n" +
      holders.map((h) => `${h.walletaddress},${h.tokenamount}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapshot_${mintAddress.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [holders, mintAddress]);

  const totalPages = Math.ceil(holders.length / perPage);
  const visibleHolders = holders.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-sol-purple flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Token Snapshot
            </h1>
            <p className="text-sm text-muted-foreground">
              View and export token holder balances
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
          <div className="glass-card p-6 animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-secondary rounded w-48" />
                <div className="h-4 bg-secondary rounded w-24" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {holders.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {holders.length} holders found
              </p>
              <button
                onClick={downloadCsv}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">
                        Holder Address
                      </th>
                      <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleHolders.map((h, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {page * perPage + i + 1}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground">
                          {h.walletaddress}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground font-medium">
                          {parseFloat(h.tokenamount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!loading && !error && holders.length === 0 && mintAddress && (
          <div className="glass-card p-10 text-center">
            <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Enter a mint address and click Fetch to view holders
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
