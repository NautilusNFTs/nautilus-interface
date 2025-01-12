import React, { useEffect, useMemo } from "react";
import Layout from "../../layouts/Default";
import { Container, Grid, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axios from "axios";
import styled from "styled-components";
import { getTokens } from "../../store/tokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { getCollections } from "../../store/collectionSlice";
import { getSales } from "../../store/saleSlice";
import { getRankings } from "../../utils/mp";
import NFTCollectionTable from "../../components/NFTCollectionTable";
import { getPrices } from "../../store/dexSlice";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import { ARC72_INDEXER_API } from "../../config/arc72-idx";
import { getSmartTokens } from "../../store/smartTokenSlice";
import {
  useCollectionInfo,
  useCollections,
  useListings,
  usePrices,
  useSales,
  useSmartTokens,
  useTokens,
} from "@/components/Navbar/hooks/collections";

import { GridLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";

const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 45px;
  gap: 10px;
  & h2.dark {
    color: #fff;
  }
  & h2.light {
    color: #93f;
  }
`;

const SectionDescription = styled.div`
  flex: 1 0 0;
  color: #93f;
  font-family: "Advent Pro";
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 120% */
  letter-spacing: 0.2px;
`;

const SectionTitle = styled.h2`
  /*color: #93f;*/
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Nohemi;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 40px */
`;

const ExternalLinks = styled.ul`
  & li {
    margin-top: 10px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Add new type definitions
type GlobalState = {
  key: string;
  value: number | string;
};

type NFTCollection = {
  contractId: number;
  totalSupply: number;
  isBlacklisted: number;
  creator: string;
  globalState: GlobalState[];
  mintRound: number;
  burnedSupply: number;
  firstToken: {
    contractId: number;
    tokenId: string;
    owner: string;
    metadataURI: string;
    metadata: string;
  } | null;
  uniqueOwners: number;
  name?: string;
  description?: string;
  launchStart?: number;
  launchEnd?: number;
  maxSupply?: number;
};

type NautilusResponse = {
  "current-round": number;
  collections: NFTCollection[];
};

// Add new type definition for listings
type Listing = {
  collectionId: number;
  tokenId: string;
  deleted: boolean;
  sold: boolean;
};

// Replace useCollectionInfo with new hook
const useNautilusCollections = () => {
  return useQuery({
    queryKey: ["nautilus-collections"],
    queryFn: async () => {
      const response = await axios.get<NautilusResponse>(
        "https://arc72-voi-mainnet.nftnavigator.xyz/nft-indexer/v1/collections?includes=unique-owners"
      );
      return response.data;
    },
  });
};

// Add new hook to fetch listings
const useNautilusListings = () => {
  return useQuery({
    queryKey: ["nautilus-listings"],
    queryFn: async () => {
      const response = await axios.get<{ listings: Listing[] }>(
        "https://arc72-voi-mainnet.nftnavigator.xyz/nft-indexer/v1/mp/listings?active=true"
      );
      return response.data;
    },
  });
};

export const Collections: React.FC = () => {
  const { data: nautilusData, status: nautilusStatus } =
    useNautilusCollections();
  const { data: listingsData, status: listingsStatus } = useNautilusListings();
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const processedCollections = useMemo(() => {
    if (!nautilusData?.collections) return [];

    // Create a map of active listings and floor prices by contract ID
    const listingsInfo =
      listingsData?.listings.reduce((acc, listing) => {
        if (!listing.deleted && !listing.sold) {
          if (!acc[listing.collectionId]) {
            acc[listing.collectionId] = {
              count: 0,
              floorPrice: Infinity,
            };
          }
          acc[listing.collectionId].count += 1;
          // Assuming the listing price is in microVOI
          const price = Number(listing.price || 0) / 1_000_000;
          acc[listing.collectionId].floorPrice = Math.min(
            acc[listing.collectionId].floorPrice,
            price
          );
        }
        return acc;
      }, {} as Record<number, { count: number; floorPrice: number }>) || {};

    // Add console.log to debug
    console.log("Listings info:", listingsInfo);

    const resolveIpfsUrl = (url: string) => {
      if (url.startsWith("ipfs://")) {
        return url.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return url;
    };

    const excludedCollections = [411530, 846601, 876578, 404576, 797609];

    const result = nautilusData.collections
      .filter(
        (collection) =>
          !collection.isBlacklisted &&
          collection.totalSupply > 0 &&
          !excludedCollections.includes(collection.contractId)
      )
      .map((collection) => {
        let image = "";
        let name = "";
        let description = "";

        try {
          if (collection.firstToken?.metadata) {
            const metadata = JSON.parse(collection.firstToken.metadata);
            image = resolveIpfsUrl(metadata.image || "");
            name = (metadata.name || "").replace(/\s*[#~]*\d+$/, "");
            description = metadata.description || "";
          }
        } catch (e) {
          console.error(
            "Error parsing metadata for collection:",
            collection.contractId,
            e
          );
        }

        const getGlobalStateValue = (key: string) =>
          collection.globalState.find((s) => s.key === key)?.value;

        return {
          contractId: collection.contractId,
          totalSupply: collection.totalSupply,
          uniqueOwners: collection.uniqueOwners,
          creator: collection.creator,
          price: Number(getGlobalStateValue("price") || 0) / 1_000_000,
          maxSupply: Number(getGlobalStateValue("maxSupply") || 0),
          launchStart: Number(getGlobalStateValue("launchStart") || 0),
          launchEnd: Number(getGlobalStateValue("launchEnd") || 0),
          image,
          name,
          description,
          activeListings: listingsInfo[collection.contractId]?.count || 0,
          floorPrice:
            listingsInfo[collection.contractId]?.floorPrice === Infinity
              ? null
              : listingsInfo[collection.contractId]?.floorPrice || null,
        };
      })
      .sort((a, b) => (b.activeListings || 0) - (a.activeListings || 0));

    console.log("Processed collections:", result);
    return result;
  }, [nautilusData, listingsData]);

  // Add loading and error states
  if (
    nautilusStatus === "loading" ||
    listingsStatus === "loading" ||
    !processedCollections
  ) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <SectionHeading>
            <SectionTitle className={isDarkTheme ? "dark" : "light"}>
              Collections
            </SectionTitle>
          </SectionHeading>
          <div className="w-full h-[max(70vh,20rem)] flex items-center justify-center">
            <GridLoader
              size={30}
              color={isDarkTheme ? "#fff" : "#000"}
              className="sm:!hidden !text-primary"
            />
            <GridLoader
              size={50}
              color={isDarkTheme ? "#fff" : "#000"}
              className="!hidden sm:!block !text-primary"
            />
          </div>
        </Container>
      </Layout>
    );
  }

  // Ensure we have data before rendering the table
  if (!Array.isArray(processedCollections)) {
    console.error(
      "processedCollections is not an array:",
      processedCollections
    );
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="xl">
        <SectionHeading>
          <SectionTitle className={isDarkTheme ? "dark" : "light"}>
            Collections
          </SectionTitle>
          <SectionDescription>
            {processedCollections.length} results
          </SectionDescription>
        </SectionHeading>
        {processedCollections.length > 0 ? (
          <NFTCollectionTable collections={processedCollections} />
        ) : (
          <div>No collections found</div>
        )}
      </Container>
    </Layout>
  );
};
