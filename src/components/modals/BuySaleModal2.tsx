import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface BuySaleModalProps {
  open: boolean;
  onClose: () => void;
  item: {
    price: number;
    totalStaked: number;
    currentBalance: number | null;
    isBalanceLoading: boolean;
    balanceError: string | null;
    // ... other item properties
  };
}

const BuySaleModal: React.FC<BuySaleModalProps> = ({ open, onClose, item }) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);

  const renderBalance = () => {
    if (item.isBalanceLoading) {
      return (
        <Skeleton
          variant="text"
          width={120}
          height={24}
          sx={{
            bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        />
      );
    }

    if (item.balanceError) {
      return (
        <Typography color="error" variant="body2">
          Error loading balance: {item.balanceError}
        </Typography>
      );
    }

    const balance = item.currentBalance ?? item.totalStaked;
    return (
      <Typography variant="body1">
        Current Balance: {(balance / 1e6).toFixed(6)} VOI
      </Typography>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkTheme ? "grey.900" : "background.paper",
          color: isDarkTheme ? "white" : "inherit",
        },
      }}
    >
      <DialogTitle>Confirm Purchase</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {renderBalance()}
          <Typography variant="body1" sx={{ mt: 1 }}>
            Price: {item.price / 1e6} VOI
          </Typography>
          {/* Add more details as needed */}
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: isDarkTheme ? 'grey.300' : 'text.secondary'
          }}
        >
          Are you sure you want to proceed with this purchase?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            // Handle purchase logic
            onClose();
          }}
          variant="contained"
          color="primary"
        >
          Confirm Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuySaleModal;
