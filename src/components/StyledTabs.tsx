import { Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledTabs = styled(Tabs)<{ $isDarkTheme: boolean }>`
  .MuiTab-root {
    color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
    font-family: "Plus Jakarta Sans";
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
    
    &.Mui-selected {
      color: #9933ff;
    }
  }

  .MuiTabs-indicator {
    background-color: #9933ff;
  }
`;

export const StyledTab = styled(Tab)`
  text-transform: none;
`; 