import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUserData } from '@/Redux/UserSlice';

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userdata');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          dispatch(setUserData(userData));

          if (userData.role === 'SELLER') {
            navigation.reset({ index: 0, routes: [{ name: 'HostHome' }] });
          } else if (userData.role === 'BUYER') {
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'OnBoarding' }] });
          }
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'OnBoarding' }] });
        }
      } catch (error) {
        dispatch(clearUserData());
        navigation.reset({ index: 0, routes: [{ name: 'OnBoarding' }] });
      }
    };

    checkUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.shadowLarge} />
      <View style={styles.shadowMedium} />
      <View style={styles.shadowSmall} />
      <View style={styles.innerCircle}>
        <Image source={require('../../Images/Logo.png')} style={styles.icon} />
      </View>
      {/* Loading indicator to show while checking */}
      <ActivityIndicator size="large" color="#0ea5e9" style={{ position: 'absolute', bottom: 50 }} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowLarge: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 125,
  },
  shadowMedium: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 100,
  },
  shadowSmall: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
    marginLeft: 4,
  },
});
