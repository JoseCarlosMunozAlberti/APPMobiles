import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

export default function HomeScreen() {
  const { transactions } = useApp();

  // Filtrar transacciones del mes actual
  const currentMonth = new Date().getMonth();
  const currentMonthTransactions = transactions.filter(
    t => new Date(t.date).getMonth() === currentMonth
  );

  // Calcular totales
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Balance Total</Text>
        <Text style={styles.balanceAmount}>S/. {balance.toFixed(2)}</Text>
      </View>

      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
          <MaterialIcons name="arrow-upward" size={24} color="#2E7D32" />
          <Text style={styles.summaryTitle}>Ingresos</Text>
          <Text style={[styles.summaryAmount, { color: '#2E7D32' }]}>
            S/. {totalIncome.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
          <MaterialIcons name="arrow-downward" size={24} color="#C62828" />
          <Text style={styles.summaryTitle}>Gastos</Text>
          <Text style={[styles.summaryAmount, { color: '#C62828' }]}>
            S/. {totalExpenses.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.recentTransactions}>
        <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
        {transactions.slice(0, 5).map(transaction => (
          <View key={transaction.id} style={styles.transactionItem}>
            <MaterialIcons
              name={transaction.type === 'income' ? 'arrow-upward' : 'arrow-downward'}
              size={24}
              color={transaction.type === 'income' ? '#2E7D32' : '#C62828'}
            />
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>
                {transaction.description || transaction.category}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#2E7D32' : '#C62828' }
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  recentTransactions: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
