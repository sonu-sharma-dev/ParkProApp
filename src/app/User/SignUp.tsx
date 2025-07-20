import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Headerx from "../../components/header";
import HttpService from '../../api/HttpService';
import { ENDPOINTS } from "@/src/api/endpoints";
import { ROLES } from '../../utils/constants'
import { AxiosError } from 'axios';

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function SignUp({ navigation }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleClick = async () => {
  if (name === "" || number === "" || email === "" || password === "") {
    alert("Please fill all the fields");
    return;
  }

  if (!/^\d{11}$/.test(number)) {
    alert("Phone number must be exactly 11 digits.");
    return;
  }

  try {
    const response = await HttpService.post(ENDPOINTS.AUTH.SIGNUP, {
      name: name,
      phoneNumber: number,
      email: email,
      password: password,
      role: ROLES.BUYER
    });

    alert("Registration Successful!");
    navigation.navigate("Login");
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 403) {
      alert("Email Address already registered!");
    } else {
      alert("Something went wrong. Please try again later.");
    }
  }
};



  return (
    <SafeAreaView style={styles.safeArea}>
      <Headerx navigation={navigation} headerName="Sign Up" />

      <View style={styles.container}>
        <Text style={styles.title}>Register as a Parking User</Text>

        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Name"
            placeholderTextColor="#ccc"
            onChangeText={(value) => setName(value)}
            value={name}
          />
        </View>

        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Contact Number</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Contact Number"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            onChangeText={(value) => setNumber(value)}
            value={number}
          />
        </View>

        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Email"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            onChangeText={(value) => setEmail(value)}
            value={email}
          />
        </View>

        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Password"
            placeholderTextColor="#ccc"
            secureTextEntry={true}
            onChangeText={(value) => setPassword(value)}
            value={password}
          />
        </View>

        <TouchableOpacity style={styles.signUpBtn} onPress={handleClick}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerText}>
            Already registered? <Text style={styles.loginText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 30,
  },
  inputView: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  TextInput: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    height: 50,
    paddingHorizontal: 15,
    color: "#000000",
  },
  signUpBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 30,
    height: 50,
    width: SCREEN_WIDTH / 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  signUpText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 30,
  },
  loginText: {
    color: "#0ea5e9",
    fontWeight: "bold",
  },
});
