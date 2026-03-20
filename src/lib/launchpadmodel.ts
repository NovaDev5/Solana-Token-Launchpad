import BN from "bn.js";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  FetchBackendResponse,
  LiquidityPoolCreationInfo,
  TokenInfo,
  TokenSnapshot,
  LAUNCHPAD_BACKEND_URL,
} from "@/lib/utils";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { AuthorityType, setAuthority } from "@metaplex-foundation/mpl-toolbox";
import {
  percentAmount,
  generateSigner,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createAndMint,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  Raydium,
  TxVersion,
  DEVNET_PROGRAM_ID,
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_FEE_ACC,
  getCpmmPdaAmmConfigId,
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  Percent,
} from "@raydium-io/raydium-sdk-v2";
import {
  type Provider,
} from "@reown/appkit-adapter-solana/react";


export class LaunchpadModel {
  public connection: Connection;
  public walletpubkey: PublicKey;
  public walletprovider : Provider
  public APP_Data: FetchBackendResponse | null;
  public SignAllTransactions: any;
  constructor(
    walletaddress: string,
    api_Config: FetchBackendResponse,
    walletprovider : Provider
  ) {
    this.connection = new Connection(api_Config.heliusapikey, "confirmed");
    this.walletpubkey = new PublicKey(walletaddress);
    this.APP_Data = api_Config;
    this.SignAllTransactions = walletprovider.signAllTransactions;
  }

  public async initraydiumsdk() {
    try {
      const signAllTransactions = async <
        T extends Transaction | VersionedTransaction,
      >(
        transactions: T[],
      ): Promise<T[]> => {
        if (!this.walletpubkey) throw new Error("Wallet not connected");
        return await this.SignAllTransactions(transactions);
      };

      const raydium = Raydium.load({
        owner: this.walletpubkey,
        connection: this.connection,
        cluster: "devnet",
        signAllTransactions: signAllTransactions,
      });
      return raydium;
    } catch (error) {
      console.error(error);
    }
  }

  public async TokenLaunch(
    name: string,
    symbol: string,
    tokendescription: string,
    tokenlogo: File,
    tokendecimals: number,
    totalsupply: number,
    address: string,
    wallet: any,
    tokentwitter?: string,
    tokentelegram?: string,
    tokenwebsite?: string,
  ) {
    const umi = createUmi(this.connection);
    umi.use(walletAdapterIdentity(wallet));
    umi.use(mplTokenMetadata());

    // Register required programs
    umi.programs.add({
      name: "splAssociatedToken",
      publicKey: publicKey(ASSOCIATED_TOKEN_PROGRAM_ID.toString()),
      getErrorFromCode: () => null,
      getErrorFromName: () => null,
      isOnCluster: () => true,
    });
    umi.programs.add({
      name: "splToken",
      publicKey: publicKey(TOKEN_PROGRAM_ID.toString()),
      getErrorFromCode: () => null,
      getErrorFromName: () => null,
      isOnCluster: () => true,
    });

    const owner = new PublicKey(address);
    const mint = generateSigner(umi);
    const totalSupplyValue = totalsupply
      ? BigInt(totalsupply) * BigInt(10) ** BigInt(tokendecimals)
      : BigInt("1000000000000000000"); // Default 1 billion with 9 decimals

    // === Upload Logo to IPFS via Pinata ===
    let logoUri = "";
    if (tokenlogo) {
      const formData = new FormData();
      formData.append("file", tokenlogo);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: this.APP_Data.ipfsapikey,
            pinata_secret_api_key: this.APP_Data.ipfsapisecretkey,
          },
          body: formData,
        },
      );
      const data = await res.json();
      if (data.IpfsHash) {
        logoUri = `https://ipfs.io/ipfs/${data.IpfsHash}`;
      }
    }

    // === Upload Metadata to IPFS ===
    let metadataUri = "";
    const metadataObj = {
      name,
      symbol,
      description: tokendescription || "",
      image: logoUri,
      twitter: tokentwitter || "",
      telegram: tokentelegram || "",
      website: tokenwebsite || "",
    };
    try {
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: this.APP_Data.ipfsapikey,
            pinata_secret_api_key: this.APP_Data.ipfsapisecretkey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadataObj),
        },
      );
      const data = await res.json();
      if (data.IpfsHash) {
        metadataUri = `https://ipfs.io/ipfs/${data.IpfsHash}`;
      }
    } catch (e) {
      console.error("Failed to upload metadata:", e);
    }

    const ixs = [];

    ixs.push(
      setAuthority(umi, {
        authorityType: AuthorityType.MintTokens,
        newAuthority: null,
        owned: mint.publicKey,
        owner: umi.identity,
      }),
    );

    ixs.push(
      setAuthority(umi, {
        authorityType: AuthorityType.FreezeAccount,
        newAuthority: null,
        owned: mint.publicKey,
        owner: umi.identity,
      }),
    );

    const tx = await createAndMint(umi, {
      mint,
      name: name,
      symbol: symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: tokendecimals,
      amount: totalSupplyValue,
      isMutable: true,
      tokenOwner: publicKey(address),
      tokenStandard: TokenStandard.Fungible,
    })
      .add(ixs)
      .sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
    const signature = base58.deserialize(tx.signature)[0];
    return mint.publicKey.toString();
  }

  public async TokenLiquidityCreation(
    tokenaddress: string,
    tokenamount: string,
    solamount: string,
  ): Promise<LiquidityPoolCreationInfo> {
    try {
      if (!tokenaddress || !tokenamount || !solamount) {
        throw new Error("Invalid input parameters");
      }
      const raydium = await this.initraydiumsdk();
      const solMint = "So11111111111111111111111111111111111111112";
      const tokenMint = new PublicKey(tokenaddress);
      const tokenInfo = await getMint(this.connection, tokenMint);
      const tokenDecimal = tokenInfo.decimals;
      const mintA = await raydium.token.getTokenInfo(tokenaddress);
      const mintB = await raydium.token.getTokenInfo(solMint);
      if (!mintA || !mintB) {
        throw new Error("Failed to get token info");
      }
      const feeConfigs = await raydium.api.getCpmmConfigs();
      if (raydium.cluster === "devnet") {
        feeConfigs.forEach((config) => {
          config.id = getCpmmPdaAmmConfigId(
            DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
            config.index,
          ).publicKey.toBase58();
        });
      }
      const multiplyByDecimals = (amount: string, decimals: number) => {
        const [whole, fraction = ""] = amount.split(".");
        const paddedFraction = fraction.padEnd(decimals, "0");
        return whole + paddedFraction;
      };

      const baseAmount = new BN(multiplyByDecimals(tokenamount, tokenDecimal));
      const quoteAmount = new BN(Number(solamount) * Math.pow(10, 9));
      if (baseAmount.lte(new BN(0)) || quoteAmount.lte(new BN(0))) {
        throw new Error("Amounts must be greater than 0");
      }

      const { execute, extInfo, transaction } = await raydium.cpmm.createPool({
        programId:
          raydium.cluster === "devnet"
            ? DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
            : CREATE_CPMM_POOL_PROGRAM,
        poolFeeAccount:
          raydium.cluster === "devnet"
            ? DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
            : CREATE_CPMM_POOL_FEE_ACC,
        mintA,
        mintB,
        mintAAmount: baseAmount,
        mintBAmount: quoteAmount,
        startTime: new BN(0),
        feeConfig: feeConfigs[0],
        associatedOnly: false,
        ownerInfo: {
          useSOLBalance: true,
        },
        txVersion: TxVersion.LEGACY,
      });

      const tx = new Transaction();
      tx.add(...transaction.instructions);
      tx.feePayer = this.walletpubkey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      const signedTx = await this.SignAllTransactions(tx);
      const txid = await this.connection.sendRawTransaction(
        signedTx.serialize(),
      );
      const confirmation = await this.connection.confirmTransaction(
        txid,
        "confirmed",
      );
      const liquidity_pool_mint = extInfo.address.lpMint.toString();
      const pool_id = extInfo.address.poolId.toString();
      return { lpMint: liquidity_pool_mint, poolId: pool_id };
    } catch (error) {
      console.error(error);
    }
  }

  public async TokenLiquidityRemoval(
    poolId: string,
    lpTokenAmount: string,
  ) {
    try {
      const raydium = await this.initraydiumsdk();
      let poolInfo: ApiV3PoolInfoStandardItemCpmm;
      let poolKeys: CpmmKeys | undefined;
      const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      poolInfo = data.poolInfo;
      poolKeys = data.poolKeys;

      const multiplyByDecimals = (amount: string, decimals: number) => {
        const [whole, fraction = ""] = amount.split(".");
        const paddedFraction = fraction.padEnd(decimals, "0");
        return whole + paddedFraction;
      };

      const lpAmount = new BN(
        multiplyByDecimals(lpTokenAmount, 9),
      );

      const slippage = new Percent(1, 100); // 1%

      const { execute, extInfo, transaction } =
        await raydium.cpmm.withdrawLiquidity({
          poolInfo,
          poolKeys,
          lpAmount,
          txVersion: TxVersion.LEGACY,
          slippage,
        });
      const tx = new Transaction();
      tx.add(transaction);
      tx.feePayer = this.walletpubkey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      const signedTx = await this.SignAllTransactions(tx);
      const txid = await this.connection.sendRawTransaction(
        signedTx.serialize(),
      );
      const confirmation = await this.connection.confirmTransaction(
        txid,
        "confirmed",
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async TokenSnaphots(tokenaddress: string): Promise<TokenSnapshot> {
    try {
      const response = await fetch(
        `${LAUNCHPAD_BACKEND_URL}/api/fetchtokensnapshot?tokenaddress=${tokenaddress}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TokenSnapshot = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  public async FetchTokenInfo(tokenaddress: string): Promise<TokenInfo> {
    try {
      console.log('function triggered')
      const response = await fetch(
        `${LAUNCHPAD_BACKEND_URL}/api/fetchtokendetails?tokenaddress=${tokenaddress}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TokenInfo = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}
