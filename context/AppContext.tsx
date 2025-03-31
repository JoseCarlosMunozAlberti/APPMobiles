import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: Date;
};

type UserAccount = {
  monthlySalary: number;
  balance: number;
  lastSalaryDate?: Date;
};

type AppContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  account: UserAccount;
  setMonthlySalary: (amount: number) => void;
  updateBalance: (amount: number) => void;
};

const AppContext = createContext<AppContextType | null>(null);

const TRANSACTIONS_STORAGE_KEY = '@app_transactions';
const ACCOUNT_STORAGE_KEY = '@app_account';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState<UserAccount>({
    monthlySalary: 0,
    balance: 0
  });

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar transacciones
      const savedTransactions = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions);
        const transactionsWithDates = parsedTransactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(transactionsWithDates);
      }

      // Cargar datos de la cuenta
      const savedAccount = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (savedAccount) {
        const parsedAccount = JSON.parse(savedAccount);
        setAccount({
          ...parsedAccount,
          lastSalaryDate: parsedAccount.lastSalaryDate ? new Date(parsedAccount.lastSalaryDate) : undefined
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveAccount = async (newAccount: UserAccount) => {
    try {
      await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(newAccount));
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(newTransactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const setMonthlySalary = (amount: number) => {
    const newAccount = { ...account, monthlySalary: amount };
    setAccount(newAccount);
    saveAccount(newAccount);
  };

  const updateBalance = (amount: number) => {
    const newAccount = { ...account, balance: amount };
    setAccount(newAccount);
    saveAccount(newAccount);
  };

  const addTransaction = (transaction: Transaction) => {
    // Actualizar transacciones
    const newTransactions = [...transactions, transaction];
    setTransactions(newTransactions);
    saveTransactions(newTransactions);

    // Actualizar el balance
    const newBalance = transaction.type === 'income' 
      ? account.balance + transaction.amount
      : account.balance - transaction.amount;
    updateBalance(newBalance);

    // Si es un ingreso de tipo salario, actualizar la fecha del último salario
    if (transaction.type === 'income' && transaction.category === 'Salario') {
      const newAccount = { 
        ...account, 
        balance: newBalance,
        lastSalaryDate: new Date()
      };
      setAccount(newAccount);
      saveAccount(newAccount);
    }
  };

  const deleteTransaction = (id: string) => {
    // Encontrar la transacción a eliminar
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Actualizar el balance
    const newBalance = transaction.type === 'income'
      ? account.balance - transaction.amount
      : account.balance + transaction.amount;
    updateBalance(newBalance);

    // Eliminar la transacción
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        transactions,
        addTransaction,
        deleteTransaction,
        account,
        setMonthlySalary,
        updateBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
