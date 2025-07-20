import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import HttpService from "@/src/api/HttpService";
import { ENDPOINTS } from "@/src/api/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MAIN_URL } from "@/src/api/constants";
import { colors } from "@/src/constants/colors";

interface ParkingData {
  id: number;
  title: string;
  address: string;
  charges: number;
  imageUrl?: string;
  hasRoof?: boolean;
  cctvAvailable?: boolean;
  isIndoor?: boolean;
}

interface Card {
  id: string;
  brand: string;
  last4: string;
  cvc?: string;
  exp_month: number;
  exp_year: number;
}

interface BookingResponse {
  slotNumber: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface ParkingSlots {
  total_slots: number;
  occupied_slots: number;
  available_slots: number;
  video_source: string;
}

const BookParking = ({ navigation, route }) => {
  const { parkingId } = route?.params || {};

  // Parking data state
  const [parkingData, setParkingData] = useState<ParkingData | null>(null);

  // Booking form state
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Payment state
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // UI state
  const [pickerMode, setPickerMode] = useState<"start" | "end">("start");
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "not_available" | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  const [parkingSlots, setParkingSlots] = useState<ParkingSlots | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (parkingId) {
      fetchParkingDetails(parkingId);
      fetchParkingSlots();
    }
  }, [parkingId]);

  useEffect(() => {
    if (startDateTime && endDateTime && endDateTime > startDateTime) {
      checkAvailability();
    } else {
      setAvailabilityStatus(null);
    }
  }, [startDateTime, endDateTime]);

  useEffect(() => {
    if (startDateTime && endDateTime && endDateTime > startDateTime && parkingData?.charges) {
      const diffInMs = endDateTime - startDateTime;
      const hours = diffInMs / (1000 * 60 * 60);
      const roundedHours = Math.ceil(hours);
      setTotalPrice(roundedHours * parkingData.charges);
    } else {
      setTotalPrice(0);
    }
  }, [startDateTime, endDateTime, parkingData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (activeStep === 2) {
        fetchSavedCards();
      }
    });

    return unsubscribe;
  }, [navigation, activeStep]);

  const fetchParkingDetails = async (id) => {
    try {
      const response = await HttpService.get(ENDPOINTS.PARKING.GET_BY_ID(id));
      setParkingData(response.data);
    } catch (error) {
      console.error("Failed to fetch parking data:", error);
      Alert.alert("Error", "Failed to load parking details.");
    }
  };

  const fetchSavedCards = async () => {
    try {
      const savedCardsJson = await AsyncStorage.getItem("@saved_cards");
      const savedCards = savedCardsJson ? JSON.parse(savedCardsJson) : [];
      setCards(savedCards);

      if (savedCards.length === 0) {
        Alert.alert(
          "No Payment Methods",
          "Please add a payment card first to proceed with booking.",
          [
            { text: "Cancel", onPress: () => setActiveStep(1) },
            { 
              text: "Add Card", 
              onPress: () => {
                navigation.navigate("Wallet", {
                  onCardAdded: () => {
                    // This callback will be called when returning from Wallet screen
                    fetchSavedCards();
                  }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Failed to fetch saved cards:", error);
    }
  };

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    setAvailabilityStatus(null);

    try {
      const response = await HttpService.get(ENDPOINTS.PARKING.CHECK_AVAILABILITY, {
        params: {
          parkingId: Number(parkingId),
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
        },
      });

      const data = response.data;
      if (data.available) {
        setAvailabilityStatus("available");
      } else {
        setAvailabilityStatus("not_available");
      }
    } catch (error) {
      console.error("Availability check failed:", error);
      Alert.alert("Error", "Failed to check parking availability.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const showDateTimePicker = (mode) => {
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const hideDateTimePicker = () => setPickerVisible(false);

  const handleConfirmDateTime = (datetime) => {
    if (pickerMode === "start") {
      const nowPlus2Hours = new Date(Date.now() + 2 * 60 * 60 * 1000);
      if (datetime < nowPlus2Hours) {
        Alert.alert(
          "Invalid Start Time",
          "Start time must be at least 2 hours from now."
        );
        hideDateTimePicker();
        return;
      }
      setStartDateTime(datetime);
      if (endDateTime && datetime >= endDateTime) setEndDateTime(null);
    } else {
      setEndDateTime(datetime);
    }
    hideDateTimePicker();
  };

  const formatDateTime = (date) => {
    if (!date) return "Select";
    return `${date.toDateString()} - ${formatTime(date)}`;
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
  };

  const getDurationText = () => {
    if (!(startDateTime && endDateTime && endDateTime > startDateTime)) return null;
    const durationMs = endDateTime - startDateTime;
    const totalMins = Math.floor(durationMs / (1000 * 60));
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs} hr${hrs !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
  };

  const validateBookingDetails = () => {
    if (!endDateTime) {
      Alert.alert("Select End Time", "Please select end date & time.");
      return false;
    }

    if (endDateTime <= startDateTime) {
      Alert.alert("Invalid Time", "End time must be after start time.");
      return false;
    }

    if (availabilityStatus !== "available") {
      Alert.alert("Not Available", "Selected time slot is not available.");
      return false;
    }

    if (!vehicleNumber.trim()) {
      Alert.alert("Missing Info", "Please enter your vehicle number.");
      return false;
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (validateBookingDetails()) {
      setActiveStep(2);
    }
  };

  const handlePayment = async () => {
    if (!selectedCard) {
      Alert.alert("Select Payment Method", "Please select a payment card.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // First make the payment
      const userId = await AsyncStorage.getItem("userId");
      const paymentMethodId = selectedCard?.id?.toString() ?? '1';
      const amountInCents = totalPrice * 100;

      const url = `${ENDPOINTS.PAYMENT.MAKE_PAYMENT}?paymentMethodId=${encodeURIComponent(paymentMethodId)}&amount=${amountInCents}&customerId=${encodeURIComponent(userId)}`;

      const paymentResponse = await HttpService.post(url);


      if (paymentResponse.status !== 200) {
        throw new Error("Payment failed");
      }

      // If payment succeeds, create the booking
      const bookingRequest = {
        userId: await AsyncStorage.getItem("userId"),
        parkingId: Number(parkingId),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalPrice,
        vehicleNumber: vehicleNumber.trim(),
        paymentId: paymentResponse.data.paymentId,
      };

      const bookingResponse = await HttpService.post(ENDPOINTS.BOOKINGS.CREATE_BOOKING, bookingRequest);
      setBookingResponse(bookingResponse.data);
      setBookingModalVisible(true);
    } catch (error) {
      console.error("Booking failed:", error);
      Alert.alert("Payment Failed", "We couldn't process your payment. Please try another card.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const fetchParkingSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await fetch(
        `${MAIN_URL}:8000/process-video`,
        {
          method: "POST",
          headers: { 
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch parking slots');
      }

      const data = await response.json();
      setParkingSlots(data as ParkingSlots);
    } catch (error) {
      console.error("Failed to fetch parking slots:", error);
      setParkingSlots(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  const renderParkingSlots = () => (
    <View style={styles.slotsContainer}>
      <Text style={styles.slotsTitle}>Real-time Parking Availability</Text>
      {loadingSlots ? (
        <ActivityIndicator size="small" color="#007BFF" />
      ) : parkingSlots ? (
        <View style={styles.slotsInfo}>
          <View style={styles.slotItem}>
            <Text style={styles.slotLabel}>Total Slots</Text>
            <Text style={styles.slotValue}>{parkingSlots.total_slots}</Text>
          </View>
          <View style={styles.slotItem}>
            <Text style={styles.slotLabel}>Available</Text>
            <Text style={[styles.slotValue, styles.availableSlots]}>
              {parkingSlots.available_slots}
            </Text>
          </View>
          <View style={styles.slotItem}>
            <Text style={styles.slotLabel}>Occupied</Text>
            <Text style={[styles.slotValue, styles.occupiedSlots]}>
              {parkingSlots.occupied_slots}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.slotsError}>Unable to fetch parking slots</Text>
      )}
    </View>
  );

  if (!parkingData?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => activeStep === 1 ? navigation.goBack() : setActiveStep(1)}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {activeStep === 1 ? "Booking Details" : "Payment"}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.stepsContainer}>
        <View style={[styles.step, activeStep === 1 && styles.activeStep]}>
          <Text style={[styles.stepText, activeStep === 1 && styles.activeStepText]}>1</Text>
          <Text style={[styles.stepLabel, activeStep === 1 && styles.activeStepLabel]}>Details</Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={[styles.step, activeStep === 2 && styles.activeStep]}>
          <Text style={[styles.stepText, activeStep === 2 && styles.activeStepText]}>2</Text>
          <Text style={[styles.stepLabel, activeStep === 2 && styles.activeStepLabel]}>Payment</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeStep === 1 ? (
          <View style={styles.stepContent}>
            <View style={styles.detailsCard}>
              <Text style={styles.label}>📍 Location</Text>
              <Text style={styles.info}>{parkingData.address || "-"}</Text>

              <Text style={styles.label}>🏢 Title</Text>
              <Text style={styles.info}>{parkingData.title || "-"}</Text>

              <Text style={styles.label}>💸 Price</Text>
              <Text style={styles.info}>PKR {parkingData.charges?.toFixed(2) || "0.00"} /hr</Text>

              <View style={styles.featuresContainer}>
                <Text style={styles.label}>Features</Text>
                <View style={styles.featuresList}>
                  {parkingData?.hasRoof && (
                    <View style={styles.featureBadge}>
                      <Ionicons name="umbrella-outline" size={16} color="#fff" />
                      <Text style={styles.featureText}>Roof</Text>
                    </View>
                  )}
                  {parkingData?.cctvAvailable && (
                    <View style={styles.featureBadge}>
                      <Ionicons name="videocam-outline" size={16} color="#fff" />
                      <Text style={styles.featureText}>CCTV</Text>
                    </View>
                  )}
                  {parkingData?.isIndoor && (
                    <View style={styles.featureBadge}>
                      <Ionicons name="home-outline" size={16} color="#fff" />
                      <Text style={styles.featureText}>Indoor</Text>
                    </View>
                  )}
                </View>
              </View>

              {renderParkingSlots()}

              {parkingData.imageUrl && parkingData.imageUrl.startsWith('file://') && (
                <Image
                  source={{ uri: parkingData.imageUrl }}
                  style={styles.parkingImage}
                  resizeMode="cover"
                  onError={() => {
                    // If image fails to load, don't show anything
                    parkingData.imageUrl = undefined;
                  }}
                />
              )}
            </View>

            <View style={styles.bookingCard}>
              <Text style={styles.confirmTitle}>Booking Details</Text>

              <Text style={styles.confirmDetail}>🚗 Vehicle Number:</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter vehicle number"
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                />
              </View>

              <TouchableOpacity
                onPress={() => showDateTimePicker("start")}
                style={styles.timePickerButton}
              >
                <Text style={styles.confirmDetail}>Start Time: {formatDateTime(startDateTime)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => showDateTimePicker("end")}
                style={styles.timePickerButton}
              >
                <Text style={styles.confirmDetail}>End Time: {formatDateTime(endDateTime)}</Text>
              </TouchableOpacity>

              {startDateTime && endDateTime && endDateTime > startDateTime && (
                <Text style={styles.confirmDetail}>⏳ Duration: {getDurationText()}</Text>
              )}

              <DateTimePickerModal
                isVisible={isPickerVisible}
                mode="datetime"
                onConfirm={handleConfirmDateTime}
                onCancel={hideDateTimePicker}
              />

              {checkingAvailability && (
                <ActivityIndicator size="small" color="#007BFF" style={{ marginTop: 10 }} />
              )}

              {availabilityStatus === "available" && (
                <Text style={{ color: "green", marginTop: 10, fontWeight: "600" }}>
                  ✅ Slot is available
                </Text>
              )}

              {availabilityStatus === "not_available" && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: "red", fontWeight: "600" }}>
                    ❌ Slot not available
                  </Text>
                </View>
              )}

              {totalPrice > 0 && (
                <Text style={[styles.confirmDetail, styles.totalPrice]}>
                  💵 Total Price: PKR {totalPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.stepContent}>
            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Select Payment Method</Text>

              {cards.length === 0 ? (
                <View style={styles.noCardsContainer}>
                  <Ionicons name="card-outline" size={48} color="#9CA3AF" style={styles.noCardsIcon} />
                  <Text style={styles.noCardsText}>No saved payment methods</Text>
                  <TouchableOpacity
                    style={styles.addCardButton}
                    onPress={() => {
                      navigation.navigate("Wallet", {
                        onCardAdded: () => {
                          // This callback will be called when returning from Wallet screen
                          fetchSavedCards();
                        }
                      });
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="white" style={styles.addCardIcon} />
                    <Text style={styles.addCardButtonText}>Add Payment Method</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView style={styles.cardsContainer}>
                  {cards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.cardItem,
                        selectedCard?.id === card.id && styles.selectedCardItem
                      ]}
                      onPress={() => setSelectedCard(card)}
                    >
                      <View style={styles.cardBrand}>
                        <Text style={styles.cardBrandText}>
                          {card.brand || "Card"}
                        </Text>
                      </View>
                      <Text style={styles.cardNumber}>
                        •••• •••• •••• {card.last4 ?? card.cvc}
                      </Text>
                      <Text style={styles.cardExpiry}>
                        Exp: {card.exp_month}/{card.exp_year}
                      </Text>
                      {selectedCard?.id === card.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#007BFF"
                          style={styles.cardCheck}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <View style={styles.paymentSummary}>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Parking:</Text>
                  <Text style={styles.summaryValue}>{parkingData.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Vehicle:</Text>
                  <Text style={styles.summaryValue}>{vehicleNumber}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration:</Text>
                  <Text style={styles.summaryValue}>{getDurationText()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total:</Text>
                  <Text style={[styles.summaryValue, styles.totalValue]}>
                    PKR {totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {activeStep === 1 ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              (availabilityStatus !== "available" ||
                !startDateTime ||
                startDateTime < new Date(Date.now() + 2 * 60 * 60 * 1000) ||
                !endDateTime ||
                endDateTime <= startDateTime ||
                !vehicleNumber.trim()) && { backgroundColor: "#ccc" }
            ]}
            onPress={handleProceedToPayment}
            disabled={
              availabilityStatus !== "available" ||
              !startDateTime ||
              startDateTime < new Date(Date.now() + 2 * 60 * 60 * 1000) ||
              !endDateTime ||
              endDateTime <= startDateTime ||
              !vehicleNumber.trim()
            }
          >
            <Text style={styles.actionButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.actionButton,
              (!selectedCard || isProcessingPayment) && { backgroundColor: "#ccc" }
            ]}
            onPress={handlePayment}
            disabled={!selectedCard || isProcessingPayment}
          >
            {isProcessingPayment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Pay PKR {totalPrice.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <AntDesign name="checkcircle" size={60} color="#4BB543" style={styles.successIcon} />
            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            {bookingResponse && (
              <>
                <Text style={styles.modalText}>
                  <Text style={styles.modalTextBold}>Slot:</Text> {bookingResponse.slotNumber}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalTextBold}>From:</Text> {formatDateTime(new Date(bookingResponse.startTime))}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalTextBold}>To:</Text> {formatDateTime(new Date(bookingResponse.endTime))}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalTextBold}>Amount:</Text> PKR {bookingResponse.price?.toFixed(2)}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setBookingModalVisible(false);
                navigation.navigate("Home", { screen: "Bookings" });
              }}
            >
              <Text style={styles.modalButtonText}>View Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    minHeight: Platform.OS === 'ios' ? 90 : 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 100,
    position: 'relative',
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 40,
    zIndex: 1,
  },
  activeStep: {
    backgroundColor: "#007BFF",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stepText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 16,
  },
  activeStepText: {
    color: "#fff",
  },
  stepLabel: {
    position: "absolute",
    top: 45,
    width: 120,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    left: -42,
  },
  activeStepLabel: {
    color: "#007BFF",
    fontWeight: "600",
  },
  stepConnector: {
    position: "absolute",
    top: 18,
    left: "50%",
    right: "50%",
    width: 120,
    height: 2,
    backgroundColor: "#E2E8F0",
    transform: [{ translateX: -60 }],
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContent: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 12,
    fontWeight: "500",
  },
  info: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 4,
  },
  parkingImage: {
    width: "100%",
    height: 180,
    marginTop: 16,
    borderRadius: 12,
  },
  bookingCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  paymentCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },
  confirmDetail: {
    fontSize: 16,
    marginTop: 10,
    color: "#334155",
    fontWeight: "500",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    color: "#007BFF",
  },
  timePickerButton: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputWrapper: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
  },
  input: {
    height: 48,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  noCardsContainer: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginVertical: 12,
  },
  noCardsIcon: {
    marginBottom: 20,
  },
  noCardsText: {
    fontSize: 17,
    color: "#64748B",
    marginBottom: 24,
    textAlign: "center",
  },
  addCardButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addCardIcon: {
    marginRight: 4,
  },
  addCardButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
  cardsContainer: {
    maxHeight: 320,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCardItem: {
    borderColor: "#007BFF",
    backgroundColor: "#F0F7FF",
  },
  cardBrand: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 16,
  },
  cardBrandText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
  },
  cardNumber: {
    flex: 1,
    fontSize: 17,
    color: "#1E293B",
    fontWeight: "600",
  },
  cardExpiry: {
    fontSize: 15,
    color: "#64748B",
    marginLeft: 16,
  },
  cardCheck: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  paymentSummary: {
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  totalValue: {
    fontSize: 18,
    color: "#007BFF",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#1E293B",
  },
  modalText: {
    fontSize: 17,
    marginVertical: 6,
    width: "100%",
    color: "#334155",
  },
  modalTextBold: {
    fontWeight: "700",
    color: "#1E293B",
  },
  modalButton: {
    marginTop: 28,
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 12,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  slotsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  slotsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  slotsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotItem: {
    flex: 1,
    alignItems: "center",
  },
  slotLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  slotValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  availableSlots: {
    color: "#059669",
  },
  occupiedSlots: {
    color: "#DC2626",
  },
  slotsError: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 14,
  },
  featuresContainer: {
    marginTop: 16,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default BookParking;