import { createContext, useContext } from 'react';

export const PortfolioStreamContext = createContext({
  portfolioData: {},
  loading: true,
  error: null,
});

export const usePortfolioStream = () => useContext(PortfolioStreamContext);
