import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { getStakingTotalTokens } from "@/utils/staking";

interface PositionSummaryProps {
  stakingContracts: any[] | undefined;
  arc72Tokens: any[] | undefined;
  isDarkTheme: boolean;
}

const PositionSummary: React.FC<PositionSummaryProps> = ({
  stakingContracts,
  arc72Tokens,
  isDarkTheme,
}) => {
  const numStakingContracts = stakingContracts?.length || 0;
  const numTokens = arc72Tokens?.length || 0;

  console.log({ stakingContracts, arc72Tokens });

  const totalStaked = arc72Tokens
    ?.map((token) => token.staking)
    ?.reduce((total, staking) => {
      return total + Number(getStakingTotalTokens(staking));
    }, 0);
  const totalStaked2 =
    stakingContracts?.reduce((total, contract) => {
      return total + Number(getStakingTotalTokens(contract));
    }, 0) || 0;

  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "16px",
        border: "2px solid",
        borderColor: isDarkTheme ? "white" : "divider",
        color: isDarkTheme ? "white" : "inherit",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Position Summary
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body1">
            Number of Staking Contracts: {numStakingContracts}
          </Typography>
          <Typography variant="body1">Number of Tokens: {numTokens}</Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: "transparent",
            color: isDarkTheme ? "#FFF" : "#000",
            p: 2,
            borderRadius: "12px",
            textAlign: "center",
            border: "none",
          }}
        >
          <Typography variant="h5">
            {(totalStaked + totalStaked2).toFixed(2)} VOI
          </Typography>
          <Typography variant="body2">Total Stake</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PositionSummary;
