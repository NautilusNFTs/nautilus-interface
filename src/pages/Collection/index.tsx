import React, { useEffect, useMemo } from "react";
import Layout from "../../layouts/Default";
import {
  Box,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axios from "axios";
import styled from "styled-components";
import { getSales } from "../../store/saleSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { ListingI, NFTIndexerListingI, RankingI, TokenType } from "../../types";
import { getCollections } from "../../store/collectionSlice";
import NFTListingTable from "../../components/NFTListingTable";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import { getPrices } from "../../store/dexSlice";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import NftCard from "../../components/NFTCard";
import { getListings } from "../../store/listingSlice";
import { getTokens } from "../../store/tokenSlice";
import { BigNumber } from "bignumber.js";
import { getSmartTokens } from "../../store/smartTokenSlice";
import { getRankings } from "../../utils/mp";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import CartNftCard from "../../components/CartNFTCard";
import { ARC72_INDEXER_API, HIGHFORGE_API } from "../../config/arc72-idx";
import { stripTrailingZeroBytes } from "@/utils/string";

const StatContainer = styled(Stack)`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--Main-System-24px, 24px);
  & .dark {
    color: #fff;
  }
  & .light {
    color: #000;
  }
`;

const BannerContainer = styled.div`
  display: flex;
  width: 100%;
  height: 200px;
  align-items: flex-end;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 16px;
  background-size: cover;
  padding-bottom: 50px;
`;

const BannerTitleContainer = styled.div`
  display: flex;
  /*
  width: 400px;
  */
  height: 80px;
  padding: 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--Main-System-8px, 8px);
  flex-shrink: 0;
  border-radius: var(--Main-System-16px, 16px);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(50px);
  margin-left: 40px;
`;

const BannerTitle = styled.h1`
  flex: 1 0 0;
  color: #fff;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Nohemi;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 40px */
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const formatter = Intl.NumberFormat("en", { notation: "compact" });

export const Collection: React.FC = () => {
  /* Theme */

  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const dispatch = useDispatch();

  /* Listings */
  // const listings = useSelector((state: any) => state.listings.listings);
  // const listingsStatus = useSelector((state: any) => state.listings.status);
  // useEffect(() => {
  //   dispatch(getListings() as unknown as UnknownAction);
  // }, [dispatch]);

  /* Tokens */
  // const tokens = useSelector((state: any) => state.tokens.tokens);
  // const tokenStatus = useSelector((state: any) => state.tokens.status);
  // useEffect(() => {
  //   dispatch(getTokens() as unknown as UnknownAction);
  // }, [dispatch]);

  /* Smart Tokens */
  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  const smartTokenStatus = useSelector(
    (state: any) => state.smartTokens.status
  );
  useEffect(() => {
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, [dispatch]);

  /* Dex */
  const prices = useSelector((state: RootState) => state.dex.prices);
  const dexStatus = useSelector((state: RootState) => state.dex.status);
  useEffect(() => {
    dispatch(getPrices() as unknown as UnknownAction);
  }, [dispatch]);
  const exchangeRate = 1;
  /*useMemo(() => {
    if (!prices || dexStatus !== "succeeded") return 0;
    const voiPrice = prices.find((p) => p.contractId === CTCINFO_LP_WVOI_VOI);
    if (!voiPrice) return 0;
    return voiPrice.rate;
  }, [prices, dexStatus]);
  */

  /* Sales */
  const sales = useSelector((state: any) => state.sales.sales);
  const salesStatus = useSelector((state: any) => state.sales.status);
  useEffect(() => {
    dispatch(getSales() as unknown as UnknownAction);
  }, [dispatch]);

  /* Collections */
  const collections = useSelector(
    (state: any) => state.collections.collections
  );
  const collectionStatus = useSelector(
    (state: any) => state.collections.status
  );
  useEffect(() => {
    dispatch(getCollections() as unknown as UnknownAction);
  }, [dispatch]);

  /* Router */

  const { id } = useParams();

  const navigate = useNavigate();

  /* Collection Info */

  const [collectionInfo, setCollectionInfo] = React.useState<any>(null);
  useEffect(() => {
    try {
      axios
        .get(`${HIGHFORGE_API}/projects/info/${id}`)
        .then((res: any) => res.data)
        .then(setCollectionInfo);
    } catch (e) {
      console.log(e);
    }
  }, [id]);

  console.log("collectionInfo", collectionInfo);

  /* NFT Navigator Listings */
  const [listings, setListings] = React.useState<any>([]);
  React.useEffect(() => {
    try {
      const res = axios
        .get(`${ARC72_INDEXER_API}/nft-indexer/v1/mp/listings`, {
          params: {
            active: true,
            collectionId: id,
          },
        })
        .then(({ data }) => {
          setListings(data.listings);
        });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const normalListings = useMemo(() => {
    return listings?.map((listing: NFTIndexerListingI) => {
      const smartToken = smartTokens.find(
        (token: TokenType) => `${token.contractId}` === `${listing.currency}`
      );
      const currencyDecimals =
        smartToken?.decimals === 0 ? 0 : smartToken?.decimals || 6;
      const unitPriceBn = new BigNumber(
        listing.currency === 0 ? "1" : smartToken?.price || "0"
      );
      const tokenPriceBn = new BigNumber(listing.price).div(
        new BigNumber(10).pow(currencyDecimals)
      );
      const normalPriceBn = unitPriceBn.multipliedBy(tokenPriceBn);
      return {
        ...listing,
        normalPrice: normalPriceBn.toNumber(),
      };
    });
  }, [listings, smartTokens]);

  const sortedListings = useMemo(() => {
    return normalListings?.sort((a: any, b: any) => {
      return a.normalPrice - b.normalPrice;
    });
  }, [normalListings]);

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // const stats: any = useMemo(() => {
  //   if (
  //     //tokenStatus !== "succeeded" ||
  //     //listingsStatus !== "succeeded" ||
  //     salesStatus !== "succeeded" ||
  //     collectionStatus !== "succeeded" ||
  //     smartTokenStatus !== "succeeded" ||
  //     //!tokens ||
  //     !collections ||
  //     !sales ||
  //     //!listings ||
  //     !smartTokens
  //   )
  //     return null;
  //   const rankings = getRankings(
  //     //tokens,
  //     collections,
  //     sales,
  //     listings,
  //     1,
  //     smartTokens
  //   );
  //   return rankings.find((el: RankingI) => `${el.collectionId}` === `${id}`);
  // }, [
  //   sales,
  //   tokens,
  //   collections,
  //   //listings,
  //   smartTokens,
  //   id,
  //   tokenStatus,
  //   //listingsStatus,
  //   salesStatus,
  //   collectionStatus,
  //   smartTokenStatus,
  // ]);

  // const [tokenPrices, setTokenPrices] = React.useState<Map<number, string>>();
  // useEffect(() => {
  //   const tokenPrices = new Map();
  //   for (const token of smartTokens) {
  //     if (!token?.price) {
  //       tokenPrices.set(token.contractId, token?.price || "0");
  //     }
  //   }
  //   setTokenPrices(tokenPrices);
  // }, [smartTokens]);

  // const normalListings = useMemo(() => {
  //   if (!listings || !exchangeRate) return [];
  //   return listings.map((listing: ListingI) => {
  //     return {
  //       ...listing,
  //       normalPrice:
  //         listing.currency === 0 ? listing.price : listing.price * exchangeRate,
  //     };
  //   });
  // }, [listings, exchangeRate]);

  const nfts: any[] = [];
  // const nfts = useMemo(() => {
  //   return tokens?.filter((token: any) => `${token.contractId}` === `${id}`);
  // }, [tokens]);

  // const listedNfts = useMemo(() => {
  //   const listedNfts =
  //     nfts
  //       ?.filter((nft: any) => {
  //         return normalListings?.some(
  //           (listing: any) =>
  //             `${listing.collectionId}` === `${nft.contractId}` &&
  //             `${listing.tokenId}` === `${nft.tokenId}`
  //         );
  //       })
  //       ?.map((nft: any) => {
  //         const listing = normalListings.find(
  //           (l: any) =>
  //             `${l.collectionId}` === `${nft.contractId}` &&
  //             `${l.tokenId}` === `${nft.tokenId}`
  //         );
  //         return {
  //           ...nft,
  //           listing,
  //         };
  //       }) || [];
  //   listedNfts.sort(
  //     (a: any, b: any) => a.listing.normalPrice - b.listing.normalPrice
  //   );
  //   return listedNfts;
  // }, [nfts, normalListings]);

  // const listedCollections = useMemo(() => {
  //   const listedCollections =
  //     collections
  //       ?.filter((c: any) => {
  //         return listedNfts?.some(
  //           (nft: any) => `${nft.contractId}` === `${c.contractId}`
  //         );
  //       })
  //       .map((c: any) => {
  //         return {
  //           ...c,
  //           tokens: listedNfts?.filter(
  //             (nft: any) => `${nft.contractId}` === `${c.contractId}`
  //           ),
  //         };
  //       }) || [];
  //   listedCollections.sort(
  //     (a: any, b: any) =>
  //       b.tokens[0].listing.createTimestamp -
  //       a.tokens[0].listing.createTimestamp
  //   );
  //   return listedCollections;
  // }, [collections, listedNfts]);

  const collectionSales = useMemo(() => {
    return (
      sales?.filter((sale: any) => `${sale.collectionId}` === `${id}`) || []
    );
  }, [sales]);

  const isLoading = useMemo(
    () =>
      //tokenStatus !== "succeeded" ||
      //listingsStatus !== "succeeded" ||
      salesStatus !== "succeeded" ||
      collectionStatus !== "succeeded" ||
      smartTokenStatus !== "succeeded" ||
      //!tokens ||
      !collectionSales ||
      !collections ||
      //!nfts ||
      //!listings ||
      //!listedNfts ||
      //!listedCollections ||
      !sales,
    [
      collections,
      nfts,
      //listings,
      //listedNfts, listedCollections,
      //stats,
    ]
  );

  return (
    <Layout>
      {!isLoading ? (
        <div>
          <BannerContainer
            style={{
              backgroundImage: `url(${
                collectionInfo?.project?.coverImageURL ||
                nfts[0]?.metadata?.image
              })`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <BannerTitleContainer>
              <BannerTitle>
                {collectionInfo?.project?.title ||
                  nfts[0]?.metadata?.name?.replace(/[0-9]*$/, "")}
              </BannerTitle>
            </BannerTitleContainer>
          </BannerContainer>
          <Grid container spacing={2}>
            <Grid
              item
              sx={{ display: { xs: "none", sm: "block" } }}
              xs={12}
              sm={12}
            >
              &nbsp;
            </Grid>
            <Grid item xs={12} sm={12}>
              <Stack sx={{ mt: 5 }} gap={2}>
                <StatContainer
                  sx={{
                    //display: { xs: "none", md: "flex" },
                    flexDirection: { xs: "column", md: "row" },
                    overflow: "hidden",
                    justifyContent: "flex-end",
                    gap: "40px",
                  }}
                >
                  {[
                    /*
                    {
                      name: "Total NFTs",
                      displayValue: nfts.length,
                      value: nfts.length,
                    },
                    {
                      name: "Listed",
                      displayValue:
                        ((listings.length / nfts.length) * 100).toFixed(2) +
                        "%",
                      value: listings.length,
                    },
                    {
                      name: "Sales",
                      displayValue: collectionSales.length,
                      value: collectionSales.length,
                    },
                    {
                      name: "Volume",
                      displayValue:
                        formatter.format(stats?.volume) +
                        ` ${stats?.scoreUnit || "VOI"}`,
                      value: stats?.volume,
                    },

                    {
                      name: "Floor Price",
                      displayValue: `${formatter.format(stats?.floorPrice)} ${
                        stats?.scoreUnit || "VOI"
                      }`,
                      value: stats?.floorPrice,
                    },
                    {
                      name: "Avg. Sale",
                      displayValue:
                        formatter.format(
                          stats?.volume / collectionSales.length
                        ) + ` ${stats?.scoreUnit || "VOI"}`,
                      value:
                        stats?.volume > 0 && collectionSales.length > 0
                          ? stats?.volume / collectionSales.length
                          : 0,
                    },
                    */
                  ].map((el, i) =>
                    el.value > 0 ? (
                      <Stack
                        sx={{
                          flexShrink: 0,
                        }}
                        key={i}
                      >
                        <Typography sx={{ color: "#717579" }} variant="h6">
                          {el.name}
                        </Typography>
                        <Typography
                          variant="h4"
                          className={isDarkTheme ? "dark" : "light"}
                        >
                          {el.displayValue}
                        </Typography>
                      </Stack>
                    ) : null
                  )}
                </StatContainer>
                {/*<Stack
                  direction="row"
                  spacing={2}
                  sx={{ justifyContent: "end" }}
                >
                  <ToggleButtonGroup
                    color="primary"
                    value={viewMode}
                    exclusive
                    onChange={() => {
                      setViewMode(viewMode === "list" ? "grid" : "list");
                    }}
                    aria-label="Platform"
                  >
                    <ToggleButton value="list">
                      <ViewListIcon />
                    </ToggleButton>
                    <ToggleButton value="grid">
                      <GridViewIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  </Stack>*/}
                {/*viewMode === "list" ? (
                  <NFTListingTable
                    listings={normalListings}
                    tokens={nfts}
                    collections={collections}
                  />
                ) : null*/}
                {viewMode === "grid" ? (
                  sortedListings?.length > 0 ? (
                    <>
                      <Grid2 container spacing={2}>
                        {sortedListings?.map((el: NFTIndexerListingI) => {
                          return (
                            <Grid2 key={el.transactionId}>
                              <CartNftCard
                                token={{
                                  ...el.token,
                                  metadataURI: stripTrailingZeroBytes(
                                    el.token.metadataURI
                                  ),
                                }}
                                listing={el}
                                onClick={() => {
                                  navigate(
                                    `/collection/${el.collectionId}/token/${el.tokenId}`
                                  );
                                }}
                              />
                            </Grid2>
                          );
                        })}
                      </Grid2>
                    </>
                  ) : (
                    <Box sx={{ mt: 5 }}>
                      <Typography variant="body2">
                        No NFTs found in this collection
                      </Typography>
                    </Box>
                  )
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </div>
      ) : (
        <Container maxWidth="lg">
          <Stack sx={{ mt: 5 }} gap={2}>
            <Skeleton variant="text" width={280} height={50} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((el) => (
                <Grid item xs={6} sm={4} md={3} lg={2}>
                  <Skeleton variant="rectangular" width="100%" height={200} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="text" width={280} height={50} />
            <Skeleton variant="text" width={180} height={50} />
            <Skeleton variant="text" width={180} height={50} />
          </Stack>
        </Container>
      )}
    </Layout>
  );
};
