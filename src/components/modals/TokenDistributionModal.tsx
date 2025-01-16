import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
} from "@mui/material";
import styled from "styled-components";
import { PieChart } from "react-minimal-pie-chart";

interface TokenDistributionModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  holders: Array<{
    accountId: string;
    balance: string;
  }>;
  totalSupply: string;
  decimals: number;
  symbol: string;
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

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
`;

const LegendItem = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$isDarkTheme ? '#fff' : 'inherit'};
  font-family: "IBM Plex Sans Condensed";
  font-size: 14px;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.$color};
`;

const TokenDistributionModal: React.FC<TokenDistributionModalProps> = ({
  open,
  onClose,
  isDarkTheme,
  holders,
  totalSupply,
  decimals,
  symbol,
}) => {
  const totalSupplyNum = Number(totalSupply) / Math.pow(10, decimals);
  
  // Sort holders by balance and get top 10
  const topHolders = [...holders]
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, 10);

  // Calculate percentages and prepare data for pie chart
  const data = topHolders.map((holder, index) => {
    const balance = Number(holder.balance) / Math.pow(10, decimals);
    const percentage = (balance / totalSupplyNum) * 100;
    return {
      title: `${holder.accountId.slice(0, 4)}...${holder.accountId.slice(-4)}`,
      value: percentage,
      color: `hsl(${(index * 360) / topHolders.length}, 70%, 50%)`,
    };
  });

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      $isDarkTheme={isDarkTheme}
    >
      <StyledDialogTitle $isDarkTheme={isDarkTheme}>
        {symbol} Token Distribution
      </StyledDialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', height: 300 }}>
          <PieChart
            data={data}
            lineWidth={20}
            paddingAngle={2}
            rounded
            label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
            labelStyle={{
              fontSize: '6px',
              fontFamily: 'IBM Plex Sans Condensed',
              fill: isDarkTheme ? '#fff' : '#000',
            }}
            labelPosition={80}
          />
        </Box>
        <LegendContainer>
          {data.map((item) => (
            <LegendItem key={item.title} $isDarkTheme={isDarkTheme}>
              <LegendColor $color={item.color} />
              <span>{item.title}</span>
            </LegendItem>
          ))}
        </LegendContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default TokenDistributionModal; 