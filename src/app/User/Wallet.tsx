import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView,
  Dimensions, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import HttpService from '@/src/api/HttpService';
import { ENDPOINTS } from '@/src/api/endpoints';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../commons/Colors';

const STORAGE_KEY = '@saved_cards';
const { height, width } = Dimensions.get('window');

interface Card {
  id: string;
  email: string;
  name: string;
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  last4: string;
  brand: string;
}

const Wallet = () => {
  const { createPaymentMethod } = useStripe();
  const [email, setEmail] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [savedCards, setSavedCards] = useState<Card[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    try {
      const cardsJSON = await AsyncStorage.getItem(STORAGE_KEY);
      if (cardsJSON) {
        setSavedCards(JSON.parse(cardsJSON));
      } else {
        setSavedCards([]);
      }
    } catch (e) {
      console.error('Failed to load saved cards', e);
    }
  };

  const saveCardsToStorage = async (cards: Card[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save cards', e);
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
  const isNumeric = (str: string) => /^\d+$/.test(str);

  const handleAddCard = async () => {
    if (!email || !validateEmail(email)) {
      alert('Please enter a valid email.');
      return;
    }
    if (!nameOnCard.trim()) {
      alert('Please enter the name on the card.');
      return;
    }
    if (!cardNumber || !isNumeric(cardNumber) || cardNumber.length < 13 || cardNumber.length > 19) {
      alert('Please enter a valid card number (13-19 digits).');
      return;
    }
    if (!expMonth || !isNumeric(expMonth) || Number(expMonth) < 1 || Number(expMonth) > 12) {
      alert('Expiration month must be between 1 and 12.');
      return;
    }
    if (!expYear || !isNumeric(expYear) || expYear.length !== 4 || Number(expYear) < new Date().getFullYear()) {
      alert('Expiration year is invalid or in the past.');
      return;
    }
    if (Number(expYear) === new Date().getFullYear() && Number(expMonth) < new Date().getMonth() + 1) {
      alert('Expiration date cannot be in the past.');
      return;
    }
    if (!cvc || !isNumeric(cvc) || (cvc.length !== 3 && cvc.length !== 4)) {
      alert('Please enter a valid CVC (3 or 4 digits).');
      return;
    }

    const last4 = cardNumber.slice(-4);
    const cardExists = savedCards.some(card =>
      card.last4 === last4 &&
      card.exp_month === expMonth &&
      card.exp_year === expYear
    );
    if (cardExists) {
      alert('This card is already saved.');
      return;
    }

    const newCard: Card = {
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

    const billingDetails = {
      email: email,
      name: nameOnCard,
    };

    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      paymentMethodData: { billingDetails }
    });

    await HttpService.post(ENDPOINTS.PAYMENT.ADD_CARD, {
      paymentMethodId: paymentMethod?.id,
      email: email
    });

    const updatedCards = [...savedCards, newCard];
    setSavedCards(updatedCards);
    await saveCardsToStorage(updatedCards);

    setCardNumber('');
    setExpMonth('');
    setExpYear('');
    setCvc('');
    setEmail('');
    setNameOnCard('');
    alert('Card added successfully!');
    navigation.goBack();
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <Ionicons name="card" size={24} color="#fff" />
        <Text style={styles.cardBrand}>{item.brand}</Text>
      </View>
      <Text style={styles.cardNumber}>**** **** **** {item.last4}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardExpiry}>{item.exp_month}/{item.exp_year}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cards</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {savedCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No saved cards</Text>
            </View>
          ) : (
            <FlatList
              data={savedCards}
              keyExtractor={(item) => item.id}
              renderItem={renderCardItem}
              scrollEnabled={false}
              style={styles.cardsList}
            />
          )}

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Add New Card</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name on Card</Text>
              <TextInput
                placeholder="Enter name on card"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                onChangeText={setNameOnCard}
                value={nameOnCard}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                placeholder="Enter card number"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={19}
                onChangeText={setCardNumber}
                value={cardNumber}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Exp Month</Text>
                <TextInput
                  placeholder="MM"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={setExpMonth}
                  value={expMonth}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Exp Year</Text>
                <TextInput
                  placeholder="YYYY"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={setExpYear}
                  value={expYear}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                placeholder="Enter CVC"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={setCvc}
                value={cvc}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddCard}>
              <Text style={styles.submitButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: height * 0.3,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  cardsList: {
    marginBottom: 24,
  },
  cardItem: {
    backgroundColor: colors.themeColor,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    width: width - 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardBrand: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    color: '#fff',
    fontSize: 14,
  },
  cardExpiry: {
    color: '#fff',
    fontSize: 14,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.themeColor,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.themeColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Wallet;
