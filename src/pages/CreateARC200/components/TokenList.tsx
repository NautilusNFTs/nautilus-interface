import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  useTheme,
  Link,
  Tooltip,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import algosdk from "algosdk";
import { useEffect, useState, useMemo } from "react";
import Pagination from "@/components/Pagination";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import axios from "axios";
import TokenInfoModal from "@/components/modals/TokenInfoModal";

interface TokenData {
  contractId: number;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creator: string;
  deleted: number;
  mintRound: number;
  verified?: boolean;
  globalState: Record<string, any>;
  change_1h: {
    latest_price: string | null;
    earliest_price: string | null;
    percent_change: number | null;
  };
  change_24h: {
    latest_price: string | null;
    earliest_price: string | null;
    percent_change: number | null;
  };
  change_7d: {
    latest_price: string | null;
    earliest_price: string | null;
    percent_change: number | null;
  };
}

interface TokenListProps {
  tokens: TokenData[];
}

interface AccountInfo {
  amount: number;
  "min-balance": number;
}

interface Pool {
  contractId: number;
  poolId: string;
  tokAId: string;
  tokBId: string;
  symbolA: string;
  symbolB: string;
  tvl: number;
  apr: string;
}

const StyledTableContainer = styled(TableContainer)<{ $isDarkTheme: boolean }>`
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.05)" : "#fff"};
  border-radius: 24px;
  border: 1px solid
    ${(props) => (props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "#D8D8E1")};
  margin-top: 32px;

  .MuiTableCell-root {
    border-bottom: 1px solid
      ${(props) =>
        props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
    background-color: transparent;
  }

  .MuiTableRow-root:last-child .MuiTableCell-root {
    border-bottom: none;
  }

  .MuiTableRow-root:hover {
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
  }

  .MuiTableHead-root .MuiTableRow-root {
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
  }

  a {
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "inherit")};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ChangeText = styled.span<{ $isPositive: boolean }>`
  color: ${(props) => (props.$isPositive ? "#00C853" : "#FF3D00")};
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#4CAF50",
    "&:hover": {
      backgroundColor: "rgba(76, 175, 80, 0.08)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#4CAF50",
  },
}));

const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const TokenIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const ActionButton = styled(Button)<{ $isDarkTheme: boolean }>`
  display: flex;
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"};
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "inherit")};
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"};
  }
`;

const ButtonText = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(true);
  const [showCreators, setShowCreators] = useState(false);
  const itemsPerPage = 10;

  const [sortColumn, setSortColumn] = useState<"change_7d">("change_7d");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [isLoadingPool, setIsLoadingPool] = useState(false);

  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const filteredTokens = tokens.filter((token) => {
    const isARC200LT = token.symbol !== "ARC200LT";
    const maxSupply = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const isNotMaxSupply = token.totalSupply !== maxSupply;
    const meetsVerifiedCriteria = showVerifiedOnly ? Number(token.verified) > 0 : true;
    return isARC200LT && isNotMaxSupply && meetsVerifiedCriteria;
  });

  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      const aChange = a.change_7d.percent_change || 0;
      const bChange = b.change_7d.percent_change || 0;
      return sortDirection === "desc" ? bChange - aChange : aChange - bChange;
    });
  }, [filteredTokens, sortDirection]);

  const totalPages = Math.ceil(sortedTokens.length / itemsPerPage);
  const showPagination = sortedTokens.length > itemsPerPage;

  const cellStyle = {
    color: isDarkTheme ? "#fff" : theme.palette.text.primary,
    fontWeight: 100,
    backgroundColor: "transparent",
    padding: "16px",
  };

  const headCellStyle = {
    ...cellStyle,
    fontWeight: 600,
    color: isDarkTheme ? "#fff" : theme.palette.text.primary,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const formatTotalSupply = (supply: string, decimals: number) => {
    const bn = new BigNumber(supply);
    const divisor = new BigNumber(10).pow(decimals);
    return bn.dividedBy(divisor).toFormat();
  };

  const formatPercentChange = (change: number | null) => {
    if (change === null) return "-";
    const isPositive = change > 0;
    return (
      <ChangeText $isPositive={isPositive}>
        {isPositive ? "+" : ""}
        {change.toFixed(2)}%
      </ChangeText>
    );
  };

  const formatPrice = (token: TokenData) => {
    const price = token.change_24h.latest_price;
    if (!price) return "-";
    return `${Number(price).toFixed(6)} VOI`;
  };

  const handleSwap = async (tokenId: number) => {
    setIsLoadingPool(true);
    try {
      const response = await axios.get(
        `https://mainnet-idx.nautilus.sh/nft-indexer/v1/dex/pools?tokenId=${tokenId}`
      );

      if (response.data.pools && response.data.pools.length > 0) {
        // Get the first pool from the response
        const firstPool = response.data.pools[0];
        // Open Humble swap in new tab with the pool ID
        window.open(
          `https://voi.humble.sh/#/swap?poolId=${firstPool.contractId}`,
          "_blank"
        );
      } else {
        toast.error("No liquidity pool found for this token");
      }
    } catch (error) {
      console.error("Error fetching pool data:", error);
      toast.error("Failed to fetch pool data");
    } finally {
      setIsLoadingPool(false);
    }
  };

  const handleTokenClick = (token: TokenData) => {
    setSelectedToken(token);
    setShowTokenInfo(true);
  };

  if (sortedTokens.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography
          variant="body1"
          sx={{
            color: isDarkTheme
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
          }}
        >
          No tokens found
        </Typography>
      </Box>
    );
  }

  const paginatedTokens = sortedTokens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <FilterContainer>
        <FormControlLabel
          control={
            <StyledSwitch
              checked={showCreators}
              onChange={(e) => setShowCreators(e.target.checked)}
            />
          }
          label={
            <Typography
              sx={{
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: '14px',
              }}
            >
              Show Creators
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <StyledSwitch
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
            />
          }
          label={
            <Typography
              sx={{
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: '14px',
              }}
            >
              Show Verified Only
            </Typography>
          }
        />
      </FilterContainer>

      <StyledTableContainer component={Box} $isDarkTheme={isDarkTheme}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={headCellStyle}>Contract ID</TableCell>
              <TableCell style={headCellStyle}>Name</TableCell>
              <TableCell style={headCellStyle}>Symbol</TableCell>
              <TableCell style={headCellStyle} align="right">
                Total Supply
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                Price
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                1h Change
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                24h Change
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                7d Change
              </TableCell>
              {showCreators && (
                <TableCell style={headCellStyle}>Creator</TableCell>
              )}
              <TableCell style={headCellStyle} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTokens.map((token) => (
              <TableRow
                key={token.contractId}
                sx={{
                  "&:hover": {
                    backgroundColor: isDarkTheme
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              >
                <TableCell style={cellStyle}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Link
                      href={`https://block.voi.network/explorer/application/${token.contractId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "inherit" }}
                    >
                      {token.contractId}
                    </Link>
                    <ContentCopyIcon
                      sx={{
                        cursor: "pointer",
                        fontSize: "16px",
                        "&:hover": { opacity: 0.8 },
                      }}
                      onClick={() =>
                        copyToClipboard(
                          token.contractId.toString(),
                          "Contract ID"
                        )
                      }
                    />
                  </Box>
                </TableCell>
                <TableCell style={cellStyle}>
                  <TokenIconContainer>
                    {Number(token.verified) > 0 && (
                      <TokenIcon
                        src={`https://asset-verification.nautilus.sh/icons/${token.contractId}.png`}
                        alt={token.name}
                        onError={(
                          e: React.SyntheticEvent<HTMLImageElement>
                        ) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <NameCell
                      onClick={() => handleTokenClick(token)}
                      style={{ cursor: "pointer" }}
                    >
                      {token.name}
                      {Number(token.verified) > 0 && (
                        <Tooltip title="Verified Token" placement="top">
                          <VerifiedUserIcon
                            sx={{
                              fontSize: "16px",
                              color: isDarkTheme ? "#4CAF50" : "#2E7D32",
                            }}
                          />
                        </Tooltip>
                      )}
                    </NameCell>
                  </TokenIconContainer>
                </TableCell>
                <TableCell style={cellStyle}>
                  <NameCell
                    onClick={() => handleTokenClick(token)}
                    style={{ cursor: "pointer" }}
                  >
                    {token.symbol}
                    {Number(token.verified) > 0 && (
                      <Tooltip title="Verified Token" placement="top">
                        <VerifiedUserIcon
                          sx={{
                            fontSize: "16px",
                            color: isDarkTheme ? "#4CAF50" : "#2E7D32",
                          }}
                        />
                      </Tooltip>
                    )}
                  </NameCell>
                </TableCell>
                <TableCell style={cellStyle} align="right">
                  {formatTotalSupply(token.totalSupply, token.decimals)}
                </TableCell>
                <TableCell style={cellStyle} align="right">
                  {formatPrice(token)}
                </TableCell>
                <TableCell style={cellStyle} align="right">
                  {formatPercentChange(token.change_1h.percent_change)}
                </TableCell>
                <TableCell style={cellStyle} align="right">
                  {formatPercentChange(token.change_24h.percent_change)}
                </TableCell>
                <TableCell style={cellStyle} align="right">
                  {formatPercentChange(token.change_7d.percent_change)}
                </TableCell>
                {showCreators && (
                  <TableCell style={cellStyle}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Link
                        href={`https://block.voi.network/explorer/account/${token.creator}/transactions`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "inherit",
                          fontFamily: "monospace",
                          fontSize: "14px",
                        }}
                      >
                        {`${token.creator?.slice(
                          0,
                          4
                        )}...${token.creator?.slice(-4)}`}
                      </Link>
                      <ContentCopyIcon
                        sx={{
                          cursor: "pointer",
                          fontSize: "16px",
                          "&:hover": { opacity: 0.8 },
                        }}
                        onClick={() =>
                          copyToClipboard(token.creator, "Creator Address")
                        }
                      />
                    </Box>
                  </TableCell>
                )}
                <TableCell style={cellStyle} align="center">
                  <ActionButton
                    $isDarkTheme={isDarkTheme}
                    onClick={() => handleSwap(token.contractId)}
                    disabled={isLoadingPool}
                  >
                    {isLoadingPool ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <>
                        <SwapHorizIcon sx={{ fontSize: 20 }} />
                        <ButtonText>
                          <Typography variant="body2">Swap</Typography>
                        </ButtonText>
                      </>
                    )}
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {showPagination && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            color: isDarkTheme ? "#fff" : "inherit",
          }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isDarkTheme={isDarkTheme}
          />
        </Box>
      )}

      {selectedToken && (
        <TokenInfoModal
          open={showTokenInfo}
          onClose={() => setShowTokenInfo(false)}
          isDarkTheme={isDarkTheme}
          token={selectedToken}
        />
      )}
    </>
  );
};

export default TokenList;
