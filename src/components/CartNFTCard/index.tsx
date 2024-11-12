import React from "react";
import styled from "styled-components";
import { Avatar, Box, Stack, Tooltip } from "@mui/material";
import { stringToColorCode } from "../../utils/string";
import VoiIcon from "../../static/crypto-icons/voi/0.svg";
import ViaIcon from "../../static/crypto-icons/voi/6779767.svg";
import { ListedToken } from "../../types";
import { useNavigate } from "react-router-dom";
import BuySaleModal from "../modals/BuySaleModal";
import { toast } from "react-toastify";
import { useWallet } from "@txnlab/use-wallet";
import algosdk from "algosdk";
import { getAlgorandClients } from "../../wallets";
import { CONTRACT, arc200 } from "ulujs";
import { ctcInfoMp206 } from "../../contants/mp";

const CollectionName = styled.div`
  color: var(--White, #fff);
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px; /* 120% */
`;

const CollectionVolume = styled.div`
  color: var(--White, #fff);
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 140%; /* 22.4px */
`;

const NFTCardWrapper = styled.div`
  align-items: center;
  background: linear-gradient(
    180deg,
    rgb(245, 211, 19) 0%,
    rgb(55, 19, 18) 100%
  );
  //background-color: rgba(255, 255, 255, 1);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.1s ease;
  //height: 481px;
  //width: 305px;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    transform: scale(1.05);
  }
  & .image {
    align-self: stretch;
    //height: 305px;
    position: relative;
    width: 100%;
    height: 200px;
  }

  & .NFT-info {
    -webkit-backdrop-filter: blur(200px) brightness(100%);
    align-items: flex-start;
    align-self: stretch;
    backdrop-filter: blur(200px) brightness(100%);
    /*background-color: #20202066;*/
    border-radius: 0px 0px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    //height: 176px;
    padding: 20px 30px 25px;
    position: relative;
    width: 100%;
    height: 150px;
  }

  & .frame {
    align-items: center;
    align-self: stretch;
    display: flex;
    flex: 0 0 auto;
    gap: 25px;
    position: relative;
    width: 100%;
  }

  & .artist-avatar-name-wrapper {
    align-items: center;
    display: flex;
    flex: 1;
    flex-grow: 1;
    gap: 10px;
    justify-content: space-around;
    position: relative;
  }

  & .artist-avatar-name {
    align-items: center;
    display: flex;
    flex: 1;
    flex-grow: 1;
    gap: 10px;
    position: relative;
  }

  & .avatar-instance {
    background-image: url(./avatar.svg) !important;
    height: 24px !important;
    position: relative !important;
    width: 24px !important;
  }

  & .text-wrapper {
    color: white;
    flex: 1;
    position: relative;
    font-family: Inter;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: left;
  }

  & .highest-bid {
    align-items: center;
    display: flex;
    flex: 1;
    flex-grow: 1;
    gap: 16px;
    justify-content: flex-end;
    position: relative;
  }

  & .div {
    align-items: center;
    background-color: #ffffff33;
    border-radius: 100px;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 10px;
    justify-content: flex-end;
    padding: 6px;
    position: relative;
  }

  & .icon-instance-node {
    height: 24px !important;
    position: relative !important;
    width: 24px !important;
  }

  & .artst-info {
    align-items: flex-start;
    align-self: stretch;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 5px;
    position: relative;
    width: 100%;
  }

  & .text-wrapper-2 {
    align-self: stretch;
    color: white;
    line-height: 24px;
    margin-top: -1px;
    position: relative;
    font-family: Inter, Helvetica;
    font-size: 20px;
    font-weight: 800;
    line-height: 24px;
    letter-spacing: 0em;
    text-align: left;
  }

  & .additional-info {
    align-items: flex-end;
    align-self: stretch;
    display: flex;
    flex: 0 0 auto;
    justify-content: flex-end;
    position: relative;
    width: 100%;
  }

  & .price {
    align-items: flex-start;
    display: flex;
    flex: 1;
    flex-direction: column;
    flex-grow: 1;
    gap: 8px;
    padding: 0px 21px 0px 0px;
    position: relative;
  }

  & .text-wrapper-3 {
    align-self: stretch;
    color: #ffffff;
    font-family: Inter, Helvetica;
    margin-top: -1px;
    position: relative;
    font-family: Inter;
    font-size: 14px;
    font-weight: 400;
    line-height: 15px;
    letter-spacing: 0em;
    text-align: left;
  }

  & .text-wrapper-4 {
    display: flex;
    align-items: center;
    gap: 5px;
    align-self: stretch;
    color: white;
    position: relative;
    font-family: monospace;
    font-size: 18px;
    font-weight: 700;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
  }
`;

interface NFTCardProps {
  listedNft: ListedToken;
}

const CartNftCard: React.FC<NFTCardProps> = ({ listedNft: el }) => {
  const navigate = useNavigate();
  const { activeAccount, signTransactions, sendTransactions } = useWallet();
  const [isBuying, setIsBuying] = React.useState(false);
  const [openBuyModal, setOpenBuyModal] = React.useState(false);

  // handleBuy
  const handleBuy = async () => {
    try {
      if (!activeAccount) {
        throw new Error("Please connect wallet!");
      }
      setIsBuying(true);

      const { algodClient, indexerClient } = getAlgorandClients();

      // -----------------------------------------
      // check if collection might need a payment to transfer
      // -----------------------------------------
      const collectionAddr = algosdk.getApplicationAddress(el.contractId);
      const collectionAccountInfo = await algodClient
        .accountInformation(collectionAddr)
        .do();
      const { amount, ["min-balance"]: minBalance } = collectionAccountInfo;
      const availableBalance = amount - minBalance;
      const boxCost = 28500;
      const addBoxPayment = availableBalance < boxCost;
      console.log({ availableBalance, boxCost, addBoxPayment });
      if (addBoxPayment) {
        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: collectionAddr,
          amount: 28500,
          suggestedParams: await algodClient.getTransactionParams().do(),
        });
        await toast.promise(
          signTransactions([paymentTxn.toByte()]).then(sendTransactions),
          {
            pending: `Transaction signature pending... ${((str) =>
              str[0].toUpperCase() + str.slice(1))(
              activeAccount.providerId
            )} will prompt you to sign the transaction.`,
            success: "Transaction successful!",
            error: "Transaction failed",
          }
        );
      }
      // -----------------------------------------

      switch (`${el.listing.currency}`) {
        case "0": {
          const builder = {
            mp: new CONTRACT(
              ctcInfoMp206,
              algodClient,
              indexerClient,
              {
                name: "",
                desc: "",
                methods: [
                  {
                    name: "a_sale_buyNet",
                    args: [
                      {
                        name: "listId",
                        type: "uint256",
                      },
                    ],
                    returns: {
                      type: "void",
                    },
                  },
                ],
                events: [],
              },
              { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
              undefined,
              undefined,
              true
            ),
          };

          const customTxn = (
            await Promise.all([
              builder.mp.a_sale_buyNet(el.listing.mpListingId),
            ])
          ).map(({ obj }) => obj);

          const ci = new CONTRACT(
            ctcInfoMp206,
            algodClient,
            indexerClient,
            {
              name: "",
              desc: "",
              methods: [
                {
                  name: "custom",
                  args: [],
                  returns: {
                    type: "void",
                  },
                },
              ],
              events: [],
            },
            {
              addr: activeAccount?.address || "",
              sk: new Uint8Array(0),
            }
          );
          ci.setExtraTxns(customTxn);
          ci.setFee(10000);
          ci.setPaymentAmount(el.listing.price);
          ci.setEnableGroupResourceSharing(true);

          const customR = await ci.custom();
          if (!customR.success) {
            throw new Error("Listing no longer available");
          }

          await toast.promise(
            signTransactions(
              customR.txns.map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            ).then(sendTransactions),
            {
              pending: `Transaction signature pending... ${((str) =>
                str[0].toUpperCase() + str.slice(1))(
                activeAccount.providerId
              )} will prompt you to sign the transaction.`,
              success: "Transaction successful!",
              error: "Transaction failed",
            }
          );

          break;
        }
        default: {
          // -----------------------------------------
          // conditional approval to mp addr
          // -----------------------------------------
          const mpAddr = algosdk.getApplicationAddress(ctcInfoMp206);
          const ptid = Number(el.listing.currency);
          const ciArc200 = new arc200(ptid, algodClient, indexerClient);
          const hasAllowanceR = await ciArc200.hasAllowance(
            activeAccount.address,
            mpAddr
          );
          const arc200_allowanceR = await ciArc200.arc200_allowance(
            activeAccount.address,
            mpAddr
          );
          console.log({ hasAllowanceR, arc200_allowanceR });
          if (!hasAllowanceR.success) {
            throw new Error("Failed to check allowance");
          }
          const hasAllowance = hasAllowanceR.returnValue;
          console.log({ hasAllowance });
          if (hasAllowance === 0) {
            const ci = new CONTRACT(
              ptid,
              algodClient,
              indexerClient,
              {
                name: "",
                desc: "",
                methods: [
                  {
                    name: "arc200_approve",
                    desc: "Approve spender for a token",
                    args: [{ type: "address" }, { type: "uint256" }],
                    returns: { type: "bool", desc: "Success" },
                  },
                ],
                events: [],
              },
              { addr: activeAccount?.address || "", sk: new Uint8Array(0) }
            );
            ci.setPaymentAmount(28100);
            const arc200_approveR = await ci.arc200_approve(
              algosdk.getApplicationAddress(ctcInfoMp206),
              0
            );
            if (!arc200_approveR.success) {
              throw new Error("Failed to approve spender");
            }

            await toast.promise(
              signTransactions(
                arc200_approveR.txns.map(
                  (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
                )
              ).then(sendTransactions),
              {
                pending: `Transaction signature pending... ${((str) =>
                  str[0].toUpperCase() + str.slice(1))(
                  activeAccount.providerId
                )} will prompt you to sign the transaction.`,
                success: "Transaction successful!",
                error: "Transaction failed",
              }
            );

            // -----------------------------------------
          }

          const builder = {
            mp: new CONTRACT(
              ctcInfoMp206,
              algodClient,
              indexerClient,
              {
                name: "",
                desc: "",
                methods: [
                  {
                    name: "a_sale_buySC",
                    args: [
                      {
                        name: "listId",
                        type: "uint256",
                      },
                    ],
                    returns: {
                      type: "void",
                    },
                  },
                ],
                events: [],
              },
              { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
              undefined,
              undefined,
              true
            ),
            arc200: new CONTRACT(
              ptid,
              algodClient,
              indexerClient,
              {
                name: "",
                desc: "",
                methods: [
                  {
                    name: "arc200_approve",
                    desc: "Approve spender for a token",
                    args: [{ type: "address" }, { type: "uint256" }],
                    returns: { type: "bool", desc: "Success" },
                  },
                  {
                    name: "arc200_transfer",
                    desc: "Transfers tokens",
                    args: [
                      {
                        type: "address",
                      },
                      {
                        type: "uint256",
                      },
                    ],
                    returns: { type: "bool" },
                  },
                ],
                events: [],
              },
              { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
              undefined,
              undefined,
              true
            ),
          };
          const ci = new CONTRACT(
            //ptid,
            ctcInfoMp206,
            algodClient,
            indexerClient,
            {
              name: "",
              desc: "",
              methods: [
                {
                  name: "custom",
                  args: [],
                  returns: {
                    type: "void",
                  },
                },
              ],
              events: [],
            },
            {
              addr: activeAccount?.address || "",
              sk: new Uint8Array(0),
            }
          );

          const customTxn = (
            await Promise.all([
              builder.arc200.arc200_approve(
                algosdk.getApplicationAddress(ctcInfoMp206),
                el.listing.price
              ),
              builder.mp.a_sale_buySC(el.listing.mpListingId),
            ])
          ).map(({ obj }) => obj);

          ci.setPaymentAmount(28500);
          ci.setAccounts([
            "VIAGCPULN6FUTHUNPQZDRQIHBT7IUVT264B3XDXLZNX7OZCJP6MEF7JFQU", // tokenAddr
          ]);
          ci.setExtraTxns(customTxn);
          ci.setFee(13000);
          ci.setEnableGroupResourceSharing(true);
          ci.setBeaconId(ctcInfoMp206);
          const customR = await ci.custom();
          if (!customR.success) {
            throw new Error("Listing no longer available");
          }

          await toast.promise(
            signTransactions(
              customR.txns.map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            ).then(sendTransactions),
            {
              pending: `Transaction signature pending... ${((str) =>
                str[0].toUpperCase() + str.slice(1))(
                activeAccount.providerId
              )} will prompt you to sign the transaction.`,
              success: "Transaction successful!",
              error: "Transaction failed",
            }
          );

          break;
        }
      }
      toast.success("NFT purchase successful!");
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setIsBuying(false);
      setOpenBuyModal(false);
    }
  };

  const handleBuyButtonClick = async () => {
    try {
      if (!activeAccount) {
        toast.info("Please connect wallet!");
        return;
      }
      const { algodClient, indexerClient } = getAlgorandClients();
      const ci = new CONTRACT(
        el.listing.mpContractId,
        algodClient,
        indexerClient,
        {
          name: "",
          desc: "",
          methods: [
            //v_sale_listingByIndex(uint256)(uint64,uint256,address,(byte,byte[40]),uint64,uint64,uint64,uint64,uint64,uint64,address,address,address)
            {
              name: "v_sale_listingByIndex",
              args: [
                {
                  type: "uint256",
                },
              ],
              readonly: true,
              returns: {
                type: "(uint64,uint256,address,(byte,byte[40]),uint64,uint64,uint64,uint64,uint64,uint64,address,address,address)",
              },
            },
          ],
          events: [],
        },
        { addr: activeAccount.address, sk: new Uint8Array(0) }
      );
      const v_sale_listingByIndexR = await ci.v_sale_listingByIndex(
        el.listing.mpListingId
      );
      if (!v_sale_listingByIndexR.success) {
        throw new Error("Failed to get listing");
      }
      const v_sale_listingByIndex = v_sale_listingByIndexR.returnValue;
      if (v_sale_listingByIndex[1] === BigInt(0)) {
        throw new Error("Listing no longer available");
      }

      switch (el.listing.currency) {
        // VOI
        case 0: {
          const accountInfo = await algodClient
            .accountInformation(activeAccount.address)
            .do();
          const { amount, ["min-balance"]: minBalance } = accountInfo;
          const availableBalance = amount - minBalance;
          if (availableBalance < el.listing.price) {
            throw new Error(
              `Insufficient balance! (${(
                (availableBalance - el.listing.price) /
                1e6
              ).toLocaleString()} VOI)`
            );
          }
          break;
        }
        // VIA
        case 6779767: {
          const ci = new arc200(
            el.listing.currency,
            algodClient,
            indexerClient
          );
          const arc200_balanceOfR = await ci.arc200_balanceOf(
            activeAccount.address
          );
          if (!arc200_balanceOfR.success) {
            throw new Error("Failed to check balance");
          }
          const arc200_balanceOf = arc200_balanceOfR.returnValue;
          if (arc200_balanceOf < el.listing.price) {
            throw new Error(
              `Insufficient balance! (${(
                (Number(arc200_balanceOf) - el.listing.price) /
                1e6
              ).toLocaleString()}) VIA`
            );
          }
          break;
        }
        default: {
          throw new Error("Unsupported currency!");
        }
      }
      setOpenBuyModal(true);
    } catch (e: any) {
      console.log(e);
      toast.info(e.message);
    }
  };
  const collectionsMissingImage = [35720076];
  const url = !collectionsMissingImage.includes(el.contractId)
    ? `https://prod.cdn.highforge.io/i/${encodeURIComponent(
        el.metadataURI
      )}?w=400`
    : el.metadata.image;
  return (
    <>
      <Box
        style={{
          cursor: "pointer",
          width: "384px",
          height: "384px",
          flexShrink: 0,
          borderRadius: "20px",
          background: `linear-gradient(0deg, rgba(0, 0, 0, 0.50) 10.68%, rgba(0, 0, 0, 0.00) 46.61%), url(${url}), lightgray 50% / cover no-repeat`,
          backgroundSize: "cover",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
        onClick={(e) => {
          navigate(`/collection/${el.contractId}/token/${el.tokenId}`);
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fff",
            width: "326px",
            height: "52px",
            marginBottom: "27px",
          }}
        >
          <Stack gap={1}>
            <CollectionName>{el.metadata.name}</CollectionName>
            <CollectionVolume>
              {Math.round(el.listing.price / 1e6).toLocaleString()}{" "}
              {el.listing.currency === 0 ? "VOI" : "VIA"}
            </CollectionVolume>
          </Stack>
          <img
            height="40"
            width="40"
            src="/static/icon-cart.png"
            onClick={(e) => {
              //handleBuyButtonClick();
            }}
          />
        </Stack>
      </Box>
      <BuySaleModal
        open={false}
        loading={false}
        handleClose={() => {}}
        onSave={async () => {}}
        title="Buy NFT"
        buttonText="Buy"
        image={el.metadata.image}
        price={(el.listing.price / 1e6).toLocaleString()}
        currency={el.listing.currency === 0 ? "VOI" : "VIA"}
      />
    </>
  );
};

export default CartNftCard;
