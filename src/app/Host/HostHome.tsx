import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Dashboard from "./Dashboard";
import Wallet from "../User/Wallet";
import Profile from "./profile";
import colors from "../commons/Colors";
import CreateParking from "./CreateParking";
import HostBookingPage from "./Bookings";

Feather.loadFont();
MaterialCommunityIcons.loadFont();

const Tab = createBottomTabNavigator();

export default function Home({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Dashboard") {
            return <Feather name="grid" size={size} color={color} />;
          } else if (route.name === "Wallet") {
            return (
              <MaterialCommunityIcons name="wallet" size={size} color={color} />
            );
          } else if (route.name === "Bookings") {
            return <Feather name="calendar" size={size} color={color} />;
          } else if (route.name === "Profile") {
            return <Feather name="user" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.themeColor,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Wallet" component={Wallet} />

      {/* Center '+' Tab */}
      <Tab.Screen
        name="Create"
        component={CreateParking}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.plusButton}>
              <Text style={styles.plusText}>+</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.customButton} />
          ),
        }}
      />

      <Tab.Screen name="Bookings" component={HostBookingPage} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  customButton: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.themeColor,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
  },
  plusText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    marginTop: -2,
  },
});
