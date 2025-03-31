import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: Date;
};

export default function HomeScreen() {
  const { transactions, account } = useApp();

  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
  
  const monthlyTransactions = transactions.filter((t: Transaction) => {
    const transDate = new Date(t.date);
    return transDate.getMonth() === new Date().getMonth();
  });

  const monthlyExpenses = monthlyTransactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

  const recentTransactions = transactions
    .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola!</Text>
        <Text style={styles.subtitle}>Resumen de {currentMonth}</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Balance Total</Text>
        <Text style={[styles.balanceAmount, { color: account.balance >= 0 ? '#4CAF50' : '#F44336' }]}>
          S/. {account.balance.toFixed(2)}
        </Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Salario Mensual</Text>
            <Text style={[styles.balanceItemAmount, styles.incomeColor]}>
              S/. {account.monthlySalary.toFixed(2)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Gastos del Mes</Text>
            <Text style={[styles.balanceItemAmount, styles.expenseColor]}>
              S/. {monthlyExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recentTransactions}>
        <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
        {recentTransactions.map((transaction: Transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{transaction.description || transaction.category}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' },
              ]}
            >
              {transaction.type === 'income' ? '+' : '-'}S/. {transaction.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceItemAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeColor: {
    color: '#4CAF50',
  },
  expenseColor: {
    color: '#F44336',
  },
  recentTransactions: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
