export interface FatchBackendResponse {
  DevnetEnabled: boolean;
  heliusapikey: string;
  ipfsapisecretkey: string;
  ipfsapikey: string;
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
  totaltokenfees : string;
  totaltradingtips: string;
  tokentoptenholderscount: number
}
