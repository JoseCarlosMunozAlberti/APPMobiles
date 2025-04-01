import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../../context/AppContext';

export default function ExpensesScreen() {
  const { addTransaction, loading } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddExpense = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Por favor ingresa el monto y la categoría');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    try {
      setIsSaving(true);
      await addTransaction({
        type: 'expense',
        amount: numAmount,
        category,
        description,
        date: new Date().toISOString(),
        is_recurring: false,
        status: 'completed'
      });
      
      // Limpiar el formulario
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (error) {
      console.error('Error al agregar gasto:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Gasto</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!isSaving}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoría</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Comida, Transporte"
            value={category}
            onChangeText={setCategory}
            editable={!isSaving}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agrega una descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            editable={!isSaving}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleAddExpense}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrar Gasto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d32f2f',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
