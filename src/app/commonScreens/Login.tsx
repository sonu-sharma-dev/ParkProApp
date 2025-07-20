import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../Redux/UserSlice"; // Redux action
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ENDPOINTS } from "../../api/endpoints";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../commons/Colors";
import Headerx from "../../components/header";
import HttpService from "../../api/HttpService";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

interface UserData {
  token: string;
  userId: string;
  role: string;
  email: string;
  expiresIn: string;
}

const Login = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const storeData = async (value: UserData) => {
    try {
      await AsyncStorage.setItem("userdata", JSON.stringify(value));
      console.log("Stored user data:", value);
    } catch (e) {
      console.error("Error storing data", e);
    }
  };

  const handleClick = async () => {
    setErrorMessage(""); // Reset previous error

    if (email === "" || password === "") {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userData");

      const response = await HttpService.post(ENDPOINTS.AUTH.LOGIN, {
        email: email.trim(),
        password: password.trim(),
      });

      const { token, userId, role, name, expiresIn } = response.data;

      const userData = {
        token,
        userId,
        role,
        email: email.trim(),
        name,
        expiresIn,
      };


      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", userId.toString());
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await storeData(userData);
      dispatch(setUserData(userData));

      if (role === "SELLER") {
        navigation.navigate("HostHome");
      } else if (role === "BUYER") {
        navigation.navigate("Home");
      }
    } catch (error: any) {
      let message = "Incorrect Email or Password.";
      setErrorMessage(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Headerx headerName="Login" />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {/* Email Input */}
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Your Email"
            placeholderTextColor={colors.white}
            onChangeText={(value) => setEmail(value)}
            value={email}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter your Password"
            placeholderTextColor={colors.white}
            secureTextEntry={true}
            onChangeText={(value) => setPassword(value)}
            value={password}
          />
        </View>

        {/* Remember Me & Forgot Password */}
        <View style={styles.rememberMeContainer}>
          <Text style={styles.rememberMeText}>Remember me</Text>
          <TouchableOpacity onPress={() => navigation.push("ForgetPassword")}>
            <Text style={styles.forgotPassword}>Forget password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleClick}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Inline Error Message */}
        {errorMessage !== "" && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {/* Sign Up Option */}
        <TouchableOpacity onPress={() => navigation.push("SignUpOptions")}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.signupText}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 10,
  },
  subtitle: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 30,
  },
  inputView: {
    width: SCREEN_WIDTH / 1.2,
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
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SCREEN_WIDTH / 1.2,
    marginBottom: 20,
  },
  rememberMeText: {
    color: "#ffffff",
    marginLeft: 8,
  },
  forgotPassword: {
    color: "#ffffff",
    textDecorationLine: "underline",
  },
  loginBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 30,
    height: 50,
    width: SCREEN_WIDTH / 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  loginText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  footerText: {
    color: "#ffffff",
    fontSize: 14,
  },
  signupText: {
    color: "#0ea5e9",
    fontWeight: "bold",
  },
});

export default Login;
