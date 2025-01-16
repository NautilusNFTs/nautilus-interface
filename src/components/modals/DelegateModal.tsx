import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useWallet } from "@txnlab/use-wallet-react";
import { CONTRACT } from "ulujs";
import { getAlgorandClients } from "@/wallets";
import { waitForConfirmation } from "algosdk";
import { toast } from "react-toastify";

const { algodClient } = getAlgorandClients();

interface DelegateModalProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  tokenId?: string;
  currentDelegate: string;
  allowNaaS?: boolean;
  naaSAddress?: string;
}

type DelegateOption = "own" | "service";

const DelegateModal: React.FC<DelegateModalProps> = ({
  open,
  onClose,
  contractId,
  tokenId,
  currentDelegate,
  allowNaaS = false,
  naaSAddress = "",
}) => {
  const [delegateOption, setDelegateOption] = useState<DelegateOption>("own");
  const [delegateAddress, setDelegateAddress] = useState(currentDelegate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeAccount, signTransactions } = useWallet();

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option = event.target.value as DelegateOption;
    setDelegateOption(option);
    if (option === "service") {
      setDelegateAddress(naaSAddress);
    } else {
      setDelegateAddress(currentDelegate);
    }
  };

  const handleSubmit = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsSubmitting(true);

    try {
      const ci = new CONTRACT(
        Number(contractId),
        algodClient,
        undefined,
        {
          name: "NautilusVoiStaking",
          methods: [
            {
              name: "set_remote_delegate",
              args: [
                { type: "address", name: "delegate_to" },
                { type: "uint64", name: "token_id" },
              ],
              returns: { type: "void" },
              readonly: false,
            },
            {
              name: "set_delegate",
              args: [{ type: "address", name: "delegate_to" }],
              returns: { type: "void" },
              readonly: false,
            },
          ],
          events: [],
        },
        { addr: activeAccount.address, sk: new Uint8Array(0) }
      );

      ci.setFee(2000);

      const set_delegateR = allowNaaS
        ? await ci.set_remote_delegate(delegateAddress, tokenId)
        : await ci.set_delegate(delegateAddress);

      if (!set_delegateR.success) {
        throw new Error("Delegate failed in simulate");
      }

      const stxns = await signTransactions(
        set_delegateR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );

      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();

      await waitForConfirmation(algodClient, txId, 4);

      toast.success("Successfully updated delegate address");
      onClose();
    } catch (error) {
      console.error("Error setting delegate:", error);
      toast.error("Failed to set delegate address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Set Delegate Address</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {allowNaaS ? (
            <FormControl component="fieldset">
              <RadioGroup value={delegateOption} onChange={handleOptionChange}>
                <FormControlLabel
                  value="service"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Node as a Service</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Delegate to our trusted node service provider
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="own"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">
                        Stake on your own Node
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Set a custom delegate address for your own node
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          ) : null}

          {(!allowNaaS || delegateOption === "own") && (
            <>
              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                Current delegate: {currentDelegate}
              </Typography>
              <TextField
                fullWidth
                label="New Delegate Address"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                margin="normal"
                variant="outlined"
                disabled={isSubmitting}
              />
            </>
          )}

          {allowNaaS && delegateOption === "service" && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              Your stake will be delegated to our Node as a Service provider at
              address: {naaSAddress}. <br />
              There is no cost to delegate to the NAAS, but service fee will be
              deducted from your rewards. (Current service fee: 10%)
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!delegateAddress || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? "Updating..." : "Update Delegate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DelegateModal;
