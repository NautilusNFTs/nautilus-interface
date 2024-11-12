// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { swap200 } from "ulujs";
import { getAlgorandClients } from "../wallets";
import { CTCINFO_LP_WVOI_VOI } from "../contants/dex";

export interface DexState {
  prices: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getPrices = createAsyncThunk<
  any[],
  void,
  { rejectValue: string; state: RootState }
>("dex/getPrices", async (_, { getState, rejectWithValue }) => {
  try {
    const ctcInfo = CTCINFO_LP_WVOI_VOI;
    const { algodClient, indexerClient } = getAlgorandClients();
    const ci = new swap200(ctcInfo, algodClient, indexerClient);
    const InfoR = await ci.Info();
    if (!InfoR.success) {
      throw new Error(InfoR.error);
    }
    const Info = InfoR.returnValue;
    const [, [balA, balB]] = Info;
    const prec = BigInt(10000000);
    const rateAU = (prec * balA) / balB;
    const rateSU = Number(rateAU) / Number(prec);
    //const invRateSu = 1 / rateSU;
    return [
      {
        contractId: ctcInfo,
        tokA: "wVOI",
        tokB: "VIA",
        rate: rateSU,
      },
    ];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: DexState = {
  prices: [],
  status: "idle",
  error: null,
};

const dexSlice = createSlice({
  name: "prices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPrices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPrices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.prices = [...action.payload];
      })
      .addCase(getPrices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default dexSlice.reducer;
