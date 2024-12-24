import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../layouts/Default";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import NFTSaleActivityTable from "../../components/NFTSaleActivityTable";
import RankingList from "../../components/RankingList";
import { Stack } from "@mui/material";
import { getTokens } from "../../store/tokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { getCollections } from "../../store/collectionSlice";
import { ListedToken, ListingI, NFTIndexerListingI, TokenI } from "../../types";
import { getSales } from "../../store/saleSlice";
import Marquee from "react-fast-marquee";
import CartNftCard from "../../components/CartNFTCard";
import { getPrices } from "../../store/dexSlice";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import { getListings } from "../../store/listingSlice";
import { getRankings } from "../../utils/mp";
import { getSmartTokens } from "../../store/smartTokenSlice";
import Grid2 from "@mui/material/Unstable_Grid2"; // Grid version 2
import LazyLoad from "react-lazy-load";
import axios from "axios";
import { stripTrailingZeroBytes } from "@/utils/string";
import { useInView } from "react-intersection-observer";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CustomPagination from "../../components/Pagination";
import { Tabs, Tab } from "@mui/material";
import { useName } from "@/hooks/useName";

const formatPrice = (price: number) => {
  return (price / 1e6).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const ActivityFilterContainer = styled.div`
  display: flex;
  align-items: flex-start;
  align-content: flex-start;
  gap: 10px var(--Main-System-10px, 10px);
  align-self: stretch;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Button = styled.div`
  cursor: pointer;
`;

const Filter = styled(Button)`
  display: flex;
  padding: 6px 12px;
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  border-radius: 100px;
  border: 1px solid #717579;
`;

const ActiveFilter = styled(Filter)`
  border-color: #93f;
  background: rgba(153, 51, 255, 0.2);
`;

const FilterLabel = styled.div`
  color: #717579;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const ActiveFilterLabel = styled(FilterLabel)`
  color: #93f;
`;

const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 45px;
  & h2.dark {
    color: #fff;
  }
  & h2.light {
    color: #93f;
  }
`;

const SectionTitle = styled.h2`
  /*color: #93f;*/
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Nohemi;
  font-size: 36px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 40px */
  @media (min-width: 620px) {
    font-size: 40px;
  }
`;

const SectionButtonContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  & a {
    text-decoration: none;
  }
  & button.button-dark {
    border: 1px solid #fff;
  }

  & div.button-text-dark {
    color: #fff;
  }
  & button.button-light {
    border: 1px solid #93f;
  }
  & div.button-text-light {
    color: #93f;
  }
`;

const SectionMoreButtonContainer = styled(SectionButtonContainer)`
  & button.button-light::after {
    background: url("/arrow-narrow-up-right-light.svg") no-repeat;
  }
  & button.button-dark::after {
    background: url("/arrow-narrow-up-right-dark.svg") no-repeat;
  }
`;

const SectionButton = styled.button`
  /* Layout */
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  /* Style */
  border-radius: 100px;
  /* Shadow/XSM */
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.04);
  /* Style/Extra */
  background-color: transparent;
`;
const SectionMoreButton = styled(SectionButton)`
  &::after {
    content: "";
    width: 20px;
    height: 20px;
    position: relative;
    display: inline-block;
  }
`;

const SectionMoreButtonText = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0.1px;
  cursor: pointer;
`;

const SectionBanners = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 45px;
`;

const pageSize = 12;

interface Sale {
  transactionId: string;
  mpContractId: number;
  tokenId: number;
  seller: string;
  buyer: string;
  price: number;
  timestamp: number;
  collectionId: number;
}

interface TokenInfo {
  contractId: number;
  tokenId: number;
  metadata: {
    name: string;
    image: string;
  };
}

interface TokenCache {
  [key: string]: TokenInfo;
}

interface SellerStats {
  seller: string;
  totalSales: number;
  totalProceeds: number;
}

interface BuyerStats {
  buyer: string;
  totalPurchases: number;
  totalSpent: number;
}

const FEATURED_PAGE_SIZE = 5; // New constant for featured collections

// Add these type definitions at the top of the file
interface CollectionStats {
  collectionId: number;
  totalSales: number;
  totalVolume: number;
  lastSale: number;
  metadata?: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StyledTabs = styled(Tabs)`
  margin-bottom: 24px;

  & .MuiTabs-indicator {
    background-color: ${(props) => (props.theme.isDarkTheme ? "#fff" : "#93f")};
  }
`;

const StyledTab = styled(Tab)`
  color: ${(props) =>
    props.theme.isDarkTheme
      ? "rgba(255, 255, 255, 0.7)"
      : "rgba(0, 0, 0, 0.7)"} !important;

  &.Mui-selected {
    color: ${(props) => (props.theme.isDarkTheme ? "#fff" : "#93f")} !important;
  }
`;

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collection-tabpanel-${index}`}
      aria-labelledby={`collection-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

// Extract TableRow into separate component
const ActivityTableRow = ({
  sale,
  isDarkTheme,
  tokenInfo,
  collectionName,
}: {
  sale: Sale;
  isDarkTheme: boolean;
  tokenInfo: any;
  collectionName: string;
}) => {
  //const tokenInfo: any = getTokenInfo(sale.collectionId, sale.tokenId);
  const { fetchName } = useName();
  const metadata = JSON.parse(tokenInfo?.metadata || "{}");
  const [sellerName, setSellerName] = useState<string>("");
  useEffect(() => {
    fetchName(sale.seller).then(setSellerName);
  }, [sale]);
  const [buyerName, setBuyerName] = useState<string>("");
  useEffect(() => {
    fetchName(sale.buyer).then(setBuyerName);
  }, [sale]);
  console.log({ sellerName, buyerName });
  return (
    <TableRow>
      <TableCell>
        <Link
          to={`/collection/${sale.collectionId}/token/${sale.tokenId}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: isDarkTheme ? "#fff" : "inherit",
          }}
        >
          <Box
            component="img"
            src={
              metadata?.image
                ? metadata.image.indexOf("ipfs") !== -1
                  ? `https://ipfs.io/ipfs/${metadata.image.replace(
                      "ipfs://",
                      ""
                    )}`
                  : metadata.image
                : "/placeholder.png"
            }
            alt={metadata?.name || `Token #${sale.tokenId}`}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "8px",
              objectFit: "cover",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {metadata?.name || `Token #${sale.tokenId}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkTheme
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(0, 0, 0, 0.5)",
                display: "block",
              }}
            >
              {collectionName}
            </Typography>
          </Box>
        </Link>
      </TableCell>
      <TableCell>{formatPrice(sale.price)} VOI</TableCell>
      <TableCell>
        <Link to={`/account/${sale.seller}`}>
          {sellerName ? sellerName : <Skeleton width={100} height={16} />}
        </Link>
      </TableCell>
      <TableCell>
        <Link to={`/account/${sale.buyer}`}>
          {buyerName ? buyerName : <Skeleton width={100} height={16} />}
        </Link>
      </TableCell>
      <TableCell>{moment(sale.timestamp * 1000).fromNow()}</TableCell>
    </TableRow>
  );
};

export const Home: React.FC = () => {
  /* Dispatch */
  const dispatch = useDispatch();

  /* Smart Tokens */
  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  const smartTokenStatus = useSelector(
    (state: any) => state.smartTokens.status
  );
  useEffect(() => {
    if (smartTokenStatus === "succeeded") return;
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, []);

  /* Listings */
  const listings = useSelector((state: any) => state.listings.listings);
  const listingsStatus = useSelector((state: any) => state.listings.status);
  useEffect(() => {
    if (listingsStatus === "succeeded") return;
    dispatch(getListings() as unknown as UnknownAction);
  }, []);

  /* Theme */
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const [showing, setShowing] = useState<number>(pageSize);
  const { ref: loadMoreRef, inView } = useInView();

  // Add effect for infinite scroll
  useEffect(() => {
    if (inView && listings?.length > showing) {
      setShowing((prev) => prev + pageSize);
    }
  }, [inView, listings?.length, showing]);

  /* Activity */
  const [activeFilter, setActiveFilter] = useState<string[]>(["all"]);
  const handleFilterClick = (value: string) => {
    if (value === "all") return setActiveFilter(["all"]);
    if (activeFilter.length === 1 && activeFilter.includes("all"))
      return setActiveFilter([value]);
    if (activeFilter.includes(value)) {
      const newActiveFilter = activeFilter.filter((filter) => filter !== value);
      if (newActiveFilter.length === 0) return setActiveFilter(["all"]);
      setActiveFilter(activeFilter.filter((filter) => filter !== value));
    } else {
      setActiveFilter([...activeFilter, value]);
    }
  };

  const navigate = useNavigate();

  const isLoading = !listings || !smartTokens || listingsStatus !== "succeeded";

  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [tokenCache, setTokenCache] = useState<TokenCache>({});

  // Add collection info state
  const [collectionInfo, setCollectionInfo] = useState<Record<string, any>>({});
  console.log({ collectionInfo });

  // Update effect to fetch sales and collection info
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoadingSales(true);
      try {
        const response = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/mp/sales?sort=-round"
        );
        const salesData = response.data.sales.slice(0, 10);

        // Fetch collection info and token info for each sale
        for (const sale of salesData) {
          const cacheKey = `${sale.collectionId}-${sale.tokenId}`;

          // Check if we already have this token's info cached
          if (!tokenCache[cacheKey]) {
            try {
              // Fetch token info
              const tokenResponse = await axios.get(
                `https://mainnet-idx.nautilus.sh/nft-indexer/v1/tokens?contractId=${sale.collectionId}&tokenId=${sale.tokenId}`
              );

              if (
                tokenResponse.data.tokens &&
                tokenResponse.data.tokens.length > 0
              ) {
                const tokenInfo = tokenResponse.data.tokens[0];
                setTokenCache((prev) => ({
                  ...prev,
                  [cacheKey]: tokenInfo,
                }));
              }

              // Fetch collection info if we don't have it yet
              if (!collectionInfo[sale.collectionId]) {
                const collectionResponse = await axios.get(
                  `https://mainnet-idx.nautilus.sh/nft-indexer/v1/collections?contractId=${sale.collectionId}`
                );

                if (
                  collectionResponse.data.collections &&
                  collectionResponse.data.collections.length > 0
                ) {
                  setCollectionInfo((prev) => ({
                    ...prev,
                    [sale.collectionId]: collectionResponse.data.collections[0],
                  }));
                }
              }
            } catch (error) {
              console.error(`Error fetching info for ${cacheKey}:`, error);
            }
          }
        }

        setSales(salesData);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setIsLoadingSales(false);
      }
    };

    fetchSales();
  }, []);

  // Helper function to get collection name
  const getCollectionName = (collectionId: number) => {
    const collection = collectionInfo[collectionId];
    if (collection?.firstToken?.metadata) {
      try {
        const metadata = JSON.parse(collection.firstToken.metadata);
        return metadata.name?.includes(".voi")
          ? ".voi"
          : metadata.name?.replace(/\s*#?\d+$/, "") ||
              `Collection #${collectionId}`;
      } catch {
        return `Collection #${collectionId}`;
      }
    }
    return `Collection #${collectionId}`;
  };

  // Helper function to get token info from cache
  const getTokenInfo = (collectionId: number, tokenId: number | string) => {
    return tokenCache[`${collectionId}-${tokenId}`];
  };

  // Add styled components for the Activity section
  const ActivitySection = styled.div`
    margin-top: 48px;
    width: 100%;
  `;

  const ActivityTitle = styled.h2<{ $isDarkTheme: boolean }>`
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    font-family: "Plus Jakarta Sans";
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
  `;

  const StyledTableContainer = styled(TableContainer)<{
    $isDarkTheme: boolean;
  }>`
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.05)" : "#fff"};
    border-radius: 16px;
    border: 1px solid
      ${(props) =>
        props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "#D8D8E1"};

    .MuiTableCell-root {
      color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
      border-bottom: 1px solid
        ${(props) =>
          props.$isDarkTheme
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)"};
    }

    .MuiTableRow-root:last-child .MuiTableCell-root {
      border-bottom: none;
    }

    .MuiTableRow-root:hover {
      background-color: ${(props) =>
        props.$isDarkTheme
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)"};
    }

    .MuiTableHead-root .MuiTableRow-root {
      background-color: ${(props) =>
        props.$isDarkTheme
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)"};
    }

    a {
      color: ${(props) => (props.$isDarkTheme ? "#fff" : "inherit")};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  `;

  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil((sales?.length || 0) / salesPerPage);
  const paginatedSales = sales.slice(
    (currentPage - 1) * salesPerPage,
    currentPage * salesPerPage
  );

  const [topSellers, setTopSellers] = useState<SellerStats[]>([]);
  const [isLoadingTopSellers, setIsLoadingTopSellers] = useState(false);

  // Add pagination state for top sellers
  const [currentTopSellersPage, setCurrentTopSellersPage] = useState(1);
  const sellersPerPage = 5;

  // Add effect to fetch and process sales data for top sellers
  useEffect(() => {
    const fetchTopSellers = async () => {
      setIsLoadingTopSellers(true);
      try {
        const response = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/mp/sales?sort=-round&limit=1000"
        );

        // Group sales by seller and calculate totals
        const sellerMap = response.data.sales.reduce(
          (acc: Record<string, SellerStats>, sale: any) => {
            if (!acc[sale.seller]) {
              acc[sale.seller] = {
                seller: sale.seller,
                totalSales: 0,
                totalProceeds: 0,
              };
            }
            acc[sale.seller].totalSales += 1;
            acc[sale.seller].totalProceeds += Number(sale.price);
            return acc;
          },
          {}
        );

        // Convert to array and sort by total sales count
        const sortedSellers = Object.values(sellerMap)
          .sort((a: SellerStats, b: SellerStats) => b.totalSales - a.totalSales)
          .slice(0, 20);

        setTopSellers(sortedSellers);
      } catch (error) {
        console.error("Error fetching top sellers:", error);
      } finally {
        setIsLoadingTopSellers(false);
      }
    };

    fetchTopSellers();
  }, []);

  // Calculate pagination for top sellers
  const totalSellerPages = Math.ceil(topSellers.length / sellersPerPage);
  const paginatedSellers = topSellers.slice(
    (currentTopSellersPage - 1) * sellersPerPage,
    currentTopSellersPage * sellersPerPage
  );

  const [topBuyers, setTopBuyers] = useState<BuyerStats[]>([]);
  const [isLoadingTopBuyers, setIsLoadingTopBuyers] = useState(false);
  const [currentTopBuyersPage, setCurrentTopBuyersPage] = useState(1);
  const buyersPerPage = 5;

  // Add effect to fetch and process sales data for top buyers
  useEffect(() => {
    const fetchTopBuyers = async () => {
      setIsLoadingTopBuyers(true);
      try {
        const response = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/mp/sales?sort=-round&limit=1000"
        );

        // Group sales by buyer and calculate totals
        const buyerMap = response.data.sales.reduce(
          (acc: Record<string, BuyerStats>, sale: any) => {
            if (!acc[sale.buyer]) {
              acc[sale.buyer] = {
                buyer: sale.buyer,
                totalPurchases: 0,
                totalSpent: 0,
              };
            }
            acc[sale.buyer].totalPurchases += 1;
            acc[sale.buyer].totalSpent += Number(sale.price);
            return acc;
          },
          {}
        );

        // Convert to array and sort by total purchases
        const sortedBuyers = Object.values(buyerMap)
          .sort(
            (a: BuyerStats, b: BuyerStats) =>
              b.totalPurchases - a.totalPurchases
          )
          .slice(0, 20); // Get top 20 buyers for pagination

        setTopBuyers(sortedBuyers as BuyerStats[]);
      } catch (error) {
        console.error("Error fetching top buyers:", error);
      } finally {
        setIsLoadingTopBuyers(false);
      }
    };

    fetchTopBuyers();
  }, []);

  // Calculate pagination for top buyers
  const totalBuyerPages = Math.ceil(topBuyers.length / buyersPerPage);
  const paginatedBuyers = topBuyers.slice(
    (currentTopBuyersPage - 1) * buyersPerPage,
    currentTopBuyersPage * buyersPerPage
  );

  const NEW_LISTINGS_COUNT = 5; // New constant for number of listings to show

  const [topCollections, setTopCollections] = useState<
    {
      collectionId: number;
      totalSales: number;
      totalVolume: number;
      lastSale?: number;
      metadata?: any;
    }[]
  >([]);
  const [isLoadingTopCollections, setIsLoadingTopCollections] = useState(false);

  // Add this effect to fetch top collections by sales
  useEffect(() => {
    const fetchTopCollections = async () => {
      setIsLoadingTopCollections(true);
      try {
        // First get collections with their total supply
        const collectionsResponse = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/collections"
        );

        // Get all sales to calculate total volume
        const allSalesResponse = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/mp/sales"
        );

        // Calculate total volume and sales for each collection
        const collectionStats = allSalesResponse.data.sales.reduce(
          (
            acc: Record<number, { totalSales: number; totalVolume: number }>,
            sale: any
          ) => {
            if (!acc[sale.collectionId]) {
              acc[sale.collectionId] = {
                totalSales: 0,
                totalVolume: 0,
              };
            }
            acc[sale.collectionId].totalSales += 1;
            acc[sale.collectionId].totalVolume += Number(sale.price);
            return acc;
          },
          {}
        );

        // Combine collection data with total volumes and sales
        const collections = collectionsResponse.data.collections.map(
          (collection: any) => ({
            collectionId: collection.contractId,
            totalSales: collectionStats[collection.contractId]?.totalSales || 0,
            totalVolume:
              collectionStats[collection.contractId]?.totalVolume || 0,
            metadata: collection,
          })
        );

        // Sort by total all-time volume and take top 5
        const sortedCollections = collections
          .sort(
            (a: CollectionStats, b: CollectionStats) =>
              b.totalVolume - a.totalVolume
          )
          .slice(0, 5);

        setTopCollections(sortedCollections);
      } catch (error) {
        console.error("Error fetching top collections:", error);
      } finally {
        setIsLoadingTopCollections(false);
      }
    };

    fetchTopCollections();
  }, []);

  const [tabValue, setTabValue] = useState(0);
  const [trendingCollections, setTrendingCollections] = useState<
    CollectionStats[]
  >([]);
  const [isLoadingTrendingCollections, setIsLoadingTrendingCollections] =
    useState(false);

  // Add tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Add effect to fetch trending collections
  useEffect(() => {
    const fetchTrendingCollections = async () => {
      setIsLoadingTrendingCollections(true);
      try {
        // Get only the last 100 sales
        const response = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/mp/sales?sort=-round&limit=100"
        );

        // Group sales by collection and calculate totals from ONLY these 100 sales
        const collectionMap = response.data.sales.reduce(
          (acc: Record<number, CollectionStats>, sale: any) => {
            const collectionId = sale.collectionId;
            if (!acc[collectionId]) {
              acc[collectionId] = {
                collectionId: collectionId,
                totalSales: 0,
                totalVolume: 0,
                lastSale: sale.timestamp,
                recentSales: [], // Add array to track recent sales
              };
            }

            // Add this sale to recent sales and update totals
            acc[collectionId].totalSales += 1;
            acc[collectionId].totalVolume += Number(sale.price);
            acc[collectionId].recentSales.push(sale);

            return acc;
          },
          {}
        );

        // Convert to array and sort by recent volume
        const sortedCollections = Object.values(collectionMap)
          .map((collection: any) => ({
            collectionId: collection.collectionId,
            totalSales: collection.totalSales,
            totalVolume: collection.recentSales.reduce(
              (sum: number, sale: any) => sum + Number(sale.price),
              0
            ),
            lastSale: collection.lastSale,
          }))
          .sort((a, b) => b.totalVolume - a.totalVolume)
          .slice(0, 5);

        // Fetch metadata for each collection
        for (const collection of sortedCollections) {
          try {
            const collectionResponse = await axios.get(
              `https://mainnet-idx.nautilus.sh/nft-indexer/v1/collections?contractId=${collection.collectionId}`
            );
            if (collectionResponse.data.collections?.[0]) {
              collection.metadata = collectionResponse.data.collections[0];
            }
          } catch (error) {
            console.error(
              `Error fetching collection ${collection.collectionId} metadata:`,
              error
            );
          }
        }

        setTrendingCollections(sortedCollections);
      } catch (error) {
        console.error("Error fetching trending collections:", error);
      } finally {
        setIsLoadingTrendingCollections(false);
      }
    };

    fetchTrendingCollections();
  }, []);

  return (
    <Layout>
      {!isLoading ? (
        <div>
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            theme={{ isDarkTheme }}
          >
            <StyledTab label="Top Collections" />
            <StyledTab label="Trending Volume" />
          </StyledTabs>

          <TabPanel value={tabValue} index={0}>
            {isLoadingTopCollections ? (
              <div className="w-full">
                <Skeleton
                  variant="rectangular"
                  height={400}
                  sx={{ borderRadius: 2 }}
                />
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={3}
                centeredSlides={true}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                className="w-full mb-12"
                style={{
                  borderRadius: "16px",
                  height: "400px",
                }}
                breakpoints={{
                  // when window width is >= 320px
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  // when window width is >= 640px
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  // when window width is >= 1024px
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                }}
              >
                {topCollections.map((collection) => {
                  const metadata = collection.metadata?.firstToken?.metadata
                    ? JSON.parse(collection.metadata.firstToken.metadata)
                    : null;

                  return (
                    <SwiperSlide key={collection.collectionId}>
                      {({ isActive, isNext, isPrev }) => (
                        <div
                          className="relative w-full h-full cursor-pointer transition-all duration-300"
                          onClick={() =>
                            navigate(`/collection/${collection.collectionId}`)
                          }
                          style={{
                            filter: isActive ? "none" : "blur(2px)",
                            transform: isActive
                              ? "scale(1.05)"
                              : isNext || isPrev
                              ? "scale(0.9)"
                              : "scale(0.8)",
                            opacity: isActive
                              ? 1
                              : isNext || isPrev
                              ? 0.7
                              : 0.5,
                          }}
                        >
                          <img
                            src={
                              metadata?.image
                                ? metadata.image.replace(
                                    "ipfs://",
                                    "https://ipfs.io/ipfs/"
                                  )
                                : "/placeholder.png"
                            }
                            alt={
                              metadata?.name ||
                              `Collection #${collection.collectionId}`
                            }
                            className="w-full h-full object-cover rounded-lg"
                            onError={(
                              e: React.SyntheticEvent<HTMLImageElement>
                            ) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
                            <h3 className="text-xl font-bold mb-2">
                              {metadata?.name?.replace(/\s*#\d+$/, "") ||
                                `Collection #${collection.collectionId}`}
                            </h3>
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm opacity-80">
                                  Total Sales
                                </p>
                                <p className="font-bold">
                                  {collection.totalSales}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm opacity-80">Volume</p>
                                <p className="font-bold">
                                  {formatPrice(collection.totalVolume)} VOI
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {isLoadingTrendingCollections ? (
              <div className="w-full">
                <Skeleton
                  variant="rectangular"
                  height={400}
                  sx={{ borderRadius: 2 }}
                />
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={3}
                centeredSlides={true}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                className="w-full mb-12"
                style={{
                  borderRadius: "16px",
                  height: "400px",
                }}
                breakpoints={{
                  // when window width is >= 320px
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  // when window width is >= 640px
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  // when window width is >= 1024px
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                }}
              >
                {trendingCollections.map((collection) => {
                  const metadata = collection.metadata?.firstToken?.metadata
                    ? JSON.parse(collection.metadata.firstToken.metadata)
                    : null;

                  return (
                    <SwiperSlide key={collection.collectionId}>
                      {({ isActive, isNext, isPrev }) => (
                        <div
                          className="relative w-full h-full cursor-pointer transition-all duration-300"
                          onClick={() =>
                            navigate(`/collection/${collection.collectionId}`)
                          }
                          style={{
                            filter: isActive ? "none" : "blur(2px)",
                            transform: isActive
                              ? "scale(1.05)"
                              : isNext || isPrev
                              ? "scale(0.9)"
                              : "scale(0.8)",
                            opacity: isActive
                              ? 1
                              : isNext || isPrev
                              ? 0.7
                              : 0.5,
                          }}
                        >
                          <img
                            src={
                              metadata?.image
                                ? metadata.image.replace(
                                    "ipfs://",
                                    "https://ipfs.io/ipfs/"
                                  )
                                : "/placeholder.png"
                            }
                            alt={
                              metadata?.name ||
                              `Collection #${collection.collectionId}`
                            }
                            className="w-full h-full object-cover rounded-lg"
                            onError={(
                              e: React.SyntheticEvent<HTMLImageElement>
                            ) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
                            <h3 className="text-xl font-bold mb-2">
                              {metadata?.name?.replace(/\s*#\d+$/, "") ||
                                `Collection #${collection.collectionId}`}
                            </h3>
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm opacity-80">
                                  Recent Sales
                                </p>
                                <p className="font-bold">
                                  {collection.totalSales}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm opacity-80">Volume</p>
                                <p className="font-bold">
                                  {formatPrice(collection.totalVolume)} VOI
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </TabPanel>

          {/* Activity */}
          <ActivitySection>
            <ActivityTitle $isDarkTheme={isDarkTheme}>
              Recent Activity
            </ActivityTitle>
            <StyledTableContainer $isDarkTheme={isDarkTheme}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Collection</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingSales ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress
                          size={24}
                          sx={{ color: isDarkTheme ? "#fff" : "inherit" }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSales.map((sale) => (
                      <ActivityTableRow
                        key={sale.transactionId}
                        sale={sale}
                        isDarkTheme={isDarkTheme}
                        tokenInfo={getTokenInfo(
                          sale.collectionId,
                          sale.tokenId
                        )}
                        collectionName={getCollectionName(sale.collectionId)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>

            {/* Add Pagination */}
            {sales.length > salesPerPage && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isDarkTheme={isDarkTheme}
                />
              </Box>
            )}
          </ActivitySection>

          {/* Top Sellers Section */}
          {false && (
            <ActivitySection>
              <ActivityTitle $isDarkTheme={isDarkTheme}>
                Top Sellers
              </ActivityTitle>
              <StyledTableContainer $isDarkTheme={isDarkTheme}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Seller</TableCell>
                      <TableCell align="right">Total Sales</TableCell>
                      <TableCell align="right">Total Proceeds</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoadingTopSellers ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <CircularProgress
                            size={24}
                            sx={{ color: isDarkTheme ? "#fff" : "inherit" }}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSellers.map((seller) => (
                        <TableRow key={seller.seller}>
                          <TableCell>
                            <Link
                              to={`/account/${seller.seller}`}
                              style={{
                                textDecoration: "none",
                                color: isDarkTheme ? "#fff" : "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <Jazzicon
                                diameter={24}
                                seed={jsNumberForAddress(seller.seller)}
                              />
                              {`${seller.seller.slice(
                                0,
                                6
                              )}...${seller.seller.slice(-4)}`}
                            </Link>
                          </TableCell>
                          <TableCell align="right">
                            {seller.totalSales.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {(seller.totalProceeds / 1e6).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            VOI
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>

              {/* Add Pagination for Top Sellers */}
              {topSellers.length > sellersPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CustomPagination
                    currentPage={currentTopSellersPage}
                    totalPages={totalSellerPages}
                    onPageChange={setCurrentTopSellersPage}
                    isDarkTheme={isDarkTheme}
                  />
                </Box>
              )}
            </ActivitySection>
          )}

          {/* Top Buyers Section */}
          {false && (
            <ActivitySection>
              <ActivityTitle $isDarkTheme={isDarkTheme}>
                Top Buyers
              </ActivityTitle>
              <StyledTableContainer $isDarkTheme={isDarkTheme}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Buyer</TableCell>
                      <TableCell align="right">Total Purchases</TableCell>
                      <TableCell align="right">Total Spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoadingTopBuyers ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <CircularProgress
                            size={24}
                            sx={{ color: isDarkTheme ? "#fff" : "inherit" }}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBuyers.map((buyer) => (
                        <TableRow key={buyer.buyer}>
                          <TableCell>
                            <Link
                              to={`/account/${buyer.buyer}`}
                              style={{
                                textDecoration: "none",
                                color: isDarkTheme ? "#fff" : "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <Jazzicon
                                diameter={24}
                                seed={jsNumberForAddress(buyer.buyer)}
                              />
                              {`${buyer.buyer.slice(
                                0,
                                6
                              )}...${buyer.buyer.slice(-4)}`}
                            </Link>
                          </TableCell>
                          <TableCell align="right">
                            {buyer.totalPurchases.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {(buyer.totalSpent / 1e6).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            VOI
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>

              {/* Add Pagination for Top Buyers */}
              {topBuyers.length > buyersPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CustomPagination
                    currentPage={currentTopBuyersPage}
                    totalPages={totalBuyerPages}
                    onPageChange={setCurrentTopBuyersPage}
                    isDarkTheme={isDarkTheme}
                  />
                </Box>
              )}
            </ActivitySection>
          )}
        </div>
      ) : (
        <div>
          <SectionHeading>
            <Skeleton variant="rounded" width={240} height={40} />
            <Skeleton variant="rounded" width={120} height={40} />
          </SectionHeading>
          <Grid container spacing={2} sx={{ mt: 5 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton
                  sx={{ borderRadius: 10 }}
                  variant="rounded"
                  width="100%"
                  height={469}
                />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} sx={{ mt: 5 }}>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rounded" width="100%" height={240} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rounded" width="100%" height={240} />
            </Grid>
          </Grid>
        </div>
      )}
    </Layout>
  );
};
