import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Droplets, Search, Camera } from 'lucide-react';

const features = [
  { icon: Rocket, title: 'Launch Tokens', desc: 'Create SPL tokens on Solana with metadata support', path: '/launch', color: 'from-primary to-accent' },
  { icon: Droplets, title: 'Manage Liquidity', desc: 'Add or remove liquidity on Raydium pools', path: '/liquidity', color: 'from-accent to-sol-green' },
  { icon: Search, title: 'Token Info', desc: 'Look up any token metadata and market data', path: '/token-info', color: 'from-sol-green to-primary' },
  { icon: Camera, title: 'Holder Snapshot', desc: 'Export token holder balances as CSV', path: '/snapshot', color: 'from-primary to-sol-purple' },
];

export default function Index() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-sol-green animate-pulse" />
          Built on Solana
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          <span className="sol-gradient-text">SolForge</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Launch tokens, manage Raydium liquidity, and explore token data — all from one platform.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            to="/launch"
            className="px-6 py-3 sol-gradient-bg text-primary-foreground rounded-lg font-display font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Launch a Token
          </Link>
          <Link
            to="/token-info"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-display font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            Explore Tokens
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {features.map((f, i) => (
          <motion.div
            key={f.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
          >
            <Link to={f.path} className="glass-card p-6 flex flex-col gap-3 hover:border-primary/30 transition-colors group block">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
