import { useState, useCallback, useContext } from "react";
import { motion } from "framer-motion";
import { Rocket, Upload, Copy, Check, Info } from "lucide-react";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionModal } from "@/components/common/TransactionModal";
import { DataContext } from "@/Context/AppContext";
import { useAppContext } from "@/providers/AppProvider";
import type { TokenFormData } from "@/lib/utils";
import { LaunchpadModel } from "@/lib/launchpadmodel";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { type Provider } from "@reown/appkit-adapter-solana/react";

const initialForm: TokenFormData = {
  name: "",
  symbol: "",
  decimals: 9,
  totalSupply: 1000000,
  description: "",
  image: null,
  imagePreview: "",
  website: "",
  twitter: "",
  telegram: "",
  discord: "",
};

export default function TokenLaunch() {
  const context = useContext(DataContext);
  const { apiData } = context;
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { txState, setStatus, reset } = useTransaction();
  const [form, setForm] = useState<TokenFormData>(initialForm);
  const [mintAddress, setMintAddress] = useState<string>(null);
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof TokenFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("image", file);
      updateField("imagePreview", URL.createObjectURL(file));
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mintAddress]);

  const isValid =
    form.name.trim() &&
    form.symbol.trim() &&
    form.decimals >= 0 &&
    form.decimals <= 18 &&
    form.totalSupply > 0;

  const DeployToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !isValid) return;
    try {
      setStatus("pending", "Deploying Token.....");
      const solana_launchpad = new LaunchpadModel(
        address,
        apiData,
        walletProvider,
      );
      const tokenMint = await solana_launchpad.TokenLaunch(
        form.name,
        form.symbol,
        form.description,
        form.image,
        form.decimals,
        form.totalSupply,
        address,
        walletProvider,
      );
      setMintAddress(tokenMint);
      setStatus("success", "Token created successfully!", {
        txSignature: tokenMint,
      });
    } catch (err: any) {
      setStatus("error", "Token creation failed", {
        error: err.message || "Unknown error",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg sol-gradient-bg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Launch Token
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new SPL Token on Solana
            </p>
          </div>
        </div>

        {mintAddress && txState.status === "idle" && (
          <div className="glass-card p-6 mb-6 border-sol-green/30">
            <p className="text-sm text-sol-green font-medium mb-2">
              Token Created!
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-foreground bg-secondary px-3 py-2 rounded-lg flex-1 truncate">
                {mintAddress}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-sol-green" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={DeployToken} className="glass-card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Token Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="My Token"
                className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Symbol *
              </label>
              <input
                type="text"
                value={form.symbol}
                onChange={(e) =>
                  updateField("symbol", e.target.value.toUpperCase())
                }
                placeholder="MTK"
                maxLength={10}
                className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Decimals *
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  (0–18, typically 9)
                </span>
              </label>
              <input
                type="number"
                value={form.decimals}
                onChange={(e) =>
                  updateField("decimals", parseInt(e.target.value) || 0)
                }
                min={0}
                max={18}
                className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Total Supply *
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  (before decimals)
                </span>
              </label>
              <input
                type="number"
                value={form.totalSupply}
                onChange={(e) =>
                  updateField("totalSupply", parseInt(e.target.value) || 0)
                }
                min={1}
                className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your token..."
              rows={3}
              className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Token Image
            </label>
            <div className="flex items-center gap-4">
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Token"
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <details className="group">
            <summary className="text-sm font-medium text-foreground cursor-pointer list-none flex items-center gap-2">
              <span className="text-muted-foreground group-open:rotate-90 transition-transform">
                ▶
              </span>
              Social Links (optional)
            </summary>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["website", "twitter", "telegram", "discord"] as const).map(
                (field) => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground mb-1 block capitalize">
                      {field === "twitter" ? "X / Twitter" : field}
                    </label>
                    <input
                      type="text"
                      value={form[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      placeholder={`https://...`}
                      className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                ),
              )}
            </div>
          </details>

          <button
            type="submit"
            disabled={!isConnected || !isValid || txState.status !== "idle"}
            className="w-full py-3 sol-gradient-bg text-primary-foreground rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isConnected ? "Connect Wallet First" : "Create Token"}
          </button>
        </form>
      </motion.div>

      <TransactionModal state={txState} onClose={reset} />
    </div>
  );
}
