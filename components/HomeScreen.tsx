import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
  const { transactions, loading, refreshTransactions } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  }, [refreshTransactions]);

  // Calcular totales del mes actual
  const currentDate = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = monthlyIncome - monthlyExpenses;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Balance del Mes</Text>
        <Text style={[styles.balanceAmount, balance >= 0 ? styles.positive : styles.negative]}>
          S/. {balance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryTitle}>Ingresos</Text>
          <Text style={[styles.summaryAmount, styles.incomeText]}>
            +S/. {monthlyIncome.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryTitle}>Gastos</Text>
          <Text style={[styles.summaryAmount, styles.expenseText]}>
            -S/. {monthlyExpenses.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Últimas Transacciones</Text>
        {currentMonthTransactions.length === 0 ? (
          <Text style={styles.emptyText}>No hay transacciones este mes</Text>
        ) : (
          currentMonthTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || 'Sin descripción'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeText : styles.expenseText,
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}S/. {transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  positive: {
    color: '#2E7D32',
  },
  negative: {
    color: '#C62828',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#2E7D32',
  },
  expenseText: {
    color: '#C62828',
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
