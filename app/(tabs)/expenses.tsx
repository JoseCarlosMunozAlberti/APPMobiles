import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Pressable,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

type IconName = 'restaurant' | 'home' | 'directions-car' | 'shopping-bag' | 'attach-money';

const EXPENSE_CATEGORIES: Array<{
  id: string;
  icon: IconName;
  color: string;
}> = [
  { id: 'Comida', icon: 'restaurant', color: '#C62828' },
  { id: 'Vivienda', icon: 'home', color: '#1565C0' },
  { id: 'Transporte', icon: 'directions-car', color: '#2E7D32' },
  { id: 'Compras', icon: 'shopping-bag', color: '#6A1B9A' },
  { id: 'Otros', icon: 'attach-money', color: '#666' }
];

export default function ExpensesScreen() {
  const { transactions, addTransaction, deleteTransaction } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Filtrar gastos del mes actual
  const currentMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    new Date(t.date).getMonth() === new Date().getMonth()
  );

  // Calcular total de gastos
  const totalExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Calcular gastos por categoría
  const expensesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    currentMonthExpenses.forEach(expense => {
      if (categories[expense.category]) {
        categories[expense.category] += expense.amount;
      } else {
        categories[expense.category] = expense.amount;
      }
    });
    return categories;
  }, [currentMonthExpenses]);

  const handleAddExpense = () => {
    if (amount && category) {
      const newExpense = {
        id: Date.now().toString(),
        type: 'expense' as const,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(),
      };
      addTransaction(newExpense);
      setModalVisible(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Gastos del Mes</Text>
          <Text style={styles.totalAmount}>S/. {totalExpenses.toFixed(2)}</Text>
        </View>

        <View style={styles.categories}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.slice(0, -1).map(cat => (
              <View key={cat.id} style={styles.categoryCard}>
                <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
                <Text style={styles.categoryTitle}>{cat.id}</Text>
                <Text style={styles.categoryAmount}>
                  S/. {(expensesByCategory[cat.id] || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.transactions}>
          <Text style={styles.sectionTitle}>Últimos Gastos</Text>
          {currentMonthExpenses.slice(0, 5).map(expense => (
            <View key={expense.id} style={styles.transactionItem}>
              <MaterialIcons
                name={
                  EXPENSE_CATEGORIES.find(cat => cat.id === expense.category)?.icon ?? 'attach-money'
                }
                size={24}
                color={
                  EXPENSE_CATEGORIES.find(cat => cat.id === expense.category)?.color ?? '#666'
                }
              />
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{expense.description || expense.category}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(expense.date).toLocaleDateString('es-ES')}
                </Text>
              </View>
              <Text style={styles.transactionAmount}>-S/. {expense.amount.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
                    deleteTransaction(expense.id);
                  }
                }}
              >
                <MaterialIcons name="delete" size={20} color="#C62828" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nuevo Gasto</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Monto"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.modalSubtitle}>Categoría:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {EXPENSE_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && { backgroundColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <MaterialIcons 
                      name={cat.icon as any} 
                      size={24} 
                      color={category === cat.id ? 'white' : cat.color} 
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat.id && { color: 'white' }
                    ]}>
                      {cat.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Descripción (opcional)"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonAdd]}
                onPress={handleAddExpense}
              >
                <Text style={styles.buttonText}>Añadir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#C62828',
    marginTop: 10,
  },
  categories: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  transactions: {
    backgroundColor: '#fff',
    padding: 20,
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
    color: '#C62828',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#C62828',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  categorySelector: {
    marginBottom: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: '#666',
  },
  buttonAdd: {
    backgroundColor: '#C62828',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
