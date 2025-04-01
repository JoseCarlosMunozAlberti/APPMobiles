import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';

export default function StatisticsScreen() {
  const { transactions, categories, accounts } = useApp();

  // Función para obtener el nombre de la categoría
  const getCategoryName = (categoryId: string | undefined) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  // Función para obtener el nombre de la cuenta
  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Cuenta desconocida';
  };

  // Calcular totales por tipo
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Agrupar transacciones por categoría
  const transactionsByCategory = transactions.reduce((acc, transaction) => {
    const categoryName = getCategoryName(transaction.category_id);
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar transacciones por cuenta
  const transactionsByAccount = transactions.reduce((acc, transaction) => {
    const accountName = getAccountName(transaction.account_id);
    if (!acc[accountName]) {
      acc[accountName] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[accountName].income += transaction.amount;
    } else if (transaction.type === 'expense') {
      acc[accountName].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryBox, styles.incomeBox]}>
            <Text style={styles.summaryLabel}>Ingresos Totales</Text>
            <Text style={[styles.summaryAmount, styles.incomeText]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryBox, styles.expenseBox]}>
            <Text style={styles.summaryLabel}>Gastos Totales</Text>
            <Text style={[styles.summaryAmount, styles.expenseText]}>
              ${totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryBox, styles.balanceBox]}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryAmount, styles.balanceText]}>
              ${(totalIncome - totalExpense).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Por Categoría</Text>
        {Object.entries(transactionsByCategory).map(([category, amount]) => (
          <View key={category} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{category}</Text>
            <Text style={styles.itemAmount}>${amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Por Cuenta</Text>
        {Object.entries(transactionsByAccount).map(([account, amounts]) => (
          <View key={account} style={styles.accountContainer}>
            <Text style={styles.accountName}>{account}</Text>
            <View style={styles.accountDetails}>
              <Text style={styles.incomeText}>+${amounts.income.toFixed(2)}</Text>
              <Text style={styles.expenseText}>-${amounts.expense.toFixed(2)}</Text>
              <Text style={styles.balanceText}>
                =${(amounts.income - amounts.expense).toFixed(2)}
              </Text>
            </View>
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
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBox: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  incomeBox: {
    backgroundColor: '#e8f5e9',
  },
  expenseBox: {
    backgroundColor: '#ffebee',
  },
  balanceBox: {
    backgroundColor: '#e3f2fd',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#2e7d32',
  },
  expenseText: {
    color: '#c62828',
  },
  balanceText: {
    color: '#1565c0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemLabel: {
    fontSize: 14,
    color: '#333',
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  accountContainer: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  accountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
