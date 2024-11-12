// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import db from "../db";
import { RootState } from "./store";
import { NFTIndexerToken, Token } from "../types";
import { decodeRoyalties } from "../utils/hf";
import { ARC72_INDEXER_API } from "../config/arc72-idx";

export interface TokensState {
  tokens: Token[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getTokens = createAsyncThunk<
  Token[],
  void,
  { rejectValue: string; state: RootState }
>("tokens/getTokens", async (_, { getState, rejectWithValue }) => {
  try {
    const tokenTable = db.table("tokens");
    const tokens = await tokenTable.toArray();
    const lastRound =
      tokens.length > 0
        ? Math.max(...tokens.map((token) => token.mintRound))
        : 0;
    const response = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/tokens`,
      {
        params: {
          "mint-min-round": lastRound,
        },
      }
    );
    const newTokens = response.data.tokens.filter(
      (token: NFTIndexerToken) => token["mint-round"] > lastRound
    );
    await db.table("tokens").bulkPut(
      newTokens.map((token: NFTIndexerToken) => {
        return {
          pk: `${token.contractId}-${token.tokenId}`,
          owner: token.owner,
          approved: token.approved,
          tokenId: token.tokenId,
          contractId: token.contractId,
          mintRound: token["mint-round"],
          metadataURI: token?.metadataURI || "",
          metadata: token?.metadata,
        };
      })
    );
    return [...tokens, ...newTokens].map((token: any) => {
      const metadata = JSON.parse(token?.metadata || "{}");
      const royalties = metadata?.royalties
        ? decodeRoyalties(metadata?.royalties || "")
        : null;
      return {
        ...token,
        metadata: JSON.parse(token?.metadata || "{}"),
        royalties,
      };
    }) as Token[];
  } catch (error: any) {
    console.log(error);
    return rejectWithValue(error.message);
  }
});

const initialState: TokensState = {
  tokens: [],
  status: "idle",
  error: null,
};

const tokenSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    updateToken(state, action) {
      const { tokenId, newData } = action.payload;
      const tokenToUpdate = state.tokens.find(
        (token) => token.tokenId === tokenId
      );
      if (tokenToUpdate) {
        Object.assign(tokenToUpdate, newData);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTokens.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTokens.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokens = [...action.payload];
      })
      .addCase(getTokens.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { updateToken } = tokenSlice.actions;
export default tokenSlice.reducer;
