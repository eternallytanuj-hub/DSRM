'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type AppState = {
  epoch: number;
  wallet: string;
  latency: number;
};

type AppContextType = {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
};

const defaultState: AppState = {
  epoch: 1718293440,
  wallet: '0x7F...3B9A',
  latency: 24,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const updateState = (newState: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
