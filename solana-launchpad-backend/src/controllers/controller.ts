import { Request, Response } from "express";
import { WalletService } from "../services/services";
import {
  FatchBackendResponse,
  TokenInfo,
  TokenSnapshot,
  Tokenholders,
} from "../config/config";

export class ServerController {
  static async servercheck(req: Request, res: Response) {
    try {
      console.log("server is active and running");
      res.status(200).json({ status: "OK" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  static async fetchAPiConfig(req: Request, res: Response) {
    try {
      const {
        SOLANA_MAINNET_API,
        SOLANA_DEVNET_API,
        IPFS_PROJECT_ID,
        IPFS_SECRET_KEY,
      } = process.env;
      const response: FatchBackendResponse = {
        DevnetEnabled: true,
        heliusapikey: SOLANA_DEVNET_API as string,
        ipfsapisecretkey: IPFS_SECRET_KEY as string,
        ipfsapikey: IPFS_PROJECT_ID as string,
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  static async FetchTokenSnapshot(req: Request, res: Response) {
    try {
      const { tokenaddress } = req.query;
      const data = await WalletService.getTokenSnapshots(
        tokenaddress as string,
      );
      const tokentotalholders = data.total;
      const tokenholdrslist = data.accounts;
      const tokenholders: Tokenholders[] = [];
      for (const holders of tokenholdrslist) {
        const tokenholdersdata: Tokenholders = {
          walletaddress: holders.wallet,
          tokenamount: Number(holders.amount).toFixed(2),
        };
        tokenholders.push(tokenholdersdata);
      }
      const tokenSnapshot: TokenSnapshot = {
        totalholders: tokentotalholders,
        holders: tokenholders,
      };
      res.json(tokenSnapshot);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }

  static async FetchTokenInfo(req: Request, res: Response) {
    try {
      const { tokenaddress } = req.query;
      const data = await WalletService.getTokenDetails(tokenaddress as string);
      const tokendata = data.token;
      const tokenpooldata = data.pools[0];
      const tokenrisk_info = data.risk;
      const TokenDetails: TokenInfo = {
        tokenaddress: tokenaddress as string,
        tokenname: tokendata.name,
        tokensymbol: tokendata.symbol,
        totalsupply: tokenpooldata.tokenSupply,
        tokenholders: data.holders,
        tokenliquidityusd: Number(tokenpooldata.liquidity.usd).toFixed(2),
        tokenpriceusd: Number(tokenpooldata.price.usd).toFixed(8),
        totaltrades: data.txns,
        buytrades: data.buys,
        selltrades: data.sells,
        tokenmarket: tokenpooldata.market,
        tokenburns: tokenpooldata.lpBurn,
        tokendevholdings: Number(tokenrisk_info.dev.amount),
        tokendevholdingspercentage: Number(
          tokenrisk_info.dev.percentage,
        ).toFixed(2),
        tokentotalsnipers: Number(tokenrisk_info.snipers.count),
        tokentotalinsiders: Number(tokenrisk_info.insiders.count),
        totaltokenfees: Number(tokenrisk_info.fees.totalTrading).toFixed(2),
        totaltradingtips: Number(tokenrisk_info.fees.totalTips).toFixed(2),
        tokentoptenholderscount: Number(tokenrisk_info.top10),
      };
      res.json(TokenDetails);
    } catch (error) {
      console.error(error);
    }
  }
}
