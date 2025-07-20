import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);

  const handleNext = () => {
    setCurrentPage((prevPage) => (prevPage % 3) + 1);
  };

  const handleSkip = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      {currentPage === 1 && (
        <View>
          <View style={styles.imageContainer}>
            <View style={styles.shadowSmall}></View>
            <View style={styles.shadowMedium}></View>
            <View style={styles.shadowLarge}></View>
            <View style={styles.lightEffect}></View>
            <Image
              source={require("../../Images/car1.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.subTitle}>Welcome to</Text>
            <Text style={styles.title}>Ai Powerd Parking System</Text>
          </View>
        </View>
      )}

      {currentPage === 2 && (
        <View>
          <View style={styles.imageContainerTop}>
            <Image
              source={require("../../Images/road.png")}
              style={styles.roadImage}
              resizeMode="stretch"
            />
            <Image
              source={require("../../Images/car1.png")}
              style={[styles.carImageOnRoad]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainerCenter}>
            <Text style={styles.subTitle}>Quick Navigation</Text>
            <Text style={styles.title}>Navigate seamlessly with ease</Text>
            <Image
              source={require("../../Images/map.png")}
              style={styles.mapImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {currentPage === 3 && (
        <View>
          <View style={styles.imageContainerTopRight}>
            <View style={styles.shadowSmall}></View>
            <View style={styles.shadowMedium}></View>
            <View style={styles.shadowLarge}></View>
            <View style={styles.lightEffect}></View>
            <Image
              source={require("../../Images/car1.png")}
              style={[styles.carImageTopRight, { transform: [{ rotate: "180deg" }] }]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainerCenter}>
            <Text style={styles.subTitle}>Easy Payment Method</Text>
            <Text style={styles.title}>Make transactions simple and fast</Text>
            <Image
              source={require("../../Images/easypayment.png")}
              style={styles.paymentImageCenter}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      <View style={styles.buttonContainerBottom}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainerRoadTop: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 30,
  },
  roadImage: {
    width: "100%",
    height: 200,
    position: "absolute",
    top: 0,
  },
  carImageOnRoad: {
    position: "absolute",
    top: 80,
    width: 150,
    height: 150,
    transform: [{ rotate: "270deg" }],
  },
  imageContainerTop: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },
  imageContainerTopRight: {
    position: "absolute",
    top: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  carImageTopRight: {
    width: 190,
    height: 120,
  },
  mapImage: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  paymentImageCenter: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  shadowSmall: {
    position: "absolute",
    width: 150,
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 75,
  },
  shadowMedium: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 100,
  },
  shadowLarge: {
    position: "absolute",
    width: 250,
    height: 250,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 125,
  },
  lightEffect: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "rgba(1, 156, 187, 0.2)",

    borderRadius: 100,
    top: 20,
    left: 50,
  },
  textContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  textContainerBottom: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    width: "100%",
  },
  textContainerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "Poppins-ExtraBold",
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "Poppins-SemiBold",
  },
  buttonContainerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 40,
    width: "100%",
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  nextButton: {
    backgroundColor: "#0192b1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

export default OnboardingScreen;
