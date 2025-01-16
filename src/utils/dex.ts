import { PaymentToken, Pool, PoolsResponse } from "@/types";
import { BigNumber } from "bignumber.js";
import { CONTRACT, abi, swap } from "ulujs";
import { getAlgorandClients } from "@/wallets";
import { act } from "react";

const spec = {
  name: "pool",
  desc: "pool",
  methods: [
    {
      name: "custom",
      args: [],
      returns: {
        type: "void",
      },
    },
    {
      name: "Info",
      args: [],
      returns: {
        type: "((uint256,uint256),(uint256,uint256),(uint256,uint256,uint256,address,byte),(uint256,uint256),uint64,uint64)",
      },
      readonly: true,
    },
    {
      name: "Provider_depositA",
      args: [{ type: "uint256" }],
      returns: { type: "uint256" },
    },
    {
      name: "Provider_depositB",
      args: [{ type: "uint256" }],
      returns: { type: "uint256" },
    },
    {
      name: "Provider_deposit",
      args: [{ type: "(uint256,uint256)" }, { type: "uint256" }],
      returns: { type: "uint256" },
    },
    {
      name: "Provider_withdraw",
      args: [{ type: "uint256" }, { type: "(uint256,uint256)" }],
      returns: { type: "(uint256,uint256)" },
    },
    {
      name: "Provider_withdrawA",
      args: [{ type: "uint256" }],
      returns: { type: "uint256" },
    },
    {
      name: "Provider_withdrawB",
      args: [{ type: "uint256" }],
      returns: { type: "uint256" },
    },
    {
      name: "Trader_swapAForB",
      args: [{ type: "byte" }, { type: "uint256" }, { type: "uint256" }],
      returns: { type: "(uint256,uint256)" },
    },
    {
      name: "Trader_swapBForA",
      args: [{ type: "byte" }, { type: "uint256" }, { type: "uint256" }],
      returns: { type: "(uint256,uint256)" },
    },
    // Trader_exactSwapAForB(byte,uint256,uint256)(uint256,uint256)
    {
      name: "Trader_exactSwapAForB",
      args: [
        {
          type: "byte",
        },
        {
          type: "uint256",
        },
        {
          type: "uint256",
        },
      ],
      returns: {
        type: "(uint256,uint256)",
      },
    },
    // Trader_exactSwapBForA(byte,uint256,uint256)(uint256,uint256)
    {
      name: "Trader_exactSwapBForA",
      args: [
        {
          type: "byte",
        },
        {
          type: "uint256",
        },
        {
          type: "uint256",
        },
      ],
      returns: {
        type: "(uint256,uint256)",
      },
    },
    {
      name: "arc200_approve",
      desc: "Approve spender for a token",
      args: [
        {
          type: "address",
          name: "spender",
          desc: "The address of the spender",
        },
        {
          type: "uint256",
          name: "value",
          desc: "The amount of tokens to approve",
        },
      ],
      returns: {
        type: "bool",
        desc: "Success",
      },
    },
    {
      name: "arc200_balanceOf",
      desc: "Returns the current balance of the owner of the token",
      readonly: true,
      args: [
        {
          type: "address",
          name: "owner",
          desc: "The address of the owner of the token",
        },
      ],
      returns: {
        type: "uint256",
        desc: "The current balance of the holder of the token",
      },
    },
    {
      name: "arc200_transfer",
      desc: "Transfers tokens",
      readonly: false,
      args: [
        {
          type: "address",
          name: "to",
          desc: "The destination of the transfer",
        },
        {
          type: "uint256",
          name: "value",
          desc: "Amount of tokens to transfer",
        },
      ],
      returns: {
        type: "bool",
        desc: "Success",
      },
    },
    {
      name: "createBalanceBox",
      desc: "Creates a balance box",
      args: [
        {
          type: "address",
        },
      ],
      returns: {
        type: "byte",
      },
    },
    //createAllowanceBox(address,address)void
    {
      name: "createAllowanceBox",
      desc: "Creates an allowance box",
      args: [
        {
          type: "address",
        },
        {
          type: "address",
        },
      ],
      returns: {
        type: "void",
      },
    },
    //createBalanceBoxes(address)void
    {
      name: "createBalanceBoxes",
      desc: "Creates a balance box",
      args: [
        {
          type: "address",
        },
      ],
      returns: {
        type: "void",
      },
    },
    // hasBalance(address)byte
    {
      name: "hasBalance",
      desc: "Checks if the account has a balance",
      args: [
        {
          type: "address",
        },
      ],
      returns: {
        type: "byte",
      },
    },
    // hasBox((byte,byte[64]))byte
    {
      name: "hasBox",
      desc: "Checks if the account has a box",
      args: [
        {
          type: "(byte,byte[64])",
        },
      ],
      returns: {
        type: "byte",
      },
    },
    {
      name: "reserve",
      args: [
        {
          type: "address",
        },
      ],
      returns: {
        type: "(uint256,uint256)",
      },
      readonly: true,
    },
  ],
  events: [],
};

// Update verified tokens with more details
const VERIFIED_PAYMENT_TOKENS: Record<
  number,
  { symbol: string; name: string; decimals: number; isASA?: boolean }
> = {
  395614: { symbol: "aUSDC", name: "Algorand USDC", decimals: 6, isASA: true },
  420069: { symbol: "UNIT", name: "Unit", decimals: 8 },
  302222: { symbol: "F", name: "F Token", decimals: 6 },
  412682: { symbol: "CORN", name: "Corn coin", decimals: 6 },
  300279: { symbol: "GM", name: "Good morning", decimals: 2 },
};

export const VOI_TOKEN: PaymentToken = {
  tokenId: 390001,
  symbol: "VOI",
  name: "VOI",
  decimals: 6,
  price: "1",
};

// Update the helper function to use contractId
function getPoolContract(contractId: number, activeAddress?: string) {
  const { algodClient, indexerClient } = getAlgorandClients();
  return new CONTRACT(contractId, algodClient, indexerClient, spec, {
    addr:
      activeAddress ||
      "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
    sk: new Uint8Array(0),
  });
}

export async function simulateSwap(
  inputAmount: string | number,
  pool: Pool,
  isVoiToToken: boolean,
  activeAddress?: string
): Promise<{
  outputAmount: string;
  priceImpact: string;
  minimumReceived: string;
}> {
  console.log({
    inputAmount,
    pool,
    isVoiToToken,
    activeAddress,
  });
  try {
    const ci = getPoolContract(Number(pool.contractId), activeAddress);
    ci.setFee(3000);
    console.log({ ci });

    // Input amount is already in atomic units
    const inputAmountBI = BigInt(inputAmount.toString());

    console.log({ inputAmountBI });

    let result;
    if (isVoiToToken) {
      // VOI to Token (exactSwapAForB if VOI is tokenA, exactSwapBForA if VOI is tokenB)
      if (pool.tokAId === 390001) {
        result = await ci.Trader_exactSwapAForB(
          1,
          Number.MAX_SAFE_INTEGER,
          inputAmountBI
        );
      } else {
        result = await ci.Trader_exactSwapBForA(
          1,
          Number.MAX_SAFE_INTEGER,
          inputAmountBI
        );
      }
    } else {
      // Token to VOI (exactSwapBForA if VOI is tokenA, exactSwapAForB if VOI is tokenB)
      if (pool.tokAId === 390001) {
        result = await ci.Trader_exactSwapBForA(
          1,
          Number.MAX_SAFE_INTEGER,
          inputAmountBI
        );
      } else {
        result = await ci.Trader_exactSwapAForB(
          1,
          Number.MAX_SAFE_INTEGER,
          inputAmountBI
        );
      }
    }
    console.log({ result });

    if (!result.success) {
      throw new Error("Simulation failed");
    }

    // Calculate the difference to get the output amount

    const outputAmount =
      pool.tokAId === 390001 ? result.returnValue[1] : result.returnValue[0];

    // Output amount is in atomic units
    return {
      outputAmount: outputAmount.toString(),
      priceImpact: "0", // Calculate if needed
      minimumReceived: outputAmount.toString(),
    };
  } catch (error) {
    console.error("Swap simulation error:", error);
    return {
      outputAmount: "0",
      priceImpact: "0",
      minimumReceived: "0",
    };
  }
}

// Update Pool interface to match new response
interface ExtendedPool extends Pool {
  poolId: string;
  symbolA: string;
  symbolB: string;
  poolBalA: string;
  poolBalB: string;
  tvlA: string;
  tvlB: string;
  volA: string;
  volB: string;
  apr: string;
  supply: string;
  deleted: number;
  tokADecimals: number;
  tokBDecimals: number;
  creator: string;
  mintRound: number;
}

interface ExtendedPoolsResponse {
  "current-round": number;
  pools: ExtendedPool[];
}

export async function getPaymentTokens(): Promise<PaymentToken[]> {
  try {
    const response = await fetch(
      "https://mainnet-idx.nautilus.sh/nft-indexer/v1/dex/pools?tokenId=390001"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pools data");
    }

    const data: ExtendedPoolsResponse = await response.json();
    const voiPools = data.pools;

    console.log("VOI Pools found:", voiPools.length);

    const bestPoolsByToken = new Map<number, ExtendedPool>();

    voiPools.forEach((pool) => {
      const otherTokenId = pool.tokAId === 390001 ? pool.tokBId : pool.tokAId;
      const decimals =
        pool.tokAId === 390001 ? pool.tokBDecimals : pool.tokADecimals;

      // Only process if it's a verified token
      if (VERIFIED_PAYMENT_TOKENS[otherTokenId]) {
        const currentBestPool = bestPoolsByToken.get(otherTokenId);

        if (
          !currentBestPool ||
          Number(pool.tvl) > Number(currentBestPool.tvl)
        ) {
          bestPoolsByToken.set(otherTokenId, pool);
        }
      }
    });

    const paymentTokens: PaymentToken[] = Array.from(
      bestPoolsByToken.entries()
    ).map(([tokenId, pool]) => {
      const tokenInfo = VERIFIED_PAYMENT_TOKENS[tokenId];
      // compute price from pool balances
      const poolBalAN = new BigNumber(pool.poolBalA);
      const poolBalBN = new BigNumber(pool.poolBalB);
      const price =
        pool.tokAId === 390001
          ? poolBalBN.div(poolBalAN).toNumber()
          : poolBalAN.div(poolBalBN).toNumber();
      console.log({ price, pool, poolBalAN, poolBalBN });
      return {
        tokenId: Number(pool.tokAId === 390001 ? pool.tokBId : pool.tokAId),
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: VERIFIED_PAYMENT_TOKENS[tokenId].decimals,
        price,
        contractId: pool.contractId,
        tvl: pool.tvl.toString(),
        pool: pool,
      };
    });

    const sortedTokens = paymentTokens.sort(
      (a, b) => Number(b.tvl) - Number(a.tvl)
    );

    return [VOI_TOKEN, ...sortedTokens];
  } catch (error) {
    console.error("Error fetching payment tokens:", error);
    return [VOI_TOKEN];
  }
}

// Update simulatePayment to pass through the activeAddress
export async function simulatePayment(
  voiAmount: string,
  priceAU: string,
  paymentToken: PaymentToken,
  activeAddress?: string
): Promise<{
  tokenAmount: string;
  priceImpact: string;
  minimumTokensNeeded: string;
}> {
  if (!paymentToken.pool) {
    return {
      tokenAmount: "0",
      priceImpact: "0",
      minimumTokensNeeded: "0",
    };
  }

  console.log("Simulating swap with atomic amount:", priceAU);

  // Pass activeAddress to simulateSwap
  const result = await simulateSwap(
    priceAU,
    paymentToken.pool,
    false,
    activeAddress
  );

  return {
    tokenAmount: result.outputAmount,
    priceImpact: result.priceImpact,
    minimumTokensNeeded: result.minimumReceived,
  };
}

// Add ASA mapping
export const ASA_MAPPING: Record<number, { asaId: number; decimals: number }> =
  {
    395614: { asaId: 163650, decimals: 6 }, // aUSDC
    // Add other ASA mappings here
  };

export async function simulateTokenToVoi(
  tokenAmount: string,
  pool: Pool,
  activeAddress?: string
): Promise<{
  outputAmount: string;
  priceImpact: string;
}> {
  console.log({ tokenAmount, pool, activeAddress });
  try {
    const rate =
      pool.tokAId === 390001
        ? new BigNumber(pool.poolBalB).div(new BigNumber(pool.poolBalA))
        : new BigNumber(pool.poolBalA).div(new BigNumber(pool.poolBalB));

    console.log("rate", rate.toString());

    const calculatedAmount = new BigNumber(tokenAmount)
      .multipliedBy(rate)
      .dividedBy(10 ** 6);

    console.log("calulcatedAmount", calculatedAmount.toString());

    const ci = getPoolContract(Number(pool.contractId), activeAddress);
    ci.setFee(3000);

    const inputAmountBI = BigInt(tokenAmount);

    console.log("Simulating swap with atomic amount:", inputAmountBI);

    // Token to VOI (exactSwapBForA if VOI is tokenA, exactSwapAForB if VOI is tokenB)
    const result =
      pool.tokAId === 390001
        ? await ci.Trader_exactSwapBForA(
            1,
            Number.MAX_SAFE_INTEGER,
            inputAmountBI
          )
        : await ci.Trader_exactSwapAForB(
            1,
            Number.MAX_SAFE_INTEGER,
            inputAmountBI
          );

    if (!result.success) {
      throw new Error("Simulation failed");
    }

    const outputAmount =
      BigInt(Number.MAX_SAFE_INTEGER) -
      (pool.tokAId === 390001 ? result.returnValue[1] : result.returnValue[0]);

    console.log("Output amount:", outputAmount);

    // Add 0.1% to the output amount for slippage (changed from 0.5%)
    const outputAmountWithSlippage = new BigNumber(outputAmount.toString())
      .multipliedBy(1.001) // Changed from 1.005 to 1.001 for 0.1% slippage
      .integerValue(BigNumber.ROUND_UP)
      .toString();

    // Calculate price impact
    const expectedOutput = new BigNumber(
      calculatedAmount.multipliedBy(10 ** 6).toFixed(0)
    );

    console.log("Expected output:", expectedOutput.toString());

    const actualOutput = new BigNumber(outputAmount.toString());

    const priceImpact = actualOutput
      .minus(expectedOutput)
      .dividedBy(expectedOutput)
      .multipliedBy(100)
      .toString();

    console.log("Price impact:", priceImpact);

    return {
      outputAmount: outputAmountWithSlippage, // Use amount with slippage
      priceImpact,
    };
  } catch (error) {
    console.error("Swap simulation error:", error);
    return {
      outputAmount: "0",
      priceImpact: "0",
    };
  }
}

interface TokenInfoResponse {
  "current-round": number;
  tokens: Array<{
    contractId: number;
    decimals: number;
    name: string;
    symbol: string;
    tokenId?: string;
  }>;
}

// Token info cache
const tokenInfoCache: Record<string, TokenInfoResponse['tokens'][0]> = {};

export async function fetchTokenInfo(contractId: number): Promise<TokenInfoResponse['tokens'][0] | null> {
  try {
    // Check cache first
    const cacheKey = contractId.toString();
    if (tokenInfoCache[cacheKey]) {
      return tokenInfoCache[cacheKey];
    }

    // Fetch from API if not in cache
    const response = await fetch(
      `https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/tokens?includes=all&contractId=${contractId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch token info");
    }

    const data: TokenInfoResponse = await response.json();
    const tokenInfo = data.tokens[0];

    // Cache the result
    if (tokenInfo) {
      tokenInfoCache[cacheKey] = tokenInfo;
    }

    return tokenInfo || null;
  } catch (error) {
    console.error("Error fetching token info:", error);
    return null;
  }
}
