import React from "react";
import styled from "styled-components";
import { Box, Typography } from "@mui/material";

interface BlockData {
  count: number;
  label: string;
}

const GraphContainer = styled(Box)<{ $isDarkTheme: boolean }>`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 8px;
  position: relative;
`;

const GridLine = styled.div<{ $isDarkTheme: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  border-bottom: 1px dashed
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
`;

const DataPoint = styled.div<{ $isDarkTheme: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    width: 12px;
    height: 12px;
    box-shadow: 0 0 10px
      ${(props) =>
        props.$isDarkTheme
          ? "rgba(144, 202, 249, 0.5)"
          : "rgba(25, 118, 210, 0.5)"};
  }

  &:hover::after {
    content: "${(props) => props.title}";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: ${(props) => (props.$isDarkTheme ? "#333" : "#fff")};
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 3;
  }
`;

const Label = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
  font-size: 12px;
  position: absolute;
  transform: translateX(-50%);
  bottom: -25px;
`;

interface BlockProductionGraphProps {
  data: BlockData[];
  isDarkTheme: boolean;
}

const BlockProductionGraph: React.FC<BlockProductionGraphProps> = ({
  data = [],
  isDarkTheme,
}) => {
  if (!data || data.length === 0) {
    return (
      <GraphContainer $isDarkTheme={isDarkTheme}>
        <Typography sx={{ color: isDarkTheme ? "#fff" : "#000", m: "auto" }}>
          No data available
        </Typography>
      </GraphContainer>
    );
  }

  const maxCount = Math.max(...data.map((d) => d?.count || 0));
  const padding = { top: 30, right: 60, bottom: 40, left: 60 };
  const graphHeight = 140;
  const availableWidth = 320;

  const pointSpacing = data.length > 1 ? availableWidth / (data.length - 1) : 0;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((percentage) => ({
    y: graphHeight - graphHeight * percentage + padding.top,
    value: Math.round(maxCount * percentage),
  }));

  const points = data.map((item, index) => ({
    x: `${10 + index * pointSpacing}%`,
    y:
      graphHeight - ((item?.count || 0) / maxCount) * graphHeight + padding.top,
    data: item,
  }));

  const linePath = points
    .map(
      (point, i) =>
        `${i === 0 ? "M" : "L"} ${padding.left + parseFloat(point.x)} ${
          point.y
        }`
    )
    .join(" ");

  return (
    <Box sx={{ position: "relative", height: 220, width: "100%" }}>
      <GraphContainer $isDarkTheme={isDarkTheme}>
        {/* Grid lines without labels */}
        {gridLines.map((line, i) => (
          <GridLine
            key={i}
            $isDarkTheme={isDarkTheme}
            style={{ top: line.y }}
          />
        ))}

        {/* Line plot */}
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d={linePath}
            fill="none"
            stroke={isDarkTheme ? "#90caf9" : "#1976d2"}
            strokeWidth="2"
          />
        </svg>

        {/* Data points and labels */}
        {points.map((point, i) => (
          <React.Fragment key={i}>
            <DataPoint
              $isDarkTheme={isDarkTheme}
              style={{
                left: `${padding.left + parseFloat(point.x)}px`,
                top: point.y,
              }}
              title={`${point.data?.count?.toLocaleString() || 0} blocks`}
            />
            <Label
              $isDarkTheme={isDarkTheme}
              style={{
                left: `${padding.left + parseFloat(point.x)}px`,
                bottom: padding.bottom - 50,
                whiteSpace: "nowrap",
              }}
            >
              {point.data?.label || `Week ${i}`}
            </Label>
          </React.Fragment>
        ))}
      </GraphContainer>
    </Box>
  );
};

export default BlockProductionGraph;
