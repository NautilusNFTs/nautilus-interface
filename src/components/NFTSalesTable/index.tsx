import React from "react";
import { styled as mstyled } from "@mui/system";
import styled from "styled-components";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Link } from "react-router-dom";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const HistoryTableRoot = styled.div`
  display: flex;
  /*
  width: 1280px;
  */
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  &.light .label {
    color: var(--Base-Black, #000);
  }
  &.dark .label {
    color: var(--Base-White, #fff);
  }
`;

const HistoryTableHead = styled.div`
  display: flex;
  padding: var(--Main-System-10px, 10px) 0px;
  align-items: center;
  gap: var(--Main-System-24px, 24px);
  align-self: stretch;
  border-bottom: 1px solid #3b3b3b;
`;

const HeadingEventContainer = styled.div`
  display: flex;
  width: 162px;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
`;

const HeadingEventLabel = styled.div`
  flex: 1 0 0;
  text-align: center;
  font-family: Nohemi;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 120% */
`;

const HeadingPriceContainer = styled.div`
  display: flex;
  width: 260px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
`;

const HeadingPriceLabel = styled.div`
  width: 143px;
  height: var(--Main-System-24px, 24px);
  color: var(--Base-Black, #000);
  text-align: center;
  font-family: Nohemi;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 120% */
`;

const HeadingFromLabel = styled.div`
  display: -webkit-box;
  width: 249px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: var(--Base-Black, #000);
  text-align: center;
  text-overflow: ellipsis;
  font-family: Nohemi;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 110% */
`;

const HeadingToLabel = styled.div`
  display: -webkit-box;
  width: 200px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: var(--Base-Black, #000);
  text-align: center;
  text-overflow: ellipsis;
  font-family: Nohemi;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 110% */
`;

const HeadingDateContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  flex: 1 0 0;
`;

const HeadingDateLabel = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: var(--Base-Black, #000);
  text-align: center;
  text-overflow: ellipsis;
  font-family: Nohemi;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 110% */
`;

const HistoryTableRow = styled.div`
  display: flex;
  padding: var(--Main-System-10px, 10px) 0px;
  align-items: center;
  gap: var(--Main-System-24px, 24px);
  align-self: stretch;
  border-bottom: 1px solid #3b3b3b;
  height: 44px;
`;

const HistoryEventValueContainer = styled.div`
  display: flex;
  width: 162px;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
`;

const HistoryEventValueLabel = styled.div`
  flex: 1 0 0;
  color: #161717;
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 137.5% */
`;

const HistoryPriceValueContainer = styled.div`
  display: flex;
  width: 261px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
`;

const HistoryPriceValue = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: var(--Main-System-10px, 10px);
  min-width: 150px;
`;

const HistoryPriceValueWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
`;

const HistoryPriceValueCurrency = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  border-radius: 100px;
  background: #06f;
`;

const HistoryPriceValueLabel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

const HistoryPriceValueLabelMain = styled.div`
  color: #161717;
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
`;

const HistoryPriceValueLabelSub = styled.div`
  color: #717579;
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
`;

const HistoryFromValue = styled.div`
  display: -webkit-box;
  width: 236px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: #717579;
  text-overflow: ellipsis;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
`;

const HistoryToValue = styled.div`
  display: -webkit-box;
  width: 250px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: #717579;
  text-align: center;
  text-overflow: ellipsis;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
`;

const HistoryDateValueContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  flex: 1 0 0;
`;

const HistoryDateValueLabel = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: #161717;
  text-align: center;
  text-overflow: ellipsis;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px; /* 137.5% */
`;

const HistoryDateValueIcon = styled.svg`
  width: var(--Main-System-16px, 16px);
  height: var(--Main-System-16px, 16px);
  flex-shrink: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  /*
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  */
  gap: 12px;
  align-self: stretch;
  margin-top: 24px;
`;

const Button = styled.div`
  cursor: pointer;
`;

const SecondaryButton = styled(Button)`
  display: flex;
  padding: var(--Main-System-12px, 12px) var(--Main-System-20px, 20px);
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-6px, 6px);
  border-radius: 100px;
  border: 1px solid #93f;
  /* Shadow/XSM */
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.04);
`;

const SecondaryButtonLabel = styled.div`
  color: #93f;
  /* Text Button/Semibold Large */
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 146.667% */
  letter-spacing: 0.1px;
`;

const SecondaryButtonIcon = styled.svg`
  width: var(--Main-System-20px, 20px);
  height: var(--Main-System-20px, 20px);
`;

interface Sale {
  event: string;
  price: number;
  normalPrice: number;
  currency: string;
  seller: string;
  buyer: string;
  date: string;
  round: number;
}

interface Props {
  sales: Sale[];
}

const SalesTable: React.FC<Props> = ({ sales }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const [displayRows, setDisplayRows] = React.useState(3);
  return (
    <>
      <HistoryTableRoot className={isDarkTheme ? "dark" : "light"}>
        <HistoryTableHead>
          <HeadingEventContainer>
            <HeadingEventLabel className="label">Event</HeadingEventLabel>
          </HeadingEventContainer>
          <HeadingPriceContainer>
            <HeadingPriceLabel className="label">Price</HeadingPriceLabel>
          </HeadingPriceContainer>
          <HeadingFromLabel className="label">From</HeadingFromLabel>
          <HeadingToLabel className="label">To</HeadingToLabel>
          <HeadingDateContainer>
            <HeadingDateLabel className="label">Date</HeadingDateLabel>
          </HeadingDateContainer>
        </HistoryTableHead>
        {sales.slice(0, displayRows).map((sale, index) => (
          <HistoryTableRow>
            <HistoryEventValueContainer>
              <HistoryEventValueLabel
                className="label
              "
              >
                Sale
              </HistoryEventValueLabel>
            </HistoryEventValueContainer>
            <HistoryPriceValueContainer>
              <HistoryPriceValue>
                <HistoryPriceValueWrapper>
                  {/*<HistoryPriceValueCurrency>
                    <svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                    >
                      <path
                        d="M3.16675 7.33311L8.50008 8.66634L13.8334 7.33301M3.16675 7.33311L8.50008 1.33301M3.16675 7.33311L8.50008 5.99973M13.8334 7.33301L8.50008 1.33301M13.8334 7.33301L8.50008 5.99973M8.50008 1.33301V5.99973M4.16675 9.99967L8.50016 14.6663L12.8334 9.99967L8.50008 10.9997L4.16675 9.99967Z"
                        stroke="white"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    </HistoryPriceValueCurrency>*/}
                  <HistoryPriceValueLabel>
                    <HistoryPriceValueLabelMain className="label">
                      {sale.price.toLocaleString()} VIA
                    </HistoryPriceValueLabelMain>
                    {/*<HistoryPriceValueLabelSub>
                      {sale.normalPrice}
                    </HistoryPriceValueLabelSub>*/}
                  </HistoryPriceValueLabel>
                </HistoryPriceValueWrapper>
              </HistoryPriceValue>
            </HistoryPriceValueContainer>
            <HistoryFromValue>
              <StyledLink to={`/account/${sale.seller}`}>
                {sale.seller}
              </StyledLink>
            </HistoryFromValue>
            <HistoryToValue>
              <StyledLink to={`/account/${sale.buyer}`}>
                {sale.buyer}
              </StyledLink>
            </HistoryToValue>
            <HistoryDateValueContainer>
              <HistoryDateValueLabel className="label">
                {sale.date}
              </HistoryDateValueLabel>
              {/*<HistoryDateValueIcon
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M14 6L14 2M14 2H10M14 2L8.66667 7.33333M6.66667 3.33333H5.2C4.0799 3.33333 3.51984 3.33333 3.09202 3.55132C2.71569 3.74307 2.40973 4.04903 2.21799 4.42535C2 4.85318 2 5.41323 2 6.53333V10.8C2 11.9201 2 12.4802 2.21799 12.908C2.40973 13.2843 2.71569 13.5903 3.09202 13.782C3.51984 14 4.0799 14 5.2 14H9.46667C10.5868 14 11.1468 14 11.5746 13.782C11.951 13.5903 12.2569 13.2843 12.4487 12.908C12.6667 12.4802 12.6667 11.9201 12.6667 10.8V9.33333"
                  stroke="#161717"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                  </HistoryDateValueIcon>*/}
            </HistoryDateValueContainer>
          </HistoryTableRow>
        ))}
      </HistoryTableRoot>
      <ButtonContainer>
        {displayRows < sales.length ? (
          <SecondaryButton
            onClick={() => {
              setDisplayRows(sales.length);
            }}
          >
            <SecondaryButtonLabel>View More</SecondaryButtonLabel>
            <SecondaryButtonIcon
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10.0001 4.16699V15.8337M10.0001 15.8337L15.8334 10.0003M10.0001 15.8337L4.16675 10.0003"
                stroke="#9933FF"
                stroke-width="1.67"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </SecondaryButtonIcon>
          </SecondaryButton>
        ) : null}
        {/*<SecondaryButton
          onClick={() => {
            setDisplayChart(!displayChart);
          }}
        >
          <SecondaryButtonLabel>
            {!displayChart ? "Show Chart" : "Hide Chart"}
          </SecondaryButtonLabel>
          <ShowChartIcon sx={{ fill: "#9933FF" }} />
        </SecondaryButton>*/}
      </ButtonContainer>
    </>
  );
};

export default SalesTable;
