import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useApp } from '../../context/AppContext';
import { Picker } from '@react-native-picker/picker';

export default function IncomeScreen() {
  const { addTransaction, accounts, categories } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !selectedAccount || !selectedCategory) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'El monto debe ser un número positivo');
      return;
    }

    try {
      await addTransaction({
        type: 'income',
        amount: numericAmount,
        account_id: selectedAccount,
        category_id: selectedCategory,
        description,
        date: new Date().toISOString(),
        is_recurring: isRecurring,
        status: 'completed'
      });

      // Limpiar el formulario
      setAmount('');
      setDescription('');
      setSelectedAccount(accounts[0]?.id || '');
      setSelectedCategory('');
      setIsRecurring(false);
    } catch (error) {
      console.error('Error al agregar ingreso:', error);
      Alert.alert('Error', 'No se pudo registrar el ingreso');
    }
  };

  // Establecer la cuenta por defecto cuando se cargan las cuentas
  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);

  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Cuenta</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedAccount}
            onValueChange={setSelectedAccount}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona una cuenta" value="" />
            {accounts.map(account => (
              <Picker.Item 
                key={account.id} 
                label={`${account.name} (${account.balance} ${account.currency})`} 
                value={account.id} 
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={setSelectedCategory}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona una categoría" value="" />
            {incomeCategories.map(category => (
              <Picker.Item 
                key={category.id} 
                label={category.name} 
                value={category.id} 
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Monto</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Ingresa el monto"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ingresa una descripción"
          multiline
          numberOfLines={3}
        />

        <View style={styles.checkboxContainer}>
          <Text style={styles.label}>¿Es recurrente?</Text>
          <Button
            mode={isRecurring ? "contained" : "outlined"}
            onPress={() => setIsRecurring(!isRecurring)}
            style={styles.checkbox}
          >
            {isRecurring ? "Sí" : "No"}
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          Registrar Ingreso
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  checkbox: {
    width: 100,
  },
});
