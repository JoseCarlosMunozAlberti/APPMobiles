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

type IconName = 'work' | 'trending-up' | 'laptop' | 'attach-money';

const INCOME_CATEGORIES: Array<{
  id: string;
  icon: IconName;
  color: string;
}> = [
  { id: 'Salario', icon: 'work', color: '#2E7D32' },
  { id: 'Inversiones', icon: 'trending-up', color: '#1565C0' },
  { id: 'Freelance', icon: 'laptop', color: '#6A1B9A' },
  { id: 'Otros', icon: 'attach-money', color: '#666' }
];

export default function IncomeScreen() {
  const { transactions, addTransaction, deleteTransaction } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Filtrar ingresos del mes actual
  const currentMonthIncomes = transactions.filter(t => 
    t.type === 'income' && 
    new Date(t.date).getMonth() === new Date().getMonth()
  );

  // Calcular total de ingresos
  const totalIncome = currentMonthIncomes.reduce((sum, t) => sum + t.amount, 0);

  // Calcular ingresos por categoría
  const incomesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    currentMonthIncomes.forEach(income => {
      if (categories[income.category]) {
        categories[income.category] += income.amount;
      } else {
        categories[income.category] = income.amount;
      }
    });
    return categories;
  }, [currentMonthIncomes]);

  const handleAddIncome = () => {
    if (amount && category) {
      const newIncome = {
        id: Date.now().toString(),
        type: 'income' as const,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(),
      };
      addTransaction(newIncome);
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
          <Text style={styles.title}>Ingresos del Mes</Text>
          <Text style={styles.totalAmount}>S/. {totalIncome.toFixed(2)}</Text>
        </View>

        <View style={styles.categories}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.categoryGrid}>
            {INCOME_CATEGORIES.slice(0, -1).map(cat => (
              <View key={cat.id} style={styles.categoryCard}>
                <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
                <Text style={styles.categoryTitle}>{cat.id}</Text>
                <Text style={styles.categoryAmount}>
                  S/. {(incomesByCategory[cat.id] || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.transactions}>
          <Text style={styles.sectionTitle}>Últimos Ingresos</Text>
          {currentMonthIncomes.slice(0, 5).map(income => (
            <View key={income.id} style={styles.transactionItem}>
              <MaterialIcons
                name={
                  INCOME_CATEGORIES.find(cat => cat.id === income.category)?.icon ?? 'attach-money'
                }
                size={24}
                color={
                  INCOME_CATEGORIES.find(cat => cat.id === income.category)?.color || '#666'
                }
              />
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{income.description || income.category}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(income.date).toLocaleDateString('es-ES')}
                </Text>
              </View>
              <Text style={styles.transactionAmount}>+S/. {income.amount.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
                    deleteTransaction(income.id);
                  }
                }}
              >
                <MaterialIcons name="delete" size={20} color="#2E7D32" />
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
            <Text style={styles.modalTitle}>Nuevo Ingreso</Text>
            
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
                {INCOME_CATEGORIES.map(cat => (
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
                onPress={handleAddIncome}
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
    color: '#2E7D32',
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
    color: '#2E7D32',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2E7D32',
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
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
