import React, { useEffect, useMemo } from "react";
import { styled as mstyled } from "@mui/system";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import { Box } from "@mui/material";
import {
  CollectionI,
  ListingActivityI,
  ListingI,
  RankingI,
  Sale,
  SaleActivityI,
  SaleI,
  Token,
  TokenType,
} from "../../types";
import { compactAddress } from "../../utils/mp";
import moment from "moment";
import { Link } from "react-router-dom";
import { getSmartTokens } from "../../store/smartTokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { BigNumber } from "bignumber.js";
import CryptoIconPlaceholder from "../CryptoIconPlaceholder";
import { intToColorCode } from "../../utils/string";
import { getToken } from "../../store/tokenSlice";
import axios from "axios";
import { HIGHFORGE_CDN } from "@/config/arc72-idx";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

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

interface NFTTableRowProps {
  key: any;
  relativeTime: string;
  contractId: number;
  tokenId: number;
  activity: string;
  price: string;
  currency: number;
  symbol: string;
  seller?: string;
  buyer?: string;
}

const NFTTableRow: React.FC<NFTTableRowProps> = ({
  key,
  relativeTime,
  contractId,
  tokenId,
  activity,
  price,
  currency,
  symbol,
  seller,
  buyer,
}) => {
  const [token, setToken] = React.useState<Token | null>(null);
  useEffect(() => {
    getToken(contractId, tokenId).then((token) => {
      const metadata = JSON.parse(token.metadata || "{}");
      setToken({ ...token, metadata });
    });
  }, []);
  return (
    <StyledTableRow hover={true} key={key}>
      <StyledTableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
        {relativeTime}
      </StyledTableCell>
      <StyledTableCell>
        <Link to={`/collection/${contractId}/token/${tokenId}`}>
          <StyledImage
            sx={{
              backgroundImage: `url(${token?.metadata?.image || ""})`,
            }}
          />
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link to={`/collection/${contractId}/token/${tokenId}`}>
          {token?.metadata?.name || ""}
        </Link>
      </StyledTableCell>
      <StyledTableCell>{activity}</StyledTableCell>
      <StyledTableCell>
        {seller ? (
          <Link to={`/account/${seller}`}>{compactAddress(seller)}</Link>
        ) : null}
      </StyledTableCell>
      <StyledTableCell>
        {buyer ? (
          <Link to={`/account/${buyer}`}>{compactAddress(buyer)}</Link>
        ) : (
          "-"
        )}
      </StyledTableCell>
      <StyledTableCell>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CryptoIconPlaceholder color={intToColorCode(currency)} />
          <span>
            {price} {symbol}
          </span>
        </Box>
      </StyledTableCell>
    </StyledTableRow>
  );
};

interface Props {
  sales: Sale[];
  listings: ListingI[];
  tokens: Token[];
  collections: CollectionI[];
  activeFilter?: string[];
  limit?: number;
}

const NFTCollectionTable: React.FC<Props> = ({
  sales,
  listings,
  tokens,
  collections,
  activeFilter = ["all"],
  limit = 0,
}) => {
  const dispatch = useDispatch();

  /* Smart Tokens */
  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  // const smartTokenStatus = useSelector(
  //   (state: any) => state.smartTokens.status
  // );
  useEffect(() => {
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, [dispatch]);

  const sortedList = useMemo(() => {
    return [
      ...(sales.map((el) => ({ ...el, activity: "sale" })) as SaleActivityI[]),
      ...(listings.map((el) => ({
        ...el,
        activity: "listing",
      })) as ListingActivityI[]),
    ]
      .filter((el) => {
        if (
          activeFilter &&
          activeFilter.length === 1 &&
          activeFilter[0] === "all"
        ) {
          return true;
        } else if (activeFilter && activeFilter.includes(el.activity)) {
          return true;
        }
        return false;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit > 0 ? limit : sales.length);
  }, [sales, listings, activeFilter, limit]);
  return (
    <TableContainer sx={{ mt: 2 }}>
      <Table aria-label="rankings table">
        <TableHead>
          <StyledTableRow hover={true}>
            <StyledTableCell
              sx={{ display: { xs: "none", md: "table-cell" } }}
            ></StyledTableCell>
            <StyledTableCell></StyledTableCell>
            <StyledTableHeading>Token</StyledTableHeading>
            <StyledTableHeading>Activity</StyledTableHeading>
            <StyledTableHeading>Seller</StyledTableHeading>
            <StyledTableHeading>Buyer</StyledTableHeading>
            <StyledTableHeading>Price</StyledTableHeading>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {sortedList.map((sale, index) => {
            console.log({ sale });
            const token =
              tokens.find(
                (token) =>
                  token.tokenId === sale.tokenId &&
                  token.contractId === sale.collectionId
              ) || ({} as Token);
            console.log({ token });
            const collection =
              collections.find(
                (collection) => collection.contractId === sale.collectionId
              ) || ({} as CollectionI);
            const collectionsMissingImage = [35720076];
            const url = !collectionsMissingImage.includes(sale.collectionId)
              ? `${HIGHFORGE_CDN}/i/${encodeURIComponent(
                  token.metadataURI
                )}?w=240`
              : token.metadata.image;
            const currency = smartTokens.find(
              (smartToken: TokenType) =>
                `${smartToken.contractId}` === `${sale.currency}`
            );
            const currencyDecimals =
              currency?.decimals === 0 ? 0 : currency?.decimals || 6;
            const currencySymbol =
              currency?.tokenId === "0" ? "VOI" : currency?.symbol || "VOI";
            const price = formatter.format(
              new BigNumber(sale.price)
                .div(new BigNumber(10).pow(currencyDecimals))
                .toNumber()
            );
            return (
              <NFTTableRow
                key={index}
                relativeTime={moment.unix(sale.timestamp).fromNow()}
                contractId={sale.collectionId}
                tokenId={sale.tokenId}
                activity={
                  sale.activity[0].toUpperCase() + sale.activity.slice(1)
                }
                seller={sale.seller}
                buyer={sale.buyer}
                price={price}
                currency={
                  currency?.tokenId === "0" ? 0 : currency?.contractId || 0
                }
                symbol={currencySymbol}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NFTCollectionTable;
