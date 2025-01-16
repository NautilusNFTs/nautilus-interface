import React from 'react';
import { Container } from '@mui/material';
import UserSettings from '@/components/UserSettings';
import { PaymentToken } from '@/types';

const SettingsPage: React.FC = () => {
  const availableTokens: PaymentToken[] = [
    { tokenId: 390001, symbol: 'VOI', decimals: 6 },
    // Add other available tokens here
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <UserSettings availableTokens={availableTokens} />
    </Container>
  );
};

export default SettingsPage; 