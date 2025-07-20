import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,Image,
    TouchableWithoutFeedback,
  } from 'react-native';
  import React from 'react';
  import colors from '../app/commons/Colors';
  import {SCREEN_WIDTH,SCREEN_HEIGHT} from '../components/units';
//   import MasterIcon from '../../assets/svgs/master.svg';
//   import TickIcon from '../../assets/svgs/tickSquare.svg';
//   import PasswordIcon from '../../assets/svgs/password.svg';
//   import VisaIcon from '../../assets/svgs/visa.svg';
  const PaymentCard = ({onPress, selectedItem, item}) => {
    return (
        <View style={styles.paymentMethodContainer}>
          <View style={styles.bodyContainer}>
            <View style={styles.cardIconContainer}>
              {item.title === 'Credit Card' ? <Image source={require('../Images/masterCard.png')} /> :  <Image source={require('../Images/paypal.png')} />}
            </View>
            <Text style={styles.paymentMethodText}>{item.title}</Text>
          </View>
          <TouchableOpacity style={styles.radioButton} onPress={onPress}>
            {selectedItem === item.id && <Image source={require('../Images/dot.png')} />}
          </TouchableOpacity>
        </View>
      );
    };
    export default PaymentCard;
    const styles = StyleSheet.create({
      paymentMethodContainer: {
        marginTop: SCREEN_HEIGHT / 101,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      paymentMethodText: {
        fontSize: 16,
        color: colors.black,
        marginStart: SCREEN_WIDTH / 23,
      },
      radioButton: {
        borderWidth: 2,
        borderColor: colors.black,
        borderRadius: 100,
        justifyContent: 'center',
        minHeight: SCREEN_HEIGHT / 37,
        minWidth: SCREEN_WIDTH / 17,
        alignItems: 'center',
      },
      cardIconContainer: {
        borderRadius: 10,
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SCREEN_WIDTH / 47,
        paddingVertical: SCREEN_HEIGHT / 90,
      },
      bodyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    });