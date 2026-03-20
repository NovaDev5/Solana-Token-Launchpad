import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TransactionStatus =
  | "idle"
  | "preparing"
  | "awaiting-approval"
  | "pending"
  | "success"
  | "error";

export interface FetchBackendResponse {
  DevnetEnabled: boolean;
  heliusapikey: string;
  ipfsapisecretkey: string;
  ipfsapikey: string;
}

export interface LiquidityPoolCreationInfo {
  lpMint: string;
  poolId: string;
}

export interface Tokenholders {
  walletaddress: string;
  tokenamount: string;
}

export interface TokenSnapshot {
  totalholders: number;
  holders: Tokenholders[];
}

export interface TokenInfo {
  tokenaddress: string;
  tokenname: string;
  tokensymbol: string;
  totalsupply: string;
  tokenholders: number;
  tokenliquidityusd: string;
  tokenpriceusd: string;
  totaltrades: number;
  buytrades: number;
  selltrades: number;
  tokenmarket: string;
  tokenburns: number;
  tokendevholdings: number;
  tokendevholdingspercentage: string;
  tokentotalsnipers: number;
  tokentotalinsiders: number;
  totaltokenfees: string;
  totaltradingtips: string;
  tokentoptenholderscount: number;
}

export interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description: string;
  image: File | null;
  imagePreview: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
}

export interface TransactionState {
  status: TransactionStatus;
  message: string;
  txSignature?: string;
  error?: string;
}

export const LAUNCHPAD_BACKEND_URL = "http://localhost:5000";

export const fetchAppConfig = async (): Promise<FetchBackendResponse> => {
  try {
    const response = await fetch(`${LAUNCHPAD_BACKEND_URL}/api/apidetails`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: FetchBackendResponse = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
