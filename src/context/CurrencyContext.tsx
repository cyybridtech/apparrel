import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CurrencyCode = "GHS" | "USD" | "EUR" | "GBP" | "NGN";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromGHS: number; // 1 GHS to target
  label: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GHS: { code: "GHS", symbol: "GH₵", rateFromGHS: 1.0, label: "Ghanaian Cedi", flag: "🇬🇭" },
  USD: { code: "USD", symbol: "$", rateFromGHS: 0.082, label: "US Dollar", flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", rateFromGHS: 0.076, label: "Euro", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", rateFromGHS: 0.065, label: "British Pound", flag: "🇬🇧" },
  NGN: { code: "NGN", symbol: "₦", rateFromGHS: 130.0, label: "Nigerian Naira", flag: "🇳🇬" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (centsGHS: number) => string;
  convertPrice: (centsGHS: number) => number;
  availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "apparrel_currency_preference";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) return saved;
    } catch {}
    return "GHS";
  });

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem(STORAGE_KEY, code);
    }
  };

  const convertPrice = (centsGHS: number): number => {
    const baseGHS = centsGHS / 100;
    const rate = CURRENCIES[currency].rateFromGHS;
    return baseGHS * rate;
  };

  const formatPrice = (centsGHS: number): string => {
    const config = CURRENCIES[currency];
    const converted = convertPrice(centsGHS);

    if (currency === "GHS") {
      return `GH₵ ${converted.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === "USD") {
      return `$${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === "EUR") {
      return `€${converted.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === "GBP") {
      return `£${converted.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === "NGN") {
      return `₦${converted.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    return `${config.symbol} ${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        availableCurrencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
