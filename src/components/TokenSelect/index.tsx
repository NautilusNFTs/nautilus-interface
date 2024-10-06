import * as React from "react";
import { TokenType } from "../../types";
import Autocomplete from "../Autocomplete";
import { TOKEN_WVOI } from "@/contants/tokens";
interface SelectProps {
  onChange: (event: any, newValue: any, reason: any) => void;
  filter?: (c: any) => boolean;
  disabled?: boolean;
}
const Select: React.FC<SelectProps> = ({ onChange, filter = () => true }) => {
  return (
    <Autocomplete
      placeholder="Currency"
      onChange={onChange}
      options={tokens.filter(filter).map((t: any) => {
        return {
          label: `${t.name} : ${t.contractId}`,
          value: t,
        };
      })}
    />
  );
};
const tokens: readonly TokenType[] = [
  {
    contractId: 0,
    name: "Voi Network Token",
    symbol: "VOI",
    decimals: 6,
    totalSupply: "10000000000000000",
    creator: "",
    tokenId: `${TOKEN_WVOI}`,
    mintRound: 0,
    globalState: {},
  },
  /*
  {
    contractId: 0,
    name: "Wrapped Voi Network Token",
    symbol: "WVOI",
    decimals: 6,
    totalSupply: "10000000000000000",
    creator: "",
    tokenId: "",
    mintRound: 0,
    globalState: {},
  },
  */
];
export default Select;
