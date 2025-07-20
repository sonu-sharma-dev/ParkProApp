import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dataset from "./dataset"; // Importing dataset

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const ForgotPassword = ({ navigation }: { navigation: any }) => {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step to track the current UI stage

  const handleUsernameCheck = () => {
    if (!username) {
      alert("Please enter your username");
      return;
    }
  
    // Normalize input username to lowercase
    const normalizedUsername = username.toLowerCase();
  
    // Search both users and hosts arrays for the normalized username
    const userExists =
      (Array.isArray(dataset.users) &&
        dataset.users.some((user) => user.username.toLowerCase() === normalizedUsername)) ||
      (Array.isArray(dataset.hosts) &&
        dataset.hosts.some((host) => host.username.toLowerCase() === normalizedUsername));
  
    if (userExists) {
      setStep(2); // Proceed to the next step
    } else {
      alert("Username not available");
    }
  };
  
  

  const handleSave = () => {
    if (!oldPassword || !newPassword || !reNewPassword) {
      alert("Please fill all the fields");
      return;
    }

    if (newPassword !== reNewPassword) {
      alert("New passwords do not match");
      return;
    }

    // Perform the password update logic here (e.g., API call)
    alert("Password updated successfully!");

    // Navigate back to the Login page
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your username to continue</Text>

            <View style={styles.inputView}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.TextInput}
                placeholder="Enter your username"
                placeholderTextColor="#ccc"
                onChangeText={(value) => setUsername(value)}
                value={username}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUsernameCheck}>
              <Text style={styles.saveText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your details to reset your password
            </Text>

            <View style={styles.inputView}>
              <Text style={styles.inputLabel}>Old Password</Text>
              <TextInput
                style={styles.TextInput}
                placeholder="Enter your old password"
                placeholderTextColor="#ccc"
                secureTextEntry={true}
                onChangeText={(value) => setOldPassword(value)}
                value={oldPassword}
              />
            </View>
            <View style={styles.inputView}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.TextInput}
                placeholder="Enter your new password"
                placeholderTextColor="#ccc"
                secureTextEntry={true}
                onChangeText={(value) => setNewPassword(value)}
                value={newPassword}
              />
            </View>
            <View style={styles.inputView}>
              <Text style={styles.inputLabel}>Re-enter New Password</Text>
              <TextInput
                style={styles.TextInput}
                placeholder="Re-enter your new password"
                placeholderTextColor="#ccc"
                secureTextEntry={true}
                onChangeText={(value) => setReNewPassword(value)}
                value={reNewPassword}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        )}
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
  saveBtn: {
    backgroundColor: "#0ea5e9",
    borderRadius: 30,
    height: 50,
    width: SCREEN_WIDTH / 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ForgotPassword;
