import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import styled from "styled-components";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  balance: string;
  stakingBalance?: string;
  isLoading?: boolean;
  onWithdraw: (includeStaking: boolean) => void;
}

const BigBalanceDisplay = styled.div<{ $isDarkTheme: boolean }>`
  font-family: "IBM Plex Sans Condensed";
  font-size: 48px;
  font-weight: 600;
  text-align: center;
  margin: 32px 0;
  color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
`;

const StakingBalanceDisplay = styled.div<{ $isDarkTheme: boolean }>`
  font-family: "IBM Plex Sans Condensed";
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 32px;
  color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
`;

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

const StyledDialogContent = styled(DialogContent)`
  padding: 0 24px;
`;

const StyledDialogActions = styled(DialogActions)`
  padding: 16px 24px 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const ActionButton = styled(Button)<{ $isDarkTheme: boolean; $variant: 'cancel' | 'confirm' }>`
  border-radius: 12px;
  padding: 8px 24px;
  font-family: "Plus Jakarta Sans";
  font-weight: 600;
  text-transform: none;
  min-width: 120px;
  
  ${props => props.$variant === 'cancel' && `
    background-color: ${props.$isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props.$isDarkTheme ? '#fff' : 'inherit'};
    &:hover {
      background-color: ${props.$isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
    }
  `}
  
  ${props => props.$variant === 'confirm' && `
    background-color: #2958FF;
    color: white;
    &:hover {
      background-color: #1D45E3;
    }
  `}
`;

const StyledCheckbox = styled(Checkbox)<{ $isDarkTheme: boolean }>`
  &.MuiCheckbox-root {
    color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  }
  &.Mui-checked {
    color: ${props => props.$isDarkTheme ? '#4CAF50' : '#2E7D32'};
  }
`;

const CheckboxLabel = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  font-family: "Plus Jakarta Sans";
  font-size: 14px;
`;

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  open,
  onClose,
  isDarkTheme,
  balance,
  stakingBalance = "0",
  isLoading = false,
  onWithdraw,
}) => {
  const [includeStaking, setIncludeStaking] = React.useState(true);
  const totalBalance = includeStaking 
    ? (Number(balance) + Number(stakingBalance)).toString()
    : balance;

  const handleWithdraw = () => {
    onWithdraw(includeStaking);
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      $isDarkTheme={isDarkTheme}
    >
      <StyledDialogTitle $isDarkTheme={isDarkTheme}>
        Withdrawable Balance
      </StyledDialogTitle>
      <StyledDialogContent>
        <BigBalanceDisplay $isDarkTheme={isDarkTheme}>
          {totalBalance} VOI
        </BigBalanceDisplay>
        {Number(stakingBalance) > 0 && (
          <>
            <FormControlLabel
              control={
                <StyledCheckbox
                  checked={includeStaking}
                  onChange={(e) => setIncludeStaking(e.target.checked)}
                  $isDarkTheme={isDarkTheme}
                />
              }
              label={
                <CheckboxLabel $isDarkTheme={isDarkTheme}>
                  Include staking rewards ({stakingBalance} VOI)
                </CheckboxLabel>
              }
            />
            {includeStaking && (
              <StakingBalanceDisplay $isDarkTheme={isDarkTheme}>
                Including {stakingBalance} VOI from staking contracts
              </StakingBalanceDisplay>
            )}
          </>
        )}
      </StyledDialogContent>
      <StyledDialogActions>
        <ActionButton
          onClick={onClose}
          disabled={isLoading}
          $isDarkTheme={isDarkTheme}
          $variant="cancel"
        >
          Cancel
        </ActionButton>
        <ActionButton
          onClick={handleWithdraw}
          disabled={isLoading || Number(totalBalance) === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
          $isDarkTheme={isDarkTheme}
          $variant="confirm"
        >
          {isLoading ? "Withdrawing..." : "Withdraw"}
        </ActionButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default WithdrawModal; 