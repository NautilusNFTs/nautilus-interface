import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokenSymbol: string;
  price: string;
  priceImpact: string;
  finalPrice: string | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  tokenSymbol,
  price,
  priceImpact,
  finalPrice,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: isDarkMode ? '#202020' : 'white',
          color: isDarkMode ? 'white' : 'inherit',
          borderRadius: '16px',
          padding: '16px',
          minWidth: '320px',
        }
      }}
    >
      <DialogTitle>Confirm Purchase</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to buy this NFT?
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Price
            </Typography>
            <Typography variant="h6">
              {price} {tokenSymbol}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          fullWidth
          sx={{ ml: 1 }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;