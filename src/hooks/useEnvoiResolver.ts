import envoiSDK from "@xarmian/envoi-sdk";

// Initialize with Mainnet Algod node configuration
const resolver = envoiSDK.init({
  token: "",
  url: "https://mainnet-api.voi.nodely.dev",
  port: 443,
});

export const useEnvoiResolver = () => {
  return resolver;
};
