import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  CircularProgress,
  Stack,
  InputLabel,
  Box,
  Grid,
  FormControl,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Fade,
  Divider,
} from "@mui/material";
import PaymentCurrencyRadio, {
  defaultCurrencies,
} from "../../PaymentCurrencyRadio";
import { collections } from "../../../contants/games";
import axios from "axios";
import { Token } from "@mui/icons-material";
import TokenSelect from "../../TokenSelect";
import RoyaltyCheckbox from "../../checkboxes/RoyaltyCheckbox";
import { TokenType } from "../../../types";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { formatter } from "../../../utils/number";
import CartNftCard from "../../CartNFTCard";
import { useWallet } from "@txnlab/use-wallet-react";
import { get } from "http";
import { getAlgorandClients } from "@/wallets";
import { abi, CONTRACT } from "ulujs";
import algosdk from "algosdk";
import { useStakingContract } from "@/hooks/staking";
import { zeroAddress } from "@/contants/accounts";

interface MultipleSelectNativeProps {
  options: any[];
  onChange: (newValue: any) => void;
}
function MultipleSelectNative(props: MultipleSelectNativeProps) {
  const [contractId, setContractId] = React.useState<string[]>([]);
  const handleChangeMultiple = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { options } = event.target;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setContractId(value);
    props.onChange(value);
  };

  return (
    <div>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel shrink htmlFor="select-multiple-native">
          Contract Id
        </InputLabel>
        <Select<string[]>
          multiple
          native
          value={contractId}
          // @ts-ignore Typings are not considering `native`
          onChange={handleChangeMultiple}
          label="Contract Id"
          inputProps={{
            id: "select-multiple-native",
          }}
        >
          {props.options.map((option: any) => (
            <option key={option.contractId} value={option.contractId}>
              {option.contractId}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

interface MintModalProps {
  open: boolean;
  loading: boolean;
  handleClose: () => void;
  onSave: (address: string, amount: string, token: any) => Promise<void>;
  title?: string;
  buttonText?: string;
  image: string;
  accounts: any[];
  collectionId: number;
}

const MintModal: React.FC<MintModalProps> = ({
  open,
  loading,
  handleClose,
  onSave,
  accounts,
  image,
  title = "Enter Address",
  buttonText = "List for Sale",
  collectionId,
}) => {
  const { activeAccount, signTransactions } = useWallet();
  const [contractId, setContractId] = useState("");
  const handleChange = (newValue: any) => {
    setContractId(newValue[0]);
  };
  useEffect(() => {
    const selected = accounts.find(
      (el) => el.contractId === Number(contractId)
    );
    if (!selected) return;
    const { global_delegate, global_owner } = selected;
    if (global_delegate !== zeroAddress) {
      setValue(global_delegate);
    } else {
      setValue(global_owner);
    }
  }, [contractId]);

  /* Modal */

  const handleMint = async () => {
    if (!activeAccount) return;
    const { algodClient, indexerClient } = getAlgorandClients();
    const apid = Number(collectionId);
    const to = activeAccount.address;
    const tokenId = Number(contractId);
    const ci = new CONTRACT(apid, algodClient, indexerClient, abi.custom, {
      addr: activeAccount.address,
      sk: new Uint8Array(0),
    });
    const builder = {
      arc72: new CONTRACT(
        apid,
        algodClient,
        indexerClient,
        {
          name: "OSARC72Token",
          methods: [
            {
              name: "mint",
              args: [
                {
                  type: "address",
                  name: "to",
                },
                {
                  type: "uint64",
                  name: "tokenId",
                },
                {
                  type: "address",
                  name: "delegate",
                },
              ],
              readonly: false,
              returns: {
                type: "uint256",
              },
              desc: "Mint a new NFT",
            },
          ],
          events: [],
        },
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        },
        true,
        false,
        true
      ),
      ownable: new CONTRACT(
        tokenId,
        algodClient,
        indexerClient,
        {
          name: "Ownable",
          methods: [
            {
              name: "transfer",
              args: [
                {
                  type: "address",
                  name: "new_owner",
                },
              ],
              readonly: false,
              returns: {
                type: "void",
              },
            },
          ],
          events: [],
        },
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        },
        true,
        false,
        true
      ),
    };
    const buildN = [];
    const txnO = (
      await builder.ownable.transfer(algosdk.getApplicationAddress(apid))
    ).obj;
    console.log({ transfer: txnO });
    buildN.push({
      ...txnO,
    });
    const delegate =
      value2 === "option1"
        ? value
        : "7REOQMRXHEFIETBIRWXJS7ZE6X7FZCNYPK7GFQMRRZE6NVZT426U7ZESQ4";
    const txn1 = (await builder.arc72.mint(to, tokenId, delegate)).obj;
    const note1 = new TextEncoder().encode(
      `mint to: ${to} tokenId: ${tokenId} delegate: ${delegate}`
    );
    console.log({ mint: txn1 });
    buildN.push({
      ...txn1,
      payment: 336700 + 100 * 1e6,
      note: note1,
    });
    ci.setFee(3000);
    ci.setEnableGroupResourceSharing(true);
    ci.setExtraTxns(buildN);
    const customR = await ci.custom();
    console.log({ customR });
    if (customR.success) {
      await signTransactions(
        customR.txns.map(
          (t: string) => new Uint8Array(Buffer.from(t, "base64"))
        )
      )
        .then((stxns: any) =>
          algodClient.sendRawTransaction(stxns as Uint8Array[]).do()
        )
        .then(() => handleClose());
    }
  };

  const onClose = () => {
    handleClose();
    reset();
  };

  const reset = () => {
    setContractId("");
    setStep(0);
    setValue("");
  };

  const [step, setStep] = useState<number>(0);

  // delegate

  const [value, setValue] = useState("");
  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // radio
  const [value2, setValue2] = React.useState("option1");
  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue2((event.target as HTMLInputElement).value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
        {step === 0 ? <Typography variant="h5">{title}</Typography> : null}
        {!loading ? (
          <Box sx={{ mt: 1 }}>
            {step === 0 ? (
              <Grid container spacing={2}>
                {/*<Grid item xs={12}>
                  <Typography variant="h5">Step 1: Select Contract</Typography>
                  <Typography variant="body2">
                    Select the staking contract you owned that you would like to
                    mint as a NFT. See Contract Details below for more
                    information and confirm before proceeding.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <img
                    src="https://prod.cdn.highforge.io/i/ipfs%3A%2F%2FQmVbGFgCgeW9mMBHHRmTY5TPA3kVLxFHpb2ztP3GArzzEQ%23arc3?w=400"
                    alt="NFT"
                    style={{ width: "100%", borderRadius: "25px" }}
                  />
                </Grid>*/}
                <Grid item xs={12}>
                  <MultipleSelectNative
                    options={accounts}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Contract Details</Typography>
                </Grid>
                {accounts
                  .filter((el) => el.contractId === Number(contractId))
                  .map((el) => (
                    <Grid item xs={12}>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Contract Id</TableCell>
                            <TableCell align="right">
                              <a
                                href={`https://explorer.voi.network/explorer/application/${el.contractId}/transactions`}
                                target="_blank"
                              >
                                {el.contractId}
                              </a>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Contract Address</TableCell>
                            <TableCell align="right">
                              <a
                                href={`https://explorer.voi.network/explorer/account/${el.contractAddress}/transactions`}
                                target="_blank"
                              >
                                {el.contractAddress.slice(0, 10)}...
                                {el.contractAddress.slice(-10)}
                              </a>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Stake Amount</TableCell>
                            <TableCell align="right">
                              {formatter.format(el.global_initial / 10 ** 6)}{" "}
                              VOI
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Tokens</TableCell>
                            <TableCell align="right">
                              {formatter.format(el.global_initial / 10 ** 6)}{" "}
                              VOI
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Lockup</TableCell>
                            <TableCell align="right">
                              {el.global_period > 5
                                ? `${el.global_period + 1} mo`
                                : `${el.global_period} yrs`}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Vesting</TableCell>
                            <TableCell align="right">
                              {el.global_period > 5
                                ? `${Math.min(12, el.global_period)} mo`
                                : `12 mo`}
                            </TableCell>
                          </TableRow>
                          {el.global_delegate !== zeroAddress ? (
                            <TableRow>
                              <TableCell>Delegate</TableCell>
                              <TableCell align="right">
                                {el.global_delegate.slice(0, 10)}...
                                {el.global_delegate.slice(-10)}
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </Grid>
                  ))}
              </Grid>
            ) : null}
            {step === 1 ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5">
                    Step 2: Choose How to Earn Block Rewards
                  </Typography>
                  {/*<Typography variant="body2">
                    Set the address that can be used to renew keys to produce
                    blocks.
                  </Typography>*/}
                </Grid>
                {/*<Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: "20px",
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    <Typography variant="h6">Stake on your own node</Typography>
                    <Typography variant="body2">
                      Choose to stake on your own node by providing the same
                      address as the contract owner or a different address of
                      your choosing.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: "20px",
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    <Typography variant="h6">Use Node as a Service</Typography>
                    <Typography variant="body2">
                      In addition, you may optin for node as a service to the
                      staking contract managed for you. In this case there is a
                      10% fee on all rewards withdrawn.
                    </Typography>
                  </Paper>
                </Grid>*/}
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Choose an option</FormLabel>
                    <RadioGroup
                      aria-label="options"
                      name="radio-buttons-group"
                      value={value2}
                      onChange={handleChange2}
                    >
                      <FormControlLabel
                        value="option2"
                        control={<Radio />}
                        label="Use Node as a Service"
                      />
                      <Fade in={value2 === "option2"}>
                        <Typography variant="body2">
                          You may optin for node as a service to the staking
                          contract managed for you. In this case, there is only
                          a fee if you have block rewards. In this plan there is
                          a 10% fee on all rewards withdrawn.
                        </Typography>
                      </Fade>
                      <FormControlLabel
                        value="option1"
                        control={<Radio />}
                        label="Stake on your own node"
                      />
                      <Fade in={value2 === "option1"}>
                        <Typography variant="body2">
                          Choose to stake on your own node by providing the same
                          address as the contract owner or a different address
                          of your choosing. No fees apply in this plan.
                        </Typography>
                      </Fade>
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Fade in={value2 === "option1"}>
                    <Stack gap={1}>
                      <InputLabel htmlFor="delegation">Delegate</InputLabel>
                      <TextField
                        id="delegate"
                        label="Enter text"
                        variant="outlined" // You can change it to 'filled' or 'standard' for different styles
                        value={value}
                        onChange={handleChangeValue}
                        fullWidth // Takes the full width of the container
                        margin="normal" // Adds some margin
                      />
                    </Stack>
                  </Fade>
                </Grid>
              </Grid>
            ) : null}
            {step === 2 ? (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h5">Step 3: Confirm</Typography>
                  {/*
                  <Typography variant="body2">
                    Confirm the details below before proceeding.
                  </Typography>
                  */}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Contract Details</Typography>
                </Grid>
                {accounts
                  .filter((el) => el.contractId === Number(contractId))
                  .map((el) => (
                    <Grid item xs={12}>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Contract Id</TableCell>
                            <TableCell align="right">
                              <a
                                href={`https://explorer.voi.network/explorer/application/${el.contractId}/transactions`}
                                target="_blank"
                              >
                                {el.contractId}
                              </a>
                            </TableCell>
                          </TableRow>
                          {/*
                          <TableRow>
                            <TableCell>Contract Address</TableCell>
                            <TableCell align="right">
                              <a
                                href={`https://explorer.voi.network/explorer/account/${el.contractAddress}/transactions`}
                                target="_blank"
                              >
                                {el.contractAddress.slice(0, 10)}...
                                {el.contractAddress.slice(-10)}
                              </a>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Stake Amount</TableCell>
                            <TableCell align="right">
                              {formatter.format(el.global_initial / 10 ** 6)}{" "}
                              VOI
                            </TableCell>
                          </TableRow>
                          */}
                          <TableRow>
                            <TableCell>Total Tokens</TableCell>
                            <TableCell align="right">
                              {formatter.format(el.global_total / 10 ** 6)} VOI
                            </TableCell>
                          </TableRow>
                          {/*
                          <TableRow>
                            <TableCell>Lockup</TableCell>
                            <TableCell align="right">
                              {el.global_period > 5
                                ? `${el.global_period + 1} mo`
                                : `${el.global_period} yrs`}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Vesting</TableCell>
                            <TableCell align="right">
                              {el.global_period > 5
                                ? `${Math.min(12, el.global_period)} mo`
                                : `12 mo`}
                            </TableCell>
                          </TableRow>*/}
                        </TableBody>
                      </Table>
                    </Grid>
                  ))}
                <Grid item xs={12}>
                  <Typography variant="h6">Stake Delgation</Typography>
                </Grid>
                {value2 === "option1" ? (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "green" }}
                    >
                      Stake on your own node
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Delegate address</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <a
                              href={`https://explorer.voi.network/explorer/account/${value}/transactions`}
                              target="_blank"
                            >
                              {value.slice(0, 10)}...
                              {value.slice(-10)}
                            </a>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                ) : null}
                {value2 === "option2" ? (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "green" }}
                    >
                      Node as a Service
                    </Typography>
                    <Typography variant="body2">
                      Using Node as a Service will incur a 10% fee on all
                      rewards withdrawn.
                    </Typography>
                  </Grid>
                ) : null}
                {/*<Grid item xs={12}>
                  <Typography variant="h6">Acknowledgement</Typography>
                  <Typography variant="body2">
                    I understand that by minting this contract as an NFT, I am
                    transferring ownership of the contract to the NFT. I am
                    responsible for the contract and its contents.
                  </Typography>
                  <Typography variant="body2">
                    I understand that by minting this contract as an NFT, the
                    contract may be taken offline due to poor performance or
                    other reasons.
                  </Typography>
                  <Typography variant="body2">
                    I understand that by minting this contract as an NFT, block
                    rewards are not guarenteed.
                  </Typography>
                </Grid>*/}
                <Grid item xs={12}>
                  <Typography variant="h6">Cost Breakdown</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Transaction Fee</TableCell>
                        <TableCell align="right"> {7000 / 1e6} VOI</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Storage Cost</TableCell>
                        <TableCell align="right"> {336700 / 1e6} VOI</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Mint Cost</TableCell>
                        <TableCell align="right"> 100 VOI</TableCell>
                      </TableRow>
                      <TableRow sx={{ fontWeight: 900 }}>
                        <TableCell>
                          <strong>Total Cost</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{(336700 + 7000) / 1e6 + 100} VOI</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            ) : null}

            <Divider sx={{ mt: 3 }} />
            {step < 2 ? (
              <Stack sx={{ mt: 1 }} gap={1}>
                {step > 0 ? (
                  <Button
                    size="large"
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setStep(step - 1);
                    }}
                  >
                    Back
                  </Button>
                ) : null}
                <Button
                  size="large"
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  disabled={contractId === ""}
                  size="large"
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setStep(step + 1);
                  }}
                >
                  Next
                </Button>
              </Stack>
            ) : null}
            {step === 2 ? (
              <Stack sx={{ mt: 3 }} gap={2}>
                <Button
                  size="large"
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setStep(step - 1);
                  }}
                >
                  Back
                </Button>
                <Button
                  size="large"
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  disabled={contractId === ""}
                  size="large"
                  fullWidth
                  variant="contained"
                  onClick={handleMint}
                >
                  {buttonText}
                </Button>
              </Stack>
            ) : null}
          </Box>
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

export default MintModal;
