import React, { useMemo, useState } from "react";
import { styled as mstyled } from "@mui/system";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import { Box, Stack, Tooltip } from "@mui/material";
import {
  CollectionI,
  ListingI,
  RankingI,
  Sale,
  SaleI,
  Token,
} from "../../types";
import { compactAddress } from "../../utils/mp";
import moment from "moment";
import { Link } from "react-router-dom";
import SelectorIcon from "../../static/icon/icon-selector.svg";
import UpIcon from "../../static/icon/icon-up.svg";
import DownIcon from "../../static/icon/icon-down.svg";
import InfoIcon from "@mui/icons-material/Info";
import VoiIcon from "../../static/crypto-icons/voi/0.svg";
import { HIGHFORGE_CDN } from "@/config/arc72-idx";

const StyledImage = styled(Box)`
  width: 53px;
  height: 53px;
  flex-shrink: 0;
  border-radius: 8px;
  background-size: cover;
`;

const StyledTableCell = mstyled(TableCell)(({ theme }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return {
    borderBottom: "none",
    padding: theme.spacing(1),
    color: isDarkTheme ? "#fff" : "#000",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    "& a": {
      textDecoration: "none",
      color: "inherit",
    },
  };
});

const StyledTableHeading = mstyled(StyledTableCell)(({ theme }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return {
    color: isDarkTheme ? "#fff" : "#000",
    textAlign: "center",
    justifyContent: "center",
    fontFamily: "Nohemi",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "24px",
  };
});

const StyledTableRow = mstyled(TableRow)(({ theme }) => {
  return {
    borderBottom: "1px solid #3B3B3B",
  };
});

interface Props {
  listings: ListingI[];
  tokens: Token[];
  collections: CollectionI[];
  limit?: number;
  columns?: string[];
  selected?: string;
  onSelect?: (index: string) => void;
  exchangeRate?: number;
  enableSelect?: boolean;
}

const NFTListingTable: React.FC<Props> = ({
  tokens,
  collections,
  listings,
  limit = 0,
  columns = ["timestamp", "token", "image", "seller", "price"],
  selected,
  enableSelect = false,
  onSelect = (x) => {},
}) => {
  type SortOption =
    | "price-asc"
    | "price-dsc"
    | "timestamp-asc"
    | "timestamp-dsc"
    | "token-asc"
    | "token-dsc"
    | "seller-asc"
    | "seller-dsc";
  const [sortBy, setSortBy] = useState<SortOption>("timestamp-dsc");

  const isLoading = !listings || !collections || !tokens;

  const sortFunction = (sortBy: SortOption) => (a: ListingI, b: ListingI) => {
    if (!tokens) {
      return 0;
    }
    const tokenA =
      tokens.find(
        (token) =>
          token.tokenId === a.tokenId && token.contractId === a.collectionId
      ) || ({} as Token);
    const tokenB =
      tokens.find(
        (token) =>
          token.tokenId === b.tokenId && token.contractId === b.collectionId
      ) || ({} as Token);
    if (sortBy === "token-asc") {
      return tokenA.metadata?.name?.localeCompare(tokenB.metadata?.name);
    } else if (sortBy === "token-dsc") {
      return tokenB.metadata?.name.localeCompare(tokenA.metadata?.name);
    } else if (sortBy === "seller-asc") {
      return a.seller.localeCompare(b.seller);
    } else if (sortBy === "seller-dsc") {
      return b.seller.localeCompare(a.seller);
    } else if (sortBy === "price-asc") {
      return (a?.normalPrice || a.price) - (b?.normalPrice || b.price);
    } else if (sortBy === "price-dsc") {
      return (b?.normalPrice || b.price) - (a?.normalPrice || a.price);
    } else if (sortBy === "timestamp-asc") {
      return a.timestamp - b.timestamp;
    } else {
      return b.timestamp - a.timestamp;
    }
  };
  const sortedListings = useMemo(() => {
    return [...listings]
      .sort(sortFunction(sortBy))
      .filter((sale: ListingI) => sale.price > 0)
      .slice(0, limit > 0 ? limit : listings.length);
  }, [sortBy, listings]);
  return !isLoading ? (
    <TableContainer>
      <Table aria-label="rankings table">
        <TableHead>
          <StyledTableRow>
            {columns.includes("timestamp") ? (
              <StyledTableCell
                sx={{ display: { xs: "none", md: "table-cell" } }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "end" }}
                >
                  <img
                    src={
                      ["timestamp-asc", "timestamp-dsc"].includes(sortBy)
                        ? sortBy === "timestamp-asc"
                          ? UpIcon
                          : DownIcon
                        : SelectorIcon
                    }
                    alt="selector"
                    onClick={
                      ["timestamp-asc", "timestamp-dsc"].includes(sortBy)
                        ? sortBy === "timestamp-asc"
                          ? () => setSortBy("timestamp-dsc")
                          : () => setSortBy("timestamp-asc")
                        : () => setSortBy("timestamp-dsc")
                    }
                  />
                </Stack>
              </StyledTableCell>
            ) : null}
            {columns.includes("image") ? (
              <StyledTableCell></StyledTableCell>
            ) : null}
            {columns.includes("token") ? (
              <StyledTableHeading>
                <Stack
                  sx={{ justifyContent: "center" }}
                  direction="row"
                  spacing={1}
                >
                  <Box>Token</Box>
                  <img
                    src={
                      ["token-asc", "token-dsc"].includes(sortBy)
                        ? sortBy === "token-asc"
                          ? UpIcon
                          : DownIcon
                        : SelectorIcon
                    }
                    onClick={() => {
                      setSortBy(
                        ["token-asc", "token-dsc"].includes(sortBy)
                          ? sortBy === "token-asc"
                            ? "token-dsc"
                            : "token-asc"
                          : "token-dsc"
                      );
                    }}
                    alt="selector"
                  />
                </Stack>
              </StyledTableHeading>
            ) : null}
            {columns.includes("seller") ? (
              <StyledTableHeading>
                <Stack
                  sx={{ justifyContent: "center" }}
                  direction="row"
                  spacing={1}
                >
                  <Box>Seller</Box>
                  <img
                    src={
                      ["seller-asc", "seller-dsc"].includes(sortBy)
                        ? sortBy === "seller-asc"
                          ? UpIcon
                          : DownIcon
                        : SelectorIcon
                    }
                    onClick={() => {
                      setSortBy(
                        ["seller-asc", "seller-dsc"].includes(sortBy)
                          ? sortBy === "seller-asc"
                            ? "seller-dsc"
                            : "seller-asc"
                          : "seller-dsc"
                      );
                    }}
                    alt="selector"
                  />
                </Stack>
              </StyledTableHeading>
            ) : null}
            <StyledTableHeading>
              <Stack
                sx={{ justifyContent: "center" }}
                direction="row"
                spacing={1}
              >
                <Box>Price</Box>
                <img
                  src={
                    ["price-asc", "price-dsc"].includes(sortBy)
                      ? sortBy === "price-asc"
                        ? UpIcon
                        : DownIcon
                      : SelectorIcon
                  }
                  alt="selector"
                  onClick={() => {
                    setSortBy(
                      ["price-asc", "price-dsc"].includes(sortBy)
                        ? sortBy === "price-asc"
                          ? "price-dsc"
                          : "price-asc"
                        : "price-dsc"
                    );
                  }}
                />
              </Stack>
            </StyledTableHeading>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {sortedListings.map((listing, index) => {
            const token: Token =
              tokens.find(
                (token) =>
                  token.tokenId === listing.tokenId &&
                  token.contractId === listing.collectionId
              ) || ({} as Token);
            const collection: CollectionI =
              collections.find(
                (collection) => collection.contractId === listing.collectionId
              ) || ({} as CollectionI);
            const pk = `${listing.mpContractId}-${listing.mpListingId}`;
            if (!token || !collection) return null;
            return (
              <StyledTableRow
                onClick={() => {
                  if (enableSelect) {
                    onSelect(`${listing.mpContractId}-${listing.mpListingId}`);
                  }
                }}
                selected={enableSelect && selected === pk}
                hover={true}
                key={index}
              >
                {columns.includes("timestamp") ? (
                  <StyledTableCell
                    sx={{ display: { xs: "none", md: "table-cell" } }}
                  >
                    {moment.unix(listing.timestamp).fromNow()}
                  </StyledTableCell>
                ) : null}
                {columns.includes("image") ? (
                  <StyledTableCell>
                    <Link
                      to={`/collection/${collection.contractId}/token/${token.tokenId}`}
                    >
                      <StyledImage
                        sx={{
                          backgroundImage: `url(${HIGHFORGE_CDN}/i/${token.metadataURI}?w=240)`,
                        }}
                      />
                    </Link>
                  </StyledTableCell>
                ) : null}
                {columns.includes("token") ? (
                  <StyledTableCell>
                    <Link
                      to={`/collection/${collection.contractId}/token/${token.tokenId}`}
                    >
                      {token.metadata?.name}
                    </Link>
                  </StyledTableCell>
                ) : null}
                {columns.includes("seller") ? (
                  <StyledTableCell>
                    <Link to={`/account/${listing.seller}`}>
                      {compactAddress(listing.seller)}
                    </Link>
                  </StyledTableCell>
                ) : null}
                {columns.includes("price") ? (
                  <StyledTableCell>
                    {(listing.price / 1e6).toLocaleString()}{" "}
                    {listing.currency === 0 ? "VOI" : "VIA"}
                    <br />
                    <span
                      style={{
                        color: "#717579",
                        fontSize: "12px",
                      }}
                    >
                      {listing.price !== listing.normalPrice
                        ? ` (~${Math.round(
                            (listing?.normalPrice || 0) / 1e6
                          ).toLocaleString()} VOI)`
                        : null}
                    </span>
                  </StyledTableCell>
                ) : null}
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  ) : null;
};

export default NFTListingTable;
