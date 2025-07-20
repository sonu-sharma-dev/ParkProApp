import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import HttpService from '@/src/api/HttpService';
import { ENDPOINTS } from '@/src/api/endpoints';

const STORAGE_KEY = '@saved_cards';

const AddCardModal = ({ visible, onClose, onCardAdded }) => {
  const [email, setEmail] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');

  const { createPaymentMethod } = useStripe();

  const isNumeric = (str) => /^\d+$/.test(str);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  const handleAddCard = async () => {
    if (!email || !validateEmail(email)) return alert('Enter a valid email.');
    if (!nameOnCard.trim()) return alert('Enter name on card.');
    if (!cardNumber || !isNumeric(cardNumber) || cardNumber.length < 13 || cardNumber.length > 19)
      return alert('Invalid card number.');
    if (!expMonth || !isNumeric(expMonth) || Number(expMonth) < 1 || Number(expMonth) > 12)
      return alert('Invalid expiration month.');
    if (!expYear || !isNumeric(expYear) || expYear.length !== 4)
      return alert('Invalid expiration year.');
    if (!cvc || !isNumeric(cvc) || (cvc.length !== 3 && cvc.length !== 4))
      return alert('Invalid CVC.');

    const yearNum = Number(expYear);
    const currentYear = new Date().getFullYear();
    const monthNum = Number(expMonth);
    const currentMonth = new Date().getMonth() + 1;
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth))
      return alert('Expiration date cannot be in the past.');

    const last4 = cardNumber.slice(-4);
    const billingDetails = { email, name: nameOnCard };

    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      paymentMethodData: { billingDetails },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const response = await HttpService.post(ENDPOINTS.PAYMENT.ADD_CARD, {
      paymentMethodId: paymentMethod?.id,
      email,
    });

    const newCard = {
      id: 'local-' + Date.now(),
      email,
      name: nameOnCard,
      card_number: cardNumber,
      exp_month: expMonth,
      exp_year: expYear,
      cvc,
      last4,
      brand: 'VISA',
    };

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const currentCards = stored ? JSON.parse(stored) : [];
      const updatedCards = [...currentCards, newCard];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
      onCardAdded?.(newCard);
      Alert.alert('Success', 'Card added!');
      onClose();
      setEmail('');
      setNameOnCard('');
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCvc('');
    } catch (err) {
      console.error('Storage error:', err);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Add New Card</Text>

            <TextInput style={styles.input} placeholder="Name on Card" value={nameOnCard} onChangeText={setNameOnCard} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Card Number" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" maxLength={19} />
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Exp Month" value={expMonth} onChangeText={setExpMonth} keyboardType="number-pad" maxLength={2} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Exp Year" value={expYear} onChangeText={setExpYear} keyboardType="number-pad" maxLength={4} />
            </View>

            <TextInput style={styles.input} placeholder="CVC" value={cvc} onChangeText={setCvc} keyboardType="number-pad" maxLength={4} />

            <TouchableOpacity style={styles.button} onPress={handleAddCard}>
              <Text style={styles.buttonText}>Add Card</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={{ color: '#555' }}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddCardModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    color: '#000',
  },
  button: {
    backgroundColor: '#0192b1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
});
