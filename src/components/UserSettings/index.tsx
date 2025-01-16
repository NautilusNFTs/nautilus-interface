import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  useTheme,
  Divider,
} from "@mui/material";
import { PaymentToken } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface UserSettingsProps {
  availableTokens: PaymentToken[];
  onSettingsChange?: (enabledTokens: number[]) => void;
}

// Define default tokens outside component to be consistent across the app
export const DEFAULT_ENABLED_TOKENS = [
  390001, // VOI
  395614, // aUSDC
  420069, // UNIT
  302222, // F
];

const UserSettings: React.FC<UserSettingsProps> = ({
  availableTokens,
  onSettingsChange,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [enabledTokens, setEnabledTokens] = useLocalStorage<number[]>(
    "enabled-payment-tokens",
    DEFAULT_ENABLED_TOKENS
  );

  // Notify parent of initial enabled tokens on mount
  useEffect(() => {
    onSettingsChange?.(enabledTokens);
  }, []); // Empty dependency array to run only once on mount

  const handleTokenToggle = (tokenId: number) => {
    setEnabledTokens((prev) => {
      const newTokens = prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId];

      onSettingsChange?.(newTokens);
      return newTokens;
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: isDarkMode
          ? "rgba(255, 255, 255, 0.05)"
          : "transparent",
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Settings
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          Select which tokens you want to see as payment options when making
          purchases.
        </Typography>

        <FormGroup>
          {availableTokens.map((token) => (
            <FormControlLabel
              key={token.tokenId}
              control={
                <Switch
                  checked={enabledTokens.includes(token.tokenId)}
                  onChange={() => handleTokenToggle(token.tokenId)}
                  disabled={token.tokenId === 390001} // VOI cannot be disabled
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <img
                    src={`https://asset-verification.nautilus.sh/icons/${
                      token.tokenId === 390001 ? 0 : token.tokenId
                    }.png`}
                    alt={token.symbol}
                    style={{ width: 24, height: 24, borderRadius: "50%" }}
                  />
                  <Typography>
                    {token.symbol}
                    {token.tokenId === 390001 && " (Always enabled)"}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </CardContent>
    </Card>
  );
};

export default UserSettings;
