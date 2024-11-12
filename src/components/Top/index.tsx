import React from "react";
import styled from "styled-components";

const TopRoot = styled.div`
  display: flex;
  gap: 32px;
  flex-direction: column;
  margin-top: 64px;
`;

const TopHeading = styled.h3`
  font-family: Nohemi;
  font-size: 40px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: 0em;
  text-align: left;
  color: #9933ff;
  margin: 0px;
`;

const TableContainer = styled.div`
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
`;

const TableRow = styled.tr`
  width: 100%;
`;

const TableCell = styled.td`
  padding-left: 24px;
  padding-right: 24px;
`;

const LeftCell = styled(TableCell)``;

const RightCell = styled(TableCell)`
  @media (max-width: 960px) {
    display: none;
  }
`;

const Rank = styled.span`
  width: 16px;
  height: 22px;
  font-family: Nohemi;
  font-size: 24px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0px;
  text-align: left;
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 100px;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
`;

const ColectionName = styled.div`
  font-family: Inter;
  font-size: 24px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0px;
  text-align: left;
`;

const PriceDisplay = styled.span`
  font-family: Inter;
  font-size: 20px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0px;
  text-align: left;
  width: 45px
  height: 22px
`;

const PriceText = styled.span`
  font-family: Inter;
  font-size: 20px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0px;
  text-align: left;
  color: #717579;
`;

export const Top: React.FC = () => {
  return (
    <Table>
      {[0, 1, 2, 4, 5].map((el) => (
        <TableRow key={el}>
          <LeftCell>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  paddingTop: "20px",
                }}
              >
                <Rank>{el + 1}</Rank>
                <Avatar>
                  <AvatarImage src="https://prod.cdn.highforge.io/i/https%3A%2F%2Fprod.cdn.highforge.io%2Ft%2F28386188%2F22.json%23arc3" />
                </Avatar>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <ColectionName>nodemonke 9141</ColectionName>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.51447 2.91542C8.90071 3.43846 8.1376 3.75455 7.33377 3.8187C5.45794 3.96839 3.96839 5.45794 3.8187 7.33377C3.75455 8.1376 3.43846 8.90071 2.91542 9.51447C1.69486 10.9467 1.69486 13.0533 2.91542 14.4855C3.43846 15.0993 3.75455 15.8624 3.8187 16.6662C3.96839 18.5421 5.45794 20.0316 7.33377 20.1813C8.1376 20.2455 8.90071 20.5615 9.51447 21.0846C10.9467 22.3051 13.0533 22.3051 14.4855 21.0846C15.0993 20.5615 15.8624 20.2455 16.6662 20.1813C18.5421 20.0316 20.0316 18.5421 20.1813 16.6662C20.2455 15.8624 20.5615 15.0993 21.0846 14.4855C22.3051 13.0533 22.3051 10.9467 21.0846 9.51447C20.5615 8.90071 20.2455 8.1376 20.1813 7.33377C20.0316 5.45794 18.5421 3.96839 16.6662 3.8187C15.8624 3.75455 15.0993 3.43846 14.4855 2.91542C13.0533 1.69486 10.9467 1.69486 9.51447 2.91542Z"
                        fill="#9933FF"
                      />
                      <path
                        d="M9 12L11 14L15.5 9.5M7.33377 3.8187C8.1376 3.75455 8.90071 3.43846 9.51447 2.91542C10.9467 1.69486 13.0533 1.69486 14.4855 2.91542C15.0993 3.43846 15.8624 3.75455 16.6662 3.8187C18.5421 3.96839 20.0316 5.45794 20.1813 7.33377C20.2455 8.1376 20.5615 8.90071 21.0846 9.51447C22.3051 10.9467 22.3051 13.0533 21.0846 14.4855C20.5615 15.0993 20.2455 15.8624 20.1813 16.6662C20.0316 18.5421 18.5421 20.0316 16.6662 20.1813C15.8624 20.2455 15.0993 20.5615 14.4855 21.0846C13.0533 22.3051 10.9467 22.3051 9.51447 21.0846C8.90071 20.5615 8.1376 20.2455 7.33377 20.1813C5.45794 20.0316 3.96839 18.5421 3.8187 16.6662C3.75455 15.8624 3.43846 15.0993 2.91542 14.4855C1.69486 13.0533 1.69486 10.9467 2.91542 9.51447C3.43846 8.90071 3.75455 8.1376 3.8187 7.33377C3.96839 5.45794 5.45794 3.96839 7.33377 3.8187Z"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <PriceText>Floor</PriceText>
                    <PriceDisplay>3.54</PriceDisplay>
                    <PriceText>ETH</PriceText>
                  </div>
                </div>
              </div>
            </div>
          </LeftCell>
          <RightCell>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  paddingTop: "20px",
                }}
              >
                <Rank>{el + 1}</Rank>
                <Avatar>
                  <AvatarImage src="https://prod.cdn.highforge.io/i/https%3A%2F%2Fprod.cdn.highforge.io%2Ft%2F28386188%2F22.json%23arc3" />
                </Avatar>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <ColectionName>nodemonke 9141</ColectionName>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.51447 2.91542C8.90071 3.43846 8.1376 3.75455 7.33377 3.8187C5.45794 3.96839 3.96839 5.45794 3.8187 7.33377C3.75455 8.1376 3.43846 8.90071 2.91542 9.51447C1.69486 10.9467 1.69486 13.0533 2.91542 14.4855C3.43846 15.0993 3.75455 15.8624 3.8187 16.6662C3.96839 18.5421 5.45794 20.0316 7.33377 20.1813C8.1376 20.2455 8.90071 20.5615 9.51447 21.0846C10.9467 22.3051 13.0533 22.3051 14.4855 21.0846C15.0993 20.5615 15.8624 20.2455 16.6662 20.1813C18.5421 20.0316 20.0316 18.5421 20.1813 16.6662C20.2455 15.8624 20.5615 15.0993 21.0846 14.4855C22.3051 13.0533 22.3051 10.9467 21.0846 9.51447C20.5615 8.90071 20.2455 8.1376 20.1813 7.33377C20.0316 5.45794 18.5421 3.96839 16.6662 3.8187C15.8624 3.75455 15.0993 3.43846 14.4855 2.91542C13.0533 1.69486 10.9467 1.69486 9.51447 2.91542Z"
                        fill="#9933FF"
                      />
                      <path
                        d="M9 12L11 14L15.5 9.5M7.33377 3.8187C8.1376 3.75455 8.90071 3.43846 9.51447 2.91542C10.9467 1.69486 13.0533 1.69486 14.4855 2.91542C15.0993 3.43846 15.8624 3.75455 16.6662 3.8187C18.5421 3.96839 20.0316 5.45794 20.1813 7.33377C20.2455 8.1376 20.5615 8.90071 21.0846 9.51447C22.3051 10.9467 22.3051 13.0533 21.0846 14.4855C20.5615 15.0993 20.2455 15.8624 20.1813 16.6662C20.0316 18.5421 18.5421 20.0316 16.6662 20.1813C15.8624 20.2455 15.0993 20.5615 14.4855 21.0846C13.0533 22.3051 10.9467 22.3051 9.51447 21.0846C8.90071 20.5615 8.1376 20.2455 7.33377 20.1813C5.45794 20.0316 3.96839 18.5421 3.8187 16.6662C3.75455 15.8624 3.43846 15.0993 2.91542 14.4855C1.69486 13.0533 1.69486 10.9467 2.91542 9.51447C3.43846 8.90071 3.75455 8.1376 3.8187 7.33377C3.96839 5.45794 5.45794 3.96839 7.33377 3.8187Z"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <PriceText>Floor</PriceText>
                    <PriceDisplay>3.54</PriceDisplay>
                    <PriceText>ETH</PriceText>
                  </div>
                </div>
              </div>
            </div>
          </RightCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default Top;
