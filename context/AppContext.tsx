import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings' | 'investment';
  balance: number;
  currency: string;
};

export type Category = {
  id: string;
  user_id?: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  is_default: boolean;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  date: string;
  is_recurring: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'cancelled';
};

type AppContextType = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'balance'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'is_default'>) => Promise<void>;
  loading: boolean;
  refreshData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  const loadAccounts = async () => {
    try {
      if (!user || !session) return;

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      Alert.alert('Error', 'No se pudieron cargar las cuentas');
    }
  };

  const loadCategories = async () => {
    try {
      if (!user || !session) return;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`is_default.eq.true,user_id.eq.${user.id}`)
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    }
  };

  const loadTransactions = async () => {
    try {
      if (!user || !session) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      loadAccounts(),
      loadCategories(),
      loadTransactions()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && session) {
      refreshData();
    } else {
      setAccounts([]);
      setCategories([]);
      setTransactions([]);
      setLoading(false);
    }
  }, [user, session]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    try {
      if (!user || !session) {
        throw new Error('Usuario no autenticado');
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sesión expirada');
      }

      const newTransaction = {
        ...transaction,
        user_id: user.id,
      };

      console.log('Intentando agregar transacción:', newTransaction);

      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error('Error al insertar transacción:', error);
        throw error;
      }

      // Actualizar el balance de la cuenta
      const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: accounts.find(a => a.id === transaction.account_id)!.balance + amount })
        .eq('id', transaction.account_id);

      if (updateError) {
        console.error('Error al actualizar balance:', updateError);
        throw updateError;
      }

      await refreshData();
      Alert.alert('Éxito', 'Transacción agregada correctamente');
    } catch (error: any) {
      console.error('Error detallado al agregar transacción:', error);
      Alert.alert('Error', 'No se pudo agregar la transacción: ' + (error.message || error.error_description || 'Error desconocido'));
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      if (!user || !session) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await refreshData();
      Alert.alert('Éxito', 'Transacción actualizada correctamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la transacción');
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!user || !session) throw new Error('Usuario no autenticado');

      const transaction = transactions.find(t => t.id === id);
      if (!transaction) throw new Error('Transacción no encontrada');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Revertir el balance de la cuenta
      const amount = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: accounts.find(a => a.id === transaction.account_id)!.balance + amount })
        .eq('id', transaction.account_id);

      if (updateError) throw updateError;

      await refreshData();
      Alert.alert('Éxito', 'Transacción eliminada correctamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo eliminar la transacción');
      console.error('Error deleting transaction:', error);
    }
  };

  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'balance'>) => {
    try {
      if (!user || !session) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...account, user_id: user.id, balance: 0 }])
        .select()
        .single();

      if (error) throw error;

      await loadAccounts();
      Alert.alert('Éxito', 'Cuenta agregada correctamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo agregar la cuenta');
      console.error('Error adding account:', error);
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      if (!user || !session) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadAccounts();
      Alert.alert('Éxito', 'Cuenta actualizada correctamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la cuenta');
      console.error('Error updating account:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      if (!user || !session) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadAccounts();
      Alert.alert('Éxito', 'Cuenta eliminada correctamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo eliminar la cuenta');
      console.error('Error deleting account:', error);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'is_default'>) => {
    try {
      if (!user || !session) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id, is_default: false }])
        .select()
        .single();

      if (error) throw error;

      await loadCategories();
      Alert.alert('Éxito', 'Categoría agregada correctamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo agregar la categoría');
      console.error('Error adding category:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        loading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
