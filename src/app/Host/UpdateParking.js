import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import HttpService from "@/src/api/HttpService";
import { ENDPOINTS } from "@/src/api/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from '../commons/Colors';

const UpdateParking = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { parking } = route.params;

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(parking.title || "");
  const [address, setAddress] = useState(parking.address || "");
  const [description, setDescription] = useState(parking.description || "");
  const [charges, setCharges] = useState(parking.charges.toString() || "");
  const [totalSlots, setTotalSlots] = useState(parking.totalSlots.toString() || "");
  const [hasRoof, setHasRoof] = useState(parking.hasRoof || false);
  const [cctvAvailable, setCctvAvailable] = useState(parking.cctvAvailable || false);
  const [isIndoor, setIsIndoor] = useState(parking.isIndoor || false);
  const [latitude, setLatitude] = useState(parking.latitude);
  const [longitude, setLongitude] = useState(parking.longitude);
  const [region, setRegion] = useState({
    latitude: parking.latitude,
    longitude: parking.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [image, setImage] = useState(parking.imageUrl || null);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  const showCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleNext = () => {
    if (!title || !address || !description || !charges || !totalSlots) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }
    if (isNaN(charges) || isNaN(totalSlots)) {
      Alert.alert("Error", "Charges and Total Slots must be numbers.");
      return;
    }
    setStep(2);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!latitude || !longitude) {
      Alert.alert("Error", "Location is required.");
      return;
    }

    const userId = await AsyncStorage.getItem("userId");

    const updatedData = {
      title,
      address,
      description,
      latitude,
      longitude,
      charges: parseFloat(charges),
      totalSlots: parseInt(totalSlots),
      hasRoof,
      cctvAvailable,
      isIndoor,
      imageUrl: image,
      ownerId: userId
    };

    try {
      await HttpService.put(`${ENDPOINTS.PARKING.UPDATE(parking.id)}`, updatedData);
      Alert.alert("Success", "Parking updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Update failed.");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? "Edit Parking Details" : "Update Location"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicatorContainer}>
        <View style={[styles.stepCircle, step === 1 && styles.stepActive]}>
          <Ionicons name="create-outline" size={16} color={step === 1 ? "#fff" : "#64748B"} />
        </View>
        <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
        <View style={[styles.stepCircle, step === 2 && styles.stepActive]}>
          <Ionicons name="location-outline" size={16} color={step === 2 ? "#fff" : "#64748B"} />
        </View>
      </View>

      {step === 1 ? (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="pricetag-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Title" 
              value={title} 
              onChangeText={setTitle}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Address" 
              value={address} 
              onChangeText={setAddress}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="cash-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Charges" 
                value={charges} 
                onChangeText={setCharges} 
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Ionicons name="car-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Total Slots" 
                value={totalSlots} 
                onChangeText={setTotalSlots} 
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
              <Ionicons name="image-outline" size={24} color="#fff" />
              <Text style={styles.imagePickerText}>
                {image ? "Change Image" : "Add Image"}
              </Text>
            </TouchableOpacity>

            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureLabel}>
                <Ionicons name="umbrella-outline" size={20} color="#64748B" />
                <Text style={styles.featureText}>Has Roof</Text>
              </View>
              <Switch 
                value={hasRoof} 
                onValueChange={setHasRoof}
                trackColor={{ false: "#E2E8F0", true: colors.themeColor }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureLabel}>
                <Ionicons name="videocam-outline" size={20} color="#64748B" />
                <Text style={styles.featureText}>CCTV Available</Text>
              </View>
              <Switch 
                value={cctvAvailable} 
                onValueChange={setCctvAvailable}
                trackColor={{ false: "#E2E8F0", true: colors.themeColor }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureLabel}>
                <Ionicons name="home-outline" size={20} color="#64748B" />
                <Text style={styles.featureText}>Is Indoor</Text>
              </View>
              <Switch 
                value={isIndoor} 
                onValueChange={setIsIndoor}
                trackColor={{ false: "#E2E8F0", true: colors.themeColor }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mapStepContainer}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              showsUserLocation
              onRegionChangeComplete={setRegion}
            >
              <Marker coordinate={{ latitude, longitude }} />
            </MapView>
            <TouchableOpacity style={styles.locateButton} onPress={showCurrentLocation}>
              <Ionicons name="navigate" size={24} color={colors.themeColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color={colors.themeColor} />
            <Text style={styles.locationText}>
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </Text>
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.updateButtonText}>Update Parking</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  stepActive: {
    borderColor: colors.themeColor,
    backgroundColor: colors.themeColor,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.themeColor,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  rowContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  imageSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.themeColor,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePickerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  featuresContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  featureLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.themeColor,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  mapStepContainer: {
    padding: 16,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.themeColor,
    paddingVertical: 16,
    borderRadius: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default UpdateParking;
