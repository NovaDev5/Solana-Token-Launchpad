import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletModal } from '@/components/common/WalletModal';
import { useAppContext } from '@/providers/AppProvider';
import { Moon, Sun, Menu, X, Rocket, Droplets, Search, Camera } from 'lucide-react';

const navItems = [
  { path: '/launch', label: 'Launch', icon: Rocket },
  { path: '/liquidity', label: 'Liquidity', icon: Droplets },
  { path: '/token-info', label: 'Token Info', icon: Search },
  { path: '/snapshot', label: 'Snapshot', icon: Camera },
];

export function Navbar() {
  const { theme, toggleTheme,  } = useAppContext();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg sol-gradient-bg flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">
              S
            </span>
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">
            SolForge
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-secondary rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-border/50">
            <div className="[&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!bg-primary [&_.wallet-adapter-button]:!text-primary-foreground [&_.wallet-adapter-button]:!font-display [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!h-10 [&_.wallet-adapter-button]:!rounded-lg [&_.wallet-adapter-button]:!justify-center">
              <WalletModal />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/50 overflow-hidden bg-background"
          >
            <div className="container py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border/50">
                <div className="[&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!bg-primary [&_.wallet-adapter-button]:!text-primary-foreground [&_.wallet-adapter-button]:!font-display [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!h-10 [&_.wallet-adapter-button]:!rounded-lg [&_.wallet-adapter-button]:!justify-center">
                  <WalletModal />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
