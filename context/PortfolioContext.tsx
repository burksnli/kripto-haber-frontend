import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PortfolioHolding {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  quantity: number;
  averageBuyPrice: number;
  totalInvested: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
  total: number;
}

interface PortfolioContextType {
  holdings: PortfolioHolding[];
  addTransaction: (transaction: Omit<Transaction, 'id'>, coinData: { id: string; name: string; symbol: string }) => Promise<void>;
  removeHolding: (holdingId: string) => Promise<void>;
  getTotalInvested: () => number;
  getTotalValue: (prices: { [key: string]: number }) => number;
  getProfitLoss: (prices: { [key: string]: number }) => number;
  getProfitLossPercentage: (prices: { [key: string]: number }) => number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const stored = await AsyncStorage.getItem('portfolio');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHoldings(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      // Initialize with empty array on error
      setHoldings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const savePortfolio = async (newHoldings: PortfolioHolding[]) => {
    try {
      await AsyncStorage.setItem('portfolio', JSON.stringify(newHoldings));
      setHoldings(newHoldings);
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const addTransaction = async (
    transaction: Omit<Transaction, 'id'>,
    coinData: { id: string; name: string; symbol: string }
  ) => {
    const existingHolding = holdings.find(h => h.coinId === coinData.id);
    let updatedHoldings: PortfolioHolding[];

    if (existingHolding) {
      // Update existing holding
      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}`,
      };

      let newQuantity = existingHolding.quantity;
      let newTotalInvested = existingHolding.totalInvested;

      if (transaction.type === 'buy') {
        newQuantity += transaction.quantity;
        newTotalInvested += transaction.total;
      } else {
        newQuantity -= transaction.quantity;
        newTotalInvested -= (transaction.quantity * existingHolding.averageBuyPrice);
      }

      // If quantity is 0 or less, remove holding
      if (newQuantity <= 0) {
        updatedHoldings = holdings.filter(h => h.coinId !== coinData.id);
      } else {
        updatedHoldings = holdings.map(h =>
          h.coinId === coinData.id
            ? {
                ...h,
                quantity: newQuantity,
                totalInvested: newTotalInvested,
                averageBuyPrice: newTotalInvested / newQuantity,
                transactions: [...h.transactions, newTransaction],
              }
            : h
        );
      }
    } else {
      // Create new holding (only for buy)
      if (transaction.type === 'buy') {
        const newHolding: PortfolioHolding = {
          id: `holding_${Date.now()}`,
          coinId: coinData.id,
          coinName: coinData.name,
          coinSymbol: coinData.symbol,
          quantity: transaction.quantity,
          averageBuyPrice: transaction.price,
          totalInvested: transaction.total,
          transactions: [
            {
              ...transaction,
              id: `txn_${Date.now()}`,
            },
          ],
        };
        updatedHoldings = [...holdings, newHolding];
      } else {
        updatedHoldings = holdings;
      }
    }

    await savePortfolio(updatedHoldings);
  };

  const removeHolding = async (holdingId: string) => {
    const updated = holdings.filter(h => h.id !== holdingId);
    await savePortfolio(updated);
  };

  const getTotalInvested = () => {
    return holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  };

  const getTotalValue = (prices: { [key: string]: number }) => {
    return holdings.reduce((sum, h) => {
      const currentPrice = prices[h.coinId] || 0;
      return sum + (h.quantity * currentPrice);
    }, 0);
  };

  const getProfitLoss = (prices: { [key: string]: number }) => {
    const totalValue = getTotalValue(prices);
    const totalInvested = getTotalInvested();
    return totalValue - totalInvested;
  };

  const getProfitLossPercentage = (prices: { [key: string]: number }) => {
    const totalInvested = getTotalInvested();
    if (totalInvested === 0) return 0;
    return (getProfitLoss(prices) / totalInvested) * 100;
  };

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        addTransaction,
        removeHolding,
        getTotalInvested,
        getTotalValue,
        getProfitLoss,
        getProfitLossPercentage,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};
