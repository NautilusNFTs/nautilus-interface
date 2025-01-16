import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Link,
} from "@mui/material";

interface TransactionDetailsProps {
  id: string;
  show: boolean;
  onClose: () => void;
  msg?: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  id,
  show,
  onClose,
  msg,
}) => {
  return (
    <Dialog open={show} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transaction Details</DialogTitle>
      <DialogContent>
        {msg && (
          <Typography variant="body1" gutterBottom>
            {msg}
          </Typography>
        )}
        <Typography variant="body2">
          Transaction ID:{" "}
          <Link
            href={`https://voi.observer/explorer/transaction/${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {id}
          </Link>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetails; 