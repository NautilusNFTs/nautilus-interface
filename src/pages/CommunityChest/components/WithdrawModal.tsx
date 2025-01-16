import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import styled from 'styled-components';

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${props => props.$isDarkTheme ? 'rgb(23, 23, 23)' : 'rgb(255, 255, 255)'};
    color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
    border-radius: 24px;
    padding: 16px;
    border: 1px solid ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const StyledInput = styled(TextField)<{ $isDarkTheme: boolean }>`
  .MuiInputBase-root {
    color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
    background-color: ${props => props.$isDarkTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
    border-radius: 8px;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  }

  .MuiInputLabel-root {
    color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'} !important;
  }

  .MuiInputLabel-root.Mui-focused {
    color: ${props => props.$isDarkTheme ? '#90caf9' : '#1976d2'} !important;
  }
`;

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onWithdraw: (amount: string) => Promise<void>;
  amount: string;
  setAmount: (amount: string) => void;
  isLoading: boolean;
  isDarkTheme: boolean;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  open,
  onClose,
  onWithdraw,
  amount,
  setAmount,
  isLoading,
  isDarkTheme,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      $isDarkTheme={isDarkTheme}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Withdraw VOI
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <StyledInput
            fullWidth
            type="number"
            label="Amount to Withdraw"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            $isDarkTheme={isDarkTheme}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onWithdraw(amount)}
          disabled={isLoading || !amount}
          sx={{
            bgcolor: isDarkTheme ? '#90caf9' : '#1976d2',
            color: isDarkTheme ? '#000' : '#fff',
            '&:hover': {
              bgcolor: isDarkTheme ? '#64b5f6' : '#1565c0',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Withdraw'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default WithdrawModal; 