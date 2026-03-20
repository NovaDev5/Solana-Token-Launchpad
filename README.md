# SolForge — Solana Token Launch Platform

A production-ready, modern Solana token launch platform with beautiful, responsive UI. Launch SPL tokens, manage Raydium liquidity, explore token metadata, and export holder snapshots.

## Features

- **Token Launch** — Create SPL tokens with metadata (name, symbol, decimals, supply, image, socials)
- **Liquidity Management** — Add/remove liquidity on Raydium pools
- **Token Info** — Look up token metadata, market data, and authority info
- **Holder Snapshot** — View token holders and export as CSV
- **Wallet Integration** — Reown Solana Appkit (Phantom, Solflare and 100+ wallets)
- **Dark/Light Theme** — Default dark, crypto-native design
- **Mobile Responsive** — Works on all devices


## Tech Stack

React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, @solana/web3.js, @solana/spl-token, Solana wallet adapter, metaplex, raydium sdk and solana tracker api integration.

## Environment Variables

```env
VITE_PROJECT_ID=https://your-api.com
```

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Security

- No private keys in frontend code
- Wallet signing via reown appkit only

## Future Improvements
- Token-2022 extensions
- Analytics dashboard
