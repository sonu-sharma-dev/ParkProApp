// PaymentScreen.js
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import HttpService from '@/src/api/HttpService';
import { ENDPOINTS } from '@/src/api/endpoints';

const PaymentScreen = () => {
  const { createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);

  const handlePayPress = async () => {
    if (!cardDetails){
      Alert.alert('Please enter complete card details');
      return;
    }

  const { paymentMethod, error } = await createPaymentMethod({
    paymentMethodType: 'Card',
    billingDetails: { email: 'customer@example.com' },
  });


    if (error) {
      Alert.alert(error.message);
      return;
    }

    try {
      const response = await HttpService.post(ENDPOINTS.PAYMENT.MAKE_PAYMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: 5000, // e.g. $50.00 in cents
          customerId: 'cus_123456', // get this from your backend or user session
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Payment Success!', JSON.stringify(data));
      } else {
        Alert.alert('Payment failed', data.message || 'Unknown error');
      }
    } catch (e) {
      Alert.alert('Payment error', e.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
        style={{ height: 50, marginVertical: 30 }}
        onCardChange={(card) => setCardDetails(card)}
      />
      <Button title="Pay" onPress={handlePayPress} />
    </View>
  );
};

export default PaymentScreen;
