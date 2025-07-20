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
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useSelector } from "react-redux";
import { ENDPOINTS } from "../../api/endpoints";
import HttpService from "@/src/api/HttpService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from '../commons/Colors';

const CreateParking = () => {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();

  // Form states
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [charges, setCharges] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [hasRoof, setHasRoof] = useState(false);
  const [cctvAvailable, setCctvAvailable] = useState(false);
  const [isIndoor, setIsIndoor] = useState(false);

  // Location states
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Image picker state
  const [image, setImage] = useState(null);


  useEffect(() => {
    showCurrentLocation();
  }, []);

  // Back button handling
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  // Image picker handler
  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "Could not open image picker.");
    }
  };

  // Get current location and update map
  const showCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setLatitude(latitude);
    setLongitude(longitude);
  };

  // Map press to select location
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  // Validate step 1 inputs before next step
  const handleNext = () => {
    if (!title.trim() || !address.trim() || !description.trim() || !charges.trim() || !totalSlots.trim()) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }
    if (isNaN(charges) || isNaN(totalSlots)) {
      Alert.alert("Error", "Charges and Total Slots must be numeric.");
      return;
    }
    setStep(2);
  };

  // Submit final data
  const handleSubmit = async () => {
    if (!latitude || !longitude) {
      Alert.alert("Error", "Please select a location on the map.");
      return;
    }

    const userId = await AsyncStorage.getItem("userId");

    const data = {
      title: title.trim(),
      address: address.trim(),
      description: description.trim(),
      latitude,
      longitude,
      charges: parseFloat(charges),
      totalSlots: parseInt(totalSlots),
      hasRoof,
      cctvAvailable,
      isIndoor,
      imageUrl: image,
      ownerId: userId,
    };

    try {
      await HttpService.post(ENDPOINTS.PARKING.CREATE, data);
      Alert.alert("Success", "Parking created successfully!");

      // Reset form if you want:
      setTitle("");
      setAddress("");
      setDescription("");
      setCharges("");
      setTotalSlots("");
      setHasRoof(false);
      setCctvAvailable(false);
      setIsIndoor(false);
      setImage(null);
      setLatitude(null);
      setLongitude(null);
      setStep(1);

      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create parking.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 1 ? "Create Parking" : "Select Location"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, step === 1 && styles.stepActive]}>
              <Text style={[styles.stepNumber, step === 1 && styles.stepNumberActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>Details</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepWrapper}>
            <View style={[styles.stepCircle, step === 2 && styles.stepActive]}>
              <Text style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>Location</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Parking Title</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter parking title"
                    value={title}
                    onChangeText={setTitle}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter parking address"
                    value={address}
                    onChangeText={setAddress}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your parking facility"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Charges per Hour</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="cash" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      value={charges}
                      onChangeText={setCharges}
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>Total Slots</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="car" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter slots"
                      value={totalSlots}
                      onChangeText={setTotalSlots}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Features</Text>
                <View style={styles.featureItem}>
                  <View style={styles.featureInfo}>
                    <Ionicons name="umbrella" size={24} color="#64748B" />
                    <Text style={styles.featureLabel}>Has Roof</Text>
                  </View>
                  <Switch
                    value={hasRoof}
                    onValueChange={setHasRoof}
                    trackColor={{ false: "#E2E8F0", true: colors.themeColor }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureInfo}>
                    <Ionicons name="videocam" size={24} color="#64748B" />
                    <Text style={styles.featureLabel}>CCTV Available</Text>
                  </View>
                  <Switch
                    value={cctvAvailable}
                    onValueChange={setCctvAvailable}
                    trackColor={{ false: "#E2E8F0", true: colors.themeColor }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureInfo}>
                    <Ionicons name="home" size={24} color="#64748B" />
                    <Text style={styles.featureLabel}>Indoor Parking</Text>
                  </View>
                  <Switch
                    value={isIndoor}
                    onValueChange={setIsIndoor}
                    trackColor={{ false: "#E2E8F0", true: colors.themeColor }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              <View style={styles.imageSection}>
                <Text style={styles.label}>Parking Image</Text>
                <TouchableOpacity 
                  style={styles.imagePicker} 
                  onPress={handleImagePick}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={image ? "image" : "add-circle-outline"} 
                    size={24} 
                    color="#fff" 
                    style={styles.imagePickerIcon}
                  />
                  <Text style={styles.imagePickerText}>
                    {image ? "Change Image" : "Add Parking Image"}
                  </Text>
                </TouchableOpacity>

                {image && (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.preview} />
                    <TouchableOpacity 
                      style={styles.removeImage}
                      onPress={() => setImage(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Continue to Location</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={region}
                  onPress={handleMapPress}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  onRegionChangeComplete={setRegion}
                >
                  {latitude && longitude && (
                    <Marker 
                      coordinate={{ latitude, longitude }}
                      pinColor={colors.themeColor}
                    />
                  )}
                </MapView>

                <TouchableOpacity 
                  style={styles.locateButton} 
                  onPress={showCurrentLocation}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={24} color={colors.themeColor} />
                </TouchableOpacity>
              </View>

              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color="#64748B" />
                <Text style={styles.locationText}>
                  Selected Location:{" "}
                  <Text style={styles.locationCoordinates}>
                    {typeof latitude === "number" ? latitude.toFixed(4) : "N/A"},{" "}
                    {typeof longitude === "number" ? longitude.toFixed(4) : "N/A"}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Create Parking</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stepActive: {
    borderColor: colors.themeColor,
    backgroundColor: colors.themeColor,
  },
  stepNumber: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 14,
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.themeColor,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1E293B',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featuresContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 16,
    color: '#475569',
    marginLeft: 12,
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: colors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  imagePickerIcon: {
    marginRight: 8,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 16,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  nextButton: {
    backgroundColor: colors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
  },
  locationCoordinates: {
    color: '#1E293B',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CreateParking;
