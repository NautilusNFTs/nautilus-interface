import React, { ChangeEvent } from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

export const defaultCurrencies = [{ value: "0", label: "VOI" }];

interface PaymentCurrencyRadioProps {
  selectedValue: string;
  onCurrencyChange: (newCurrency: string) => void;
  currencies?: { value: string; label: string }[];
  disabled?: boolean;
}

const PaymentCurrencyRadio: React.FC<PaymentCurrencyRadioProps> = ({
  selectedValue,
  onCurrencyChange,
  currencies = defaultCurrencies,
  disabled = false,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCurrencyChange(event.target.value);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Payment Currency</FormLabel>
      <RadioGroup
        aria-label="payment-currency"
        name="payment-currency"
        value={selectedValue}
        onChange={handleChange}
      >
        {currencies.map((currency) => (
          <FormControlLabel
            key={currency.value}
            value={currency.value}
            control={<Radio disabled={disabled} />}
            label={currency.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default PaymentCurrencyRadio;
