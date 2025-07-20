import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import colors from '../commons/Colors';
import Headerx from '../../components/header';
import Icon from "react-native-vector-icons/FontAwesome";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const Settings = props => {
  return (
    <View style={styles.container}>
               
      <Headerx navigation={props?.navigation} headerName={'Settings'}></Headerx>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: 40,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            width: 170,
            height: 150,
            elevation: 20,
            alignItems: 'center',
            borderRadius: 15,
          }}>
          <Image
            style={{alignSelf: 'center', marginTop: 10}}
            source={require('../../Images/Icons8-user-shield-100.png')}></Image>
          <Text
            style={{
              color: colors.themeColor,
              fontSize: 15,
              fontWeight: '600',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            Privacy Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            width: 170,
            height: 150,
            elevation: 20,
            alignItems: 'center',
            borderRadius: 15,
          }}>
          <Image
            style={{alignSelf: 'center', marginTop: 10}}
            source={require('../../Images/Icons8-location-100.png')}></Image>
          <Text
            style={{
              color: colors.themeColor,
              fontSize: 15,
              fontWeight: '600',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            Location
          </Text>
        </TouchableOpacity>
        {/* <TextInput
          style={styles.TextInput}
          placeholder="Enter Your Desired Parking Radius"
          placeholderTextColor="#0192b1"
        /> */}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: 40,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            width: 170,
            height: 150,
            elevation: 20,
            alignItems: 'center',
            borderRadius: 15,
          }}>
          <Image
            style={{alignSelf: 'center', marginTop: 10}}
            source={require('../../Images/Icons8-male-user-100.png')}></Image>
          <Text
            style={{
              color: colors.themeColor,
              fontSize: 15,
              fontWeight: '600',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            width: 160,
            height: 150,
            elevation: 20,
            alignItems: 'center',
            borderRadius: 15,
          }}>
          <Image
            style={{alignSelf: 'center', marginTop: 10}}
            source={require('../../Images/Icons8-terms-and-conditions-100.png')}></Image>
          <Text
            style={{
              color: colors.themeColor,
              fontSize: 15,
              fontWeight: '600',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            Terms And conditions
          </Text>
        </TouchableOpacity>
        {/* <TextInput
      style={styles.TextInput}
      placeholder="Enter Your Desired Parking Radius"
      placeholderTextColor="#0192b1"
    /> */}
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },

  image: {
    marginBottom: 40,
  },
  inputView: {
    backgroundColor: colors.lightgray,
    borderRadius: 5,
    marginTop: 30,
    width: SCREEN_WIDTH / 1.2,
    height: SCREEN_HEIGHT / 15,
    marginLeft: SCREEN_WIDTH / 12,
    marginBottom: 20,
  },

  TextInput: {
    height: SCREEN_HEIGHT / 15,
    flex: 1,
    color: colors.themeColor,

    padding: SCREEN_HEIGHT / 50,
    marginLeft: 20,
  },

  SignUp: {
    height: SCREEN_HEIGHT - 630,
    marginBottom: 80,
    color: '#0192b1',
  },

  loginBtn: {
    width: '70%',
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
    top: 30,
    backgroundColor: '#0192b1',
  },
  loginBtn: {
    width: '70%',
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    left: SCREEN_WIDTH / 6.5,
    marginBottom: 70,
    top: 30,
    backgroundColor: '#0192b1',
  },

  st: {
    color: '#00cca3',
    fontSize: 20,
    marginRight: 140,
  },
  st1: {
    color: '#00cca3',
    fontSize: 20,
    marginRight: 170,
  },
  loginText: {
    color: '#fff',
  },
});
