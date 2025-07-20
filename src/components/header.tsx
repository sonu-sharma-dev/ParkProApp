import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import colors from '../app/commons/Colors';
import Icon from "react-native-vector-icons/FontAwesome";
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const Headerx = ({ headerName }) => {
  const navigation = useNavigation(); // Use the hook to access navigation
  
  return (
    <View style={styles.topContainer}>
      {navigation && navigation.openDrawer ? (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={20} color={colors.themeColor} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.themeColor} style={styles.backIcon} />
        </TouchableOpacity>
      )}

      <Text style={styles.topTitle}>{headerName}</Text>
      <View />
    </View>
  );
};

export default Headerx;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SCREEN_HEIGHT / 34,
    marginHorizontal: SCREEN_WIDTH / 16,
  },
  topTitle: {
    color: colors.themeColor,
    fontSize: SCREEN_WIDTH / 23,
    fontWeight: '500',
    textAlign: 'center',
  },
});
