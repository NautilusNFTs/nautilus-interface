import React from "react";
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
  DialogContentText,
} from "@mui/material";
import styled from "styled-components";

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgb(23, 23, 23)" : "rgb(255, 255, 255)"};
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    border-radius: 24px;
    padding: 16px;
    border: 1px solid
      ${(props) =>
        props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  }
`;

const StyledInput = styled(TextField)<{ $isDarkTheme: boolean }>`
  .MuiInputBase-root {
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)"};
    border-radius: 8px;
  }

  .MuiInputBase-input {
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")} !important;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
  }

  .MuiInputLabel-root {
    color: ${(props) =>
      props.$isDarkTheme
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.6)"} !important;
  }

  .MuiInputLabel-root.Mui-focused {
    color: ${(props) =>
      props.$isDarkTheme ? "#90caf9" : "#1976d2"} !important;
  }
`;

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onDeposit: (amount: string) => Promise<void>;
  amount: string;
  setAmount: (amount: string) => void;
  isLoading: boolean;
  isDarkTheme: boolean;
}

const DepositModal: React.FC<DepositModalProps> = ({
  open,
  onClose,
  onDeposit,
  amount,
  setAmount,
  isLoading,
  isDarkTheme,
}) => {
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleDepositClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDeposit = async () => {
    setShowConfirmation(false);
    await onDeposit(amount);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
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
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Deposit VOI
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              my: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={100} />
                <Typography
                  variant="h6"
                  sx={{ color: isDarkTheme ? "#fff" : "inherit" }}
                >
                  Signature pending...
                </Typography>
              </Box>
            ) : (
              <StyledInput
                fullWidth
                type="number"
                label="Amount to Deposit"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                $isDarkTheme={isDarkTheme}
                sx={{
                  "& .MuiInputBase-input": {
                    color: isDarkTheme ? "#FFFFFF" : "inherit",
                  },
                  "& .MuiInputLabel-root": {
                    color: isDarkTheme ? "rgba(255, 255, 255, 0.7)" : undefined,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: isDarkTheme
                        ? "rgba(255, 255, 255, 0.23)"
                        : undefined,
                    },
                    "&:hover fieldset": {
                      borderColor: isDarkTheme
                        ? "rgba(255, 255, 255, 0.4)"
                        : undefined,
                    },
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDepositClick}
            disabled={isLoading || !amount}
            sx={{
              bgcolor: isDarkTheme ? "#90caf9" : "#1976d2",
              color: isDarkTheme ? "#000" : "#fff",
              "&:hover": {
                bgcolor: isDarkTheme ? "#64b5f6" : "#1565c0",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: isDarkTheme ? "#000" : "#fff",
                }}
              />
            ) : (
              "Deposit"
            )}
          </Button>
        </DialogActions>
      </StyledDialog>

      <StyledDialog
        sx={{
          "& .MuiDialog-paper": {
            minHeight: "260px",
            overflowY: "auto",
          },
        }}
        open={showConfirmation}
        onClose={handleCancelConfirmation}
        maxWidth="sm"
        fullWidth
        $isDarkTheme={isDarkTheme}
      >
        <DialogTitle>Confirm Deposit</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: isDarkTheme ? "#fff" : "inherit" }}>
            Are you sure you want to deposit {amount} VOI?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmDeposit}
            sx={{
              bgcolor: isDarkTheme ? "#90caf9" : "#1976d2",
              color: isDarkTheme ? "#000" : "#fff",
              "&:hover": {
                bgcolor: isDarkTheme ? "#64b5f6" : "#1565c0",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </StyledDialog>
    </>
  );
};

export default DepositModal;
