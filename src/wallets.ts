import algosdk from "algosdk";

const getDynamicDeflyWalletConnect = async () => {
  const DeflyWalletConnect = (await import("@blockshake/defly-connect"))
    .DeflyWalletConnect;
  return DeflyWalletConnect;
};

// const getDynamicPeraWalletConnect = async () => {
//   const PeraWalletConnect = (await import("@perawallet/connect"))
//     .PeraWalletConnect;
//   return PeraWalletConnect;
// };

// const getDynamicDaffiWalletConnect = async () => {
//   const DaffiWalletConnect = (await import("@daffiwallet/connect"))
//     .DaffiWalletConnect;
//   return DaffiWalletConnect;
// };

const getDynamicLuteConnect = async () => {
  const LuteConnect = (await import("lute-connect")).default;
  return LuteConnect;
};

export const getCurrentNode = () => {
  const [node, customNode, customIndexer] = (
    localStorage.getItem("node") ?? "::"
  ).split(":");
  return [node, customNode, customIndexer];
};

export const getCurrentNodeEnv = () => {
  const [node, customNode, customIndexer] = getCurrentNode();
  let ALGO_SERVER;
  let ALGO_INDEXER_SERVER;
  switch (node) {
    default:
    case "voi":
      ALGO_SERVER = "https://mainnet-api.voi.nodely.dev";
      ALGO_INDEXER_SERVER = "https://mainnet-idx.voi.nodely.dev";
      break;
    case "voi-testnet":
      ALGO_SERVER = "https://testnet-api.voi.nodly.io";
      ALGO_INDEXER_SERVER = "https://testnet-idx.voi.nodly.io";
      break;
    case "algorand-testnet":
      ALGO_SERVER = "https://testnet-api.algonode.cloud";
      ALGO_INDEXER_SERVER = "https://testnet-idx.algonode.cloud";
      break;
    case "algorand":
      ALGO_SERVER = "https://mainnet-api.algonode.cloud";
      ALGO_INDEXER_SERVER = "https://mainnet-idx.algonode.cloud";
      break;
    case "custom":
      ALGO_SERVER = customNode;
      ALGO_INDEXER_SERVER = customIndexer;
      break;
  }
  return {
    ALGO_SERVER,
    ALGO_INDEXER_SERVER,
  };
};

export const getAlgorandClients = () => {
  const { ALGO_SERVER: algodServer, ALGO_INDEXER_SERVER: indexerServer } =
    getCurrentNodeEnv();
  const algodToken = ""; // Your Algod API token
  const algodPort = ""; // Port of your Algod node
  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const token = "";
  const port = "";
  const indexerClient = new algosdk.Indexer(token, indexerServer, port);
  return {
    algodClient,
    indexerClient,
  };
};
