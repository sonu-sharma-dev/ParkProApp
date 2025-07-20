import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import React from "react";
import colors from "../commons/Colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const SignUpOptions = ({ navigation }) => {
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        {/* Inline Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Sign Up Options</Text>
        </View>

        <Text
          style={{
            flex: 0.2,
            fontSize: SCREEN_WIDTH / 19,
            color: colors.black,
            fontWeight: "500",
            textAlign: "center",
            top: SCREEN_WIDTH / 7,
          }}
        >
          Who are
          <Text
            style={{
              color: colors.themeColor,
              fontWeight: "bold",
              fontSize: SCREEN_WIDTH / 11,
            }}
          >
            {" "}YOU?
          </Text>
        </Text>
        <View style={{ flex: 0.5, justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => navigation.navigate("HostSignUp")}>
            <View style={homecardstyles.container}>
              <Image
                resizeMode="contain"
                source={require("../../Images/host.webp")}
                borderTopLeftRadius={15}
                borderTopRightRadius={15}
                style={homecardstyles.image}
              />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              alignSelf: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: colors.themeColor,
            }}
          >
            Parking Owner
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <View style={homecardstyles.container2}>
              <Image
                resizeMode="contain"
                source={require("../../Images/spaceuser.png")}
                borderTopLeftRadius={15}
                borderTopRightRadius={15}
                style={homecardstyles.image}
              />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              alignSelf: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: colors.themeColor,
            }}
          >
            Parking User
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default SignUpOptions;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: colors.white,
    elevation: 4,
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
  },
});

const homecardstyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH / 2,
    borderRadius: 15,
    flexDirection: "row",
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    marginHorizontal: SCREEN_WIDTH / 46,
    alignSelf: "center",
    justifyContent: "center",
  },
  container2: {
    width: SCREEN_WIDTH / 2,
    borderRadius: 15,
    flexDirection: "row",
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    marginHorizontal: SCREEN_WIDTH / 46,
    alignSelf: "center",
    justifyContent: "center",
  },
  image: {
    height: SCREEN_HEIGHT / 6,
    width: SCREEN_WIDTH / 2,
  },
});
