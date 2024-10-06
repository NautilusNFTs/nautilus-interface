// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import db from "../db";
import { TokenType } from "../types";

export interface SmartTokensState {
  tokens: TokenType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getSmartTokens = async () => {
  try {
    const storedTokens = await db.table("smartTokens").toArray();
    if (storedTokens.length > 0) {
      return storedTokens;
    }
    const response = await axios.get(
      `https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/tokens?includes=all`
    );
    const tokens = response.data.tokens;
    await db.table("smartTokens").bulkPut(
      tokens.map((token: TokenType) => {
        return {
          pk: `${token.contractId}`,
          contractId: token.contractId,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          totalSupply: token.totalSupply,
          creator: token.creator,
          mintRound: token.mintRound,
          globalState: token.globalState,
          tokenId: token.tokenId,
          price: token.price,
        };
      })
    );
    return tokens;
  } catch (error: any) {
    console.log({ error });
    return console.error(error.message);
  }
};
