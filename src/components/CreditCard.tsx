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
  const CreditCard = ({card, selected}) => {
    const bgColor = card.title === 'visa' ? colors.themeColor : colors.black;
    return (
      <View style={[styles.container, {backgroundColor: bgColor}]}>
        <View style={styles.icon}>
          {card.title === 'visa' ? <Image source={require('../Images/visa.png')}></Image> : <Image source={require('../Images/master.png')} />}
        </View>
        <View style={styles.bodyContainer}>
        <Image source={require('../Images/password.png')}></Image> 
          <Text style={styles.text}>{card.number}</Text>
          <Image source={require('../Images/tickSquare.png')} style={styles.tick}></Image> 
        
        </View>
      </View>
    );
  };
  export default CreditCard;
  const styles = StyleSheet.create({
    container: {
      borderRadius: 16,
      paddingVertical: SCREEN_HEIGHT / 67,
      paddingHorizontal: SCREEN_WIDTH / 23,
      marginHorizontal: SCREEN_WIDTH / 37,
    },
    icon: {
      alignSelf: 'flex-end',
      marginTop: SCREEN_HEIGHT / 81,
    },
    text: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.white,
      marginStart: SCREEN_WIDTH / 47,
    },
    bodyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SCREEN_HEIGHT / 27,
    },
    tick: {
      marginStart: SCREEN_WIDTH / 23,
    },
  });