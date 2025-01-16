import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAlgorandClients } from "@/wallets";
import { abi, CONTRACT } from "ulujs";
import { useWallet } from "@txnlab/use-wallet-react";
import BigNumber from "bignumber.js";
import confetti from "canvas-confetti";

interface TokenInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferSuccess: () => void;
  token: {
    name: string;
    symbol: string;
    contractId: number;
    decimals: number;
    totalSupply: string;
    creator: string;
    verified: number;
    price: string;
    arc200_balanceOf?: string;
  };
  balance: string;
}

const MAX_SUPPLY =
  "115792089237316200000000000000000000000000000000000000000000000000000000000000000";

export default function TokenInfoModal({
  isOpen,
  onClose,
  onTransferSuccess,
  token,
  balance,
}: TokenInfoModalProps) {
  const { activeAccount, signTransactions } = useWallet();
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  if (!isOpen) return null;

  const formatSupply = (supply: string, decimals: number) => {
    const num = parseFloat(supply);
    return (num / Math.pow(10, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: decimals,
    });
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsTransferring(true);

    try {
      // Validate amount is within balance
      const maxAmount = parseFloat(balance) / Math.pow(10, token.decimals);
      const transferAmount = parseFloat(amount);

      if (isNaN(transferAmount) || transferAmount <= 0) {
        setError("Please enter a valid amount");
        throw new Error("Invalid amount");
      }

      if (transferAmount > maxAmount) {
        setError("Amount exceeds balance");
        throw new Error("Amount exceeds balance");
      }

      if (!recipient.trim()) {
        setError("Please enter a recipient address");
        throw new Error("Invalid recipient address");
      }

      // TODO: Implement actual transfer
      console.log("Transfer:", {
        recipient,
        amount: transferAmount,
        token: token.contractId,
      });
      const { algodClient, indexerClient } = getAlgorandClients();
      const ci = new CONTRACT(
        token.contractId,
        algodClient,
        indexerClient,
        abi.arc200,
        {
          addr: activeAccount?.address || "",
          sk: new Uint8Array(0),
        }
      );
      const amountBi = BigInt(
        new BigNumber(transferAmount)
          .multipliedBy(new BigNumber(10).pow(token.decimals))
          .toFixed(0)
      );
      const arc200_transferR = await ci.arc200_transfer(recipient, amountBi);
      console.log(arc200_transferR);
      if (!arc200_transferR.success) {
        throw new Error("Failed to transfer");
      }
      const stxns = await signTransactions(
        arc200_transferR.txns.map(
          (t: string) => new Uint8Array(Buffer.from(t, "base64"))
        )
      );
      await algodClient.sendRawTransaction(stxns as Uint8Array[]).do();

      // Show confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Close form and reset
      setShowTransferForm(false);
      setAmount("");
      setRecipient("");
      
      // Trigger balance refresh
      onTransferSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">
              {token.name} ({token.symbol})
              {token.verified === 1 && (
                <span className="ml-2 text-green-600 dark:text-green-500">
                  ✓
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Contract ID
              </span>
              <span className="col-span-2 font-mono">{token.contractId}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Your Balance
              </span>
              <span className="col-span-2 font-mono">
                {formatSupply(balance, token.decimals)} {token.symbol}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Decimals</span>
              <span className="col-span-2">{token.decimals}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Price</span>
              <span className="col-span-2">
                {parseFloat(token.price).toFixed(6)} VOI
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Creator</span>
              <span className="col-span-2 font-mono break-all">
                {token.creator}
              </span>
            </div>

            <div className="pt-4 flex justify-end">
              {!showTransferForm ? (
                <button
                  disabled={balance === "0"}
                  onClick={() => setShowTransferForm(true)}
                  className={`px-4 py-2 rounded-lg font-semibold
                    ${
                      balance === "0"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                        : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    }`}
                >
                  Transfer
                </button>
              ) : (
                <form
                  onSubmit={handleTransferSubmit}
                  className="w-full space-y-4"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter recipient address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount (Max: {formatSupply(balance, token.decimals)}{" "}
                      {token.symbol})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="any"
                        min="0"
                        max={parseFloat(balance) / Math.pow(10, token.decimals)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Enter amount"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAmount(
                            (
                              parseFloat(balance) / Math.pow(10, token.decimals)
                            ).toString()
                          )
                        }
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {error && <div className="text-red-500 text-sm">{error}</div>}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      disabled={isTransferring}
                      onClick={() => {
                        setShowTransferForm(false);
                        setError("");
                        setAmount("");
                        setRecipient("");
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold 
                        ${
                          isTransferring
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isTransferring}
                      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2
                        ${
                          isTransferring
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white dark:bg-blue-500 dark:hover:bg-blue-600`}
                    >
                      {isTransferring ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Confirm Transfer"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
