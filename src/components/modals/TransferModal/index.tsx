import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  CircularProgress,
  Stack,
  InputLabel,
  Box,
  Typography,
} from "@mui/material";
import { getAlgorandClients } from "../../../wallets";
import { MListedNFTTokenI } from "../../../types";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import CartNftCard from "../../CartNFTCard";
import { useWallet } from "@txnlab/use-wallet-react";

interface AddressModalProps {
  open: boolean;
  loading: boolean;
  handleClose: () => void;
  onSave: (address: string, amount: string) => Promise<void>;
  title?: string;
  buttonText?: string;
  nfts: MListedNFTTokenI[];
}

const AddressModal: React.FC<AddressModalProps> = ({
  nfts,
  open,
  loading,
  handleClose,
  onSave,
  title = "Enter Address",
  buttonText = "Send",
}) => {
  const { activeAccount } = useWallet();
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState("");

  const handleSave = async () => {
    await onSave(address, amount);
    setAddress(""); // Clearing input after save
    handleClose();
  };

  useEffect(() => {
    if (!address) return;
    try {
      const { algodClient } = getAlgorandClients();
      algodClient
        .accountInformation(address)
        .do()
        .then((accountInfo: any) => {
          setBalance(
            (
              (accountInfo.amount - accountInfo["min-balance"]) /
              1e6
            ).toLocaleString()
          );
        })
        .catch((error: any) => {
          setBalance("");
          console.error(error);
        });
    } catch (error) {
      setBalance("");
      console.error(error);
    }
  }, [address]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="address-modal-title"
      aria-describedby="address-modal-description"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "40px",
          minHeight: "300px",
          minWidth: "400px",
          width: "50vw",
          borderRadius: "25px",
        }}
      >
        <h2 id="address-modal-title">{title}</h2>
        {!loading ? (
          <>
            <Box>
              <Grid2
                container
                spacing={2}
                sx={{
                  height: "300px",
                  overflow: "hidden",
                  overflowY: "scroll",
                }}
              >
                {nfts.map((t: MListedNFTTokenI) => (
                  <Grid2>
                    <CartNftCard token={t} size="small" imageOnly={true} />
                  </Grid2>
                ))}
              </Grid2>
            </Box>
            {/*<Box
              sx={{
                p: 5,
                mt: 2,
                border: "1px solid lightgray",
                borderRadius: "25px",
              }}
            >
              <InputLabel htmlFor="address-from">Recipient Address</InputLabel>
              <TextField
                id="address-from"
                label="Address"
                variant="outlined"
                value={activeAccount?.address}
                fullWidth
                disabled
                margin="normal"
              />
            </Box>*/}
            <Box
              sx={{
                //p: 5,
                mt: 2,
                //border: "1px solid lightgray",
                // borderRadius: "25px",
              }}
            >
              {/*<InputLabel htmlFor="address-input">Recipient Address</InputLabel>*/}
              <TextField
                id="address-input"
                label="Recipient Address"
                variant="outlined"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
                margin="normal"
              />
              {balance ? <div>Avilable Balance: {balance} VOI</div> : null}
              {balance && address && Number(balance) < 1 ? (
                <>
                  <Typography color="error">
                    Recipient available balance less than 1 VOI
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <InputLabel htmlFor="amount-input">
                      Additional Amount (VOI)
                    </InputLabel>
                    <TextField
                      id="amount-input"
                      label="Amount"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Box>
                </>
              ) : null}
            </Box>
            <Stack sx={{ mt: 3 }} gap={2}>
              <Button
                size="large"
                fullWidth
                variant="contained"
                onClick={handleSave}
              >
                {buttonText}
              </Button>
              <Button
                size="large"
                fullWidth
                variant="outlined"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Stack>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <CircularProgress size={200} />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddressModal;
