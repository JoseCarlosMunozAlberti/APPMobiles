import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Income = {
  id: string;
  amount: number;
  source: string;
  date: Date;
  description: string;
};

export default function IncomeScreen() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');

  const addIncome = () => {
    if (amount && source) {
      const newIncome: Income = {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        source,
        date: new Date(),
        description,
      };
      setIncomes([...incomes, newIncome]);
      // Limpiar campos
      setAmount('');
      setSource('');
      setDescription('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Ingreso</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Monto"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Fuente de ingreso"
          value={source}
          onChangeText={setSource}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.button} onPress={addIncome}>
          <Text style={styles.buttonText}>Agregar Ingreso</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.incomeItem}>
            <Text style={styles.incomeAmount}>S/. {item.amount}</Text>
            <Text style={styles.incomeSource}>{item.source}</Text>
            <Text style={styles.incomeDate}>
              {item.date.toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  incomeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  incomeAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4CAF50',
  },
  incomeSource: {
    color: '#666',
  },
  incomeDate: {
    color: '#999',
  },
});
