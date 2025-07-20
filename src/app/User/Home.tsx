import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FindParking from './FindParking';
import Wallet from './Wallet';
import Bookings from './bookings';
import Profile from './profile';
import colors from '../commons/Colors';

Feather.loadFont();
MaterialCommunityIcons.loadFont();

const Tab = createBottomTabNavigator();

export default function Home({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Find Parking') {
            iconName = 'map-pin';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'Wallet') {
            iconName = 'wallet';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Bookings') {
            iconName = 'calendar';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = 'user';
            return <Feather name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.themeColor,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Find Parking" component={FindParking} />
      <Tab.Screen name="Wallet" component={Wallet} />
      <Tab.Screen name="Bookings" component={Bookings} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
