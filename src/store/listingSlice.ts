// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import db from "../db";
import { RootState } from "./store";
import { ListingI, NFTIndexerListingI } from "../types";
import { ARC72_INDEXER_API } from "../config/arc72-idx";

export interface ListingsState {
  listings: ListingI[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const blacklistContracts: number[] = [];

export const getListings = createAsyncThunk<
  ListingI[],
  void,
  { rejectValue: string; state: RootState }
>("listings/getListings", async (_, { getState, rejectWithValue }) => {
  try {
    //const listingTable = db.table("listings");
    //const listings = await listingTable.toArray();
    const lastRound = 0;
    // const lastRound =
    //   listings.length > 0
    //     ? Math.max(...listings.map((listing: ListingI) => listing.round))
    //     : 0;
    const response = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/listings`,
      {
        params: {
          //"min-round": lastRound,
          active: true,
        },
      }
    );
    /*
    const response2 = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/deletes`,
      {
        params: {
          "min-round": lastRound,
        },
      }
    );
    const response3 = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/sales`,
      {
        params: {
          "min-round": lastRound,
        },
      }
    );
    */

    const newlistings = response.data.listings.filter(
      (listing: NFTIndexerListingI) =>
        listing.createRound > lastRound &&
        !blacklistContracts.includes(listing.collectionId)
    );

    /*
    const deletedListingsToDelete = response2.data.deletes
      .filter((deleted: any) => deleted.round > lastRound)
      .map((deleted: any) => `${deleted.mpContractId}-${deleted.mpListingId}`);

    const soldListingsToDelete = response3.data.sales
      .filter((sale: any) => sale.round > lastRound)
      .map((sale: any) => `${sale.mpContractId}-${sale.mpListingId}`);
      */

    await db.table("listings").bulkPut(
      newlistings.map((listing: NFTIndexerListingI) => {
        return {
          pk: `${listing.mpContractId}-${listing.mpListingId}`,
          mpContractId: listing.mpContractId,
          mpListingId: listing.mpListingId,
          tokenId: listing.tokenId,
          seller: listing.seller,
          currency: listing.currency,
          price: listing.price,
          round: listing.createRound,
          timestamp: listing.createTimestamp,
          collectionId: listing.collectionId,
          endTimestamp: listing.endTimestamp,
          royalty: listing.royalty,
        } as ListingI;
      })
    );

    await db.table("tokens").bulkPut(
      newlistings.map((listing: NFTIndexerListingI) => {
        return {
          pk: `${listing.token.contractId}-${listing.token.tokenId}`,
          owner: listing.token.owner,
          approved: listing.token.approved,
          tokenId: listing.token.tokenId,
          contractId: listing.token.contractId,
          mintRound: listing.token.mintRound,
          metadataURI: listing?.token?.metadataURI || "",
          metadata: listing.token?.metadata,
        };
      })
    );

    //await db.table("listings").bulkDelete(soldListingsToDelete);
    //await db.table("listings").bulkDelete(deletedListingsToDelete);

    return [
      //...listings,
      ...newlistings,
    ]
      .reverse()
      .map((listing: any) => listing) as ListingI[];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: ListingsState = {
  listings: [],
  status: "idle",
  error: null,
};

const listingSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getListings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getListings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.listings = [...action.payload];
      })
      .addCase(getListings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default listingSlice.reducer;
