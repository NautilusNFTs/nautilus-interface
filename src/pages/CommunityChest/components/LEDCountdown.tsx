import React from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';

const LEDContainer = styled(Box)`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;

const LEDUnit = styled(Box)<{ $isDarkTheme: boolean }>`
  background: ${props => props.$isDarkTheme ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
  padding: 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
`;

const LEDNumber = styled.div<{ $isDarkTheme: boolean }>`
  font-family: 'Digital-7', monospace;
  font-size: 48px;
  color: ${props => props.$isDarkTheme ? '#90caf9' : '#1976d2'};
  text-shadow: 0 0 10px ${props => props.$isDarkTheme ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)'};
  font-weight: bold;
`;

const LEDLabel = styled.div<{ $isDarkTheme: boolean }>`
  font-size: 12px;
  color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  text-transform: uppercase;
  margin-top: 4px;
`;

interface LEDCountdownProps {
  days: number;
  hours: number;
  minutes: number;
  isDarkTheme: boolean;
}

const LEDCountdown: React.FC<LEDCountdownProps> = ({
  days,
  hours,
  minutes,
  isDarkTheme,
}) => {
  return (
    <LEDContainer>
      <LEDUnit $isDarkTheme={isDarkTheme}>
        <LEDNumber $isDarkTheme={isDarkTheme}>
          {String(days).padStart(2, '0')}
        </LEDNumber>
        <LEDLabel $isDarkTheme={isDarkTheme}>Days</LEDLabel>
      </LEDUnit>
      <LEDUnit $isDarkTheme={isDarkTheme}>
        <LEDNumber $isDarkTheme={isDarkTheme}>
          {String(hours).padStart(2, '0')}
        </LEDNumber>
        <LEDLabel $isDarkTheme={isDarkTheme}>Hours</LEDLabel>
      </LEDUnit>
      <LEDUnit $isDarkTheme={isDarkTheme}>
        <LEDNumber $isDarkTheme={isDarkTheme}>
          {String(minutes).padStart(2, '0')}
        </LEDNumber>
        <LEDLabel $isDarkTheme={isDarkTheme}>Minutes</LEDLabel>
      </LEDUnit>
    </LEDContainer>
  );
};

export default LEDCountdown; 