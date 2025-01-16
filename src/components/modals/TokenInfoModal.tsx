import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Link,
  CircularProgress,
} from "@mui/material";
import styled from "styled-components";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import axios from "axios";
import PieChartIcon from '@mui/icons-material/PieChart';
import TokenDistributionModal from './TokenDistributionModal';

interface TokenInfoModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  token: {
    contractId: number;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    creator: string;
    verified?: boolean;
  };
}

interface Balance {
  accountId: string;
  contractId: number;
  balance: string;
}

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${props => props.$isDarkTheme ? '#1a1a1a' : '#fff'};
    color: ${props => props.$isDarkTheme ? '#fff' : 'inherit'};
    border-radius: 24px;
    padding: 8px;
  }
`;

const StyledDialogTitle = styled(DialogTitle)<{ $isDarkTheme: boolean }>`
  color: ${props => props.$isDarkTheme ? '#fff' : 'inherit'};
  font-family: "Plus Jakarta Sans";
  font-weight: 600;
  text-align: center;
  padding: 24px 24px 0;
`;

const TokenIcon = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 16px;
`;

const InfoRow = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span<{ $isDarkTheme: boolean }>`
  color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  font-family: "Plus Jakarta Sans";
  font-size: 14px;
`;

const InfoValue = styled.div<{ $isDarkTheme: boolean }>`
  color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
  font-family: "IBM Plex Sans Condensed";
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenSymbol = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
  font-family: "Plus Jakarta Sans";
  font-size: 16px;
  font-weight: 500;
`;

const TokenInfoModal: React.FC<TokenInfoModalProps> = ({
  open,
  onClose,
  isDarkTheme,
  token,
}) => {
  const [holders, setHolders] = useState<number>(0);
  const [holdersList, setHoldersList] = useState<Array<any>>([]);
  const [isLoadingHolders, setIsLoadingHolders] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);

  useEffect(() => {
    const fetchHolders = async () => {
      if (!open) return;
      
      setIsLoadingHolders(true);
      try {
        const response = await axios.get(
          `https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/balances?includes=all&contractId=${token.contractId}`
        );
        
        // Filter out zero balances
        const nonZeroBalances = response.data.balances.filter(
          (balance: Balance) => Number(balance.balance) > 0
        );
        setHolders(nonZeroBalances.length);
        setHoldersList(nonZeroBalances);
      } catch (error) {
        console.error("Error fetching holders:", error);
        setHolders(0);
        setHoldersList([]);
      } finally {
        setIsLoadingHolders(false);
      }
    };

    fetchHolders();
  }, [open, token.contractId]);

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

  const formatHolders = (holders: number) => {
    return holders === 0 ? '-' : holders.toLocaleString();
  };

  return (
    <>
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        $isDarkTheme={isDarkTheme}
      >
        <StyledDialogTitle $isDarkTheme={isDarkTheme}>
          Token Information
        </StyledDialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            {token.verified && (
              <TokenIcon 
                src={`https://asset-verification.nautilus.sh/icons/${token.contractId}.gif`}
                alt={token.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const imgElement = e.currentTarget;
                  if (imgElement.src.endsWith('.gif')) {
                    imgElement.src = `https://asset-verification.nautilus.sh/icons/${token.contractId}.png`;
                  } else {
                    imgElement.style.display = 'none';
                  }
                }}
              />
            )}
            <Typography variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              {token.name}
              {token.verified && (
                <VerifiedUserIcon 
                  sx={{ 
                    fontSize: '20px',
                    color: isDarkTheme ? '#4CAF50' : '#2E7D32'
                  }} 
                />
              )}
            </Typography>
            <TokenSymbol $isDarkTheme={isDarkTheme}>
              {token.symbol}
            </TokenSymbol>
          </Box>

          <InfoRow $isDarkTheme={isDarkTheme}>
            <InfoLabel $isDarkTheme={isDarkTheme}>Contract ID</InfoLabel>
            <InfoValue $isDarkTheme={isDarkTheme}>
              <Link
                href={`https://block.voi.network/explorer/application/${token.contractId}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'inherit' }}
              >
                {token.contractId}
              </Link>
              <ContentCopyIcon
                sx={{ 
                  cursor: 'pointer', 
                  fontSize: '16px',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => copyToClipboard(token.contractId.toString(), "Contract ID")}
              />
            </InfoValue>
          </InfoRow>

          <InfoRow $isDarkTheme={isDarkTheme}>
            <InfoLabel $isDarkTheme={isDarkTheme}>Creator</InfoLabel>
            <InfoValue $isDarkTheme={isDarkTheme}>
              <Link
                href={`https://block.voi.network/explorer/account/${token.creator}/transactions`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'inherit' }}
              >
                {`${token.creator.slice(0, 6)}...${token.creator.slice(-6)}`}
              </Link>
              <ContentCopyIcon
                sx={{ 
                  cursor: 'pointer', 
                  fontSize: '16px',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => copyToClipboard(token.creator, "Creator Address")}
              />
            </InfoValue>
          </InfoRow>

          <InfoRow $isDarkTheme={isDarkTheme}>
            <InfoLabel $isDarkTheme={isDarkTheme}>Decimals</InfoLabel>
            <InfoValue $isDarkTheme={isDarkTheme}>{token.decimals}</InfoValue>
          </InfoRow>

          <InfoRow $isDarkTheme={isDarkTheme}>
            <InfoLabel $isDarkTheme={isDarkTheme}>Total Supply</InfoLabel>
            <InfoValue $isDarkTheme={isDarkTheme}>
              {formatTotalSupply(token.totalSupply, token.decimals)}
            </InfoValue>
          </InfoRow>

          <InfoRow $isDarkTheme={isDarkTheme}>
            <InfoLabel $isDarkTheme={isDarkTheme}>Holders</InfoLabel>
            <InfoValue $isDarkTheme={isDarkTheme}>
              {isLoadingHolders ? (
                <CircularProgress size={16} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {formatHolders(holders)}
                  {holders > 0 && (
                    <PieChartIcon
                      sx={{ 
                        cursor: 'pointer', 
                        fontSize: '20px',
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDistribution(true);
                      }}
                    />
                  )}
                </Box>
              )}
            </InfoValue>
          </InfoRow>
        </DialogContent>
      </StyledDialog>

      <TokenDistributionModal
        open={showDistribution}
        onClose={() => setShowDistribution(false)}
        isDarkTheme={isDarkTheme}
        holders={holdersList}
        totalSupply={token.totalSupply}
        decimals={token.decimals}
        symbol={token.symbol}
      />
    </>
  );
};

export default TokenInfoModal; 