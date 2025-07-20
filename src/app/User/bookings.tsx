import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HttpService from "@/src/api/HttpService";
import { ENDPOINTS } from "@/src/api/endpoints";
import { MAIN_URL } from "@/src/api/constants";

const STATUS_FILTERS = [
  { id: "All", label: "All" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "COMPLETED", label: "Completed" }
];

interface Booking {
  bookingId: string;
  status: string;
  startTime: string;
  endTime: string;
  vehicleNumber: string;
  slotNumber: string;
  price: number;
  parkingAddress: string;
  parking?: {
    address: string;
  };
  latitude?: number;
  longitude?: number;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerName?: string;
}

interface VehicleDetails {
  plate: string;
  confidence: number | string;
}

interface OwnerDetails {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
}

const BookingScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [contactOwnerModalVisible, setContactOwnerModalVisible] = useState(false);
  const [contactOwnerDetails, setContactOwnerDetails] = useState<OwnerDetails | null>(null);
  const [filter, setFilter] = useState("All");

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Your Bookings",
    });
  }, [navigation]);


  useEffect(() => {
    const fetchBookings = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      try {
        setLoading(true);
        const response = await HttpService.get(
          ENDPOINTS.BOOKINGS.GET_BY_USER(userId)
        );
        console.log("booking", response)
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Do you really want to cancel this booking?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);
              await HttpService.put(ENDPOINTS.BOOKINGS.CANCEL(bookingId));

              Alert.alert("Success", `Booking#${bookingId} cancelled.`);

              const userId = await AsyncStorage.getItem("userId");
              if (!userId) return;
              const response = await HttpService.get(
                ENDPOINTS.BOOKINGS.GET_BY_USER(userId)
              );
              setBookings(response.data);
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert(
                "Error",
                "Failed to cancel booking. Please try again later."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCheckIn = async (booking) => {
    try {
      setCheckingIn(true);
      const ocrResponse = await fetch(
        `${MAIN_URL}:8001/process-video`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (!ocrResponse.ok) throw new Error("Failed to process video");
      const ocrData = await ocrResponse.json();

      const logPayload = {
        bookingId: booking.bookingId,
        detectedNumberPlateEasyOCR: ocrData["Detected Number Plate (EasyOCR)"] || [],
        confidenceScoresEasyOCR: ocrData["Confidence Scores (EasyOCR)"] || [],
        detectedNumberPlateCustom: ocrData["Detected Number Plate (Custom)"] || [],
        confidenceScoresCustom: ocrData["Confidence Scores (Custom)"] || [],
      };

      const normalizePlate = (plate) =>
        plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();

      const allowedVehicle = normalizePlate(booking.vehicleNumber || "");

      let matchedPlate = null;

      const isMatchFound =
        logPayload.detectedNumberPlateCustom.some((plate) => {
          const normalized = normalizePlate(plate);
          const match = allowedVehicle.includes(normalized);
          if (match) matchedPlate = normalized;
          return match;
        }) ||
        logPayload.detectedNumberPlateEasyOCR.some((plate) => {
          const normalized = normalizePlate(plate);
          const match = allowedVehicle.includes(normalized);
          if (match) matchedPlate = normalized;
          return match;
        });

      if (isMatchFound) {
        setVehicleDetails({
          plate: matchedPlate || "Not detected",
          confidence:
            logPayload.confidenceScoresEasyOCR.length > 0
              ? logPayload.confidenceScoresEasyOCR[0]
              : "N/A",
        });
        setModalVisible(true);
        const response = await HttpService.put(ENDPOINTS.BOOKINGS.CONFIRM(booking.bookingId, matchedPlate));

      } else {
        console.log("number plate: ")
        const response = await HttpService.put(ENDPOINTS.BOOKINGS.UNMATCHED_CHECK(booking.bookingId, logPayload.detectedNumberPlateEasyOCR + ","+ logPayload.detectedNumberPlateCustom));
        Alert.alert("Mismatch", "Can not check in as plate number does not match..");
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      Alert.alert("Error", "Something went wrong during check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  const openMaps = (latitude, longitude) => {
    const lat = latitude;
    const lng = longitude;
    const label = "Parking Location";

    let url = "";

    if (Platform.OS === "ios") {
      url = `maps:0,0?q=${lat},${lng}(${label})`;
    } else {
      url = `geo:0,0?q=${lat},${lng}(${label})`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const browser_url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          return Linking.openURL(browser_url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const openEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openPhone = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredBookings =
    filter === "All"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  const showContactOwnerModal = (owner) => {
    setContactOwnerDetails(owner);
    setContactOwnerModalVisible(true);
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const location = item.parkingAddress || item.parking?.address || "Unknown";
    const date = new Date(item.startTime).toLocaleDateString();
    const endDate = new Date(item.endTime).toLocaleDateString();
    const startTime = new Date(item.startTime).toLocaleTimeString();
    const endTime = new Date(item.endTime).toLocaleTimeString();
    const price = item.price || 0;
    const slot = item.slotNumber || "N/A";
    const now = new Date();
    const start = new Date(item.startTime);
    const hoursDifference = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

    const owner = item.ownerEmail || item.ownerPhone || item.ownerName
      ? {
          name: item.ownerName || null,
          email: item.ownerEmail || null,
          phoneNumber: item.ownerPhone || null,
        }
      : null;

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#2563EB" />
            <Text style={styles.location} numberOfLines={1}>{location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status).backgroundColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {date} - {endDate}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {startTime} - {endTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="car" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Slot #{slot}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Rs {price}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() =>
              Alert.alert(
                "Booking Details",
                `Status: ${item.status}\nVehicle: ${item.vehicleNumber}\nSlot #: ${slot}\nStart: ${new Date(
                  item.startTime
                ).toLocaleString()}\nEnd: ${new Date(item.endTime).toLocaleString()}\nPrice: Rs ${price}\nAddress: ${location}`
              )
            }
          >
            <Ionicons name="information-circle" size={16} color="white" />
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>

          {hoursDifference > 24 && item.status === "CONFIRMED" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(item.bookingId)}
            >
              <Ionicons name="close-circle" size={16} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {item.status !== "CANCELLED" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkinButton]}
              onPress={() => handleCheckIn(item)}
              disabled={checkingIn}
            >
              {checkingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in" size={16} color="white" />
                  <Text style={styles.buttonText}>Check-in</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {(item.latitude && item.longitude) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.mapsButton]}
              onPress={() => openMaps(item.latitude, item.longitude)}
            >
              <Ionicons name="map" size={16} color="white" />
              <Text style={styles.buttonText}>Maps</Text>
            </TouchableOpacity>
          )}

          {owner && (
            <TouchableOpacity
              style={[styles.actionButton, styles.contactButton]}
              onPress={() => showContactOwnerModal(owner)}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text style={styles.buttonText}>Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { backgroundColor: "#10B981", color: "white" };
      case "CANCELLED":
        return { backgroundColor: "#EF4444", color: "white" };
      case "COMPLETED":
        return { backgroundColor: "#6B7280", color: "white" };
      default:
        return { backgroundColor: "#6B7280", color: "white" };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {STATUS_FILTERS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterButton,
                filter === item.id && styles.filterButtonActive
              ]}
              onPress={() => setFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.id && styles.filterTextActive
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar" size={48} color="#9CA3AF" />
          <Text style={styles.noBookingText}>No bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.bookingId.toString()}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Vehicle Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vehicle Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.modalDetailRow}>
                <Ionicons name="car" size={20} color="#2563EB" />
                <Text style={styles.modalDetailText}>
                  Number Plate: {vehicleDetails?.plate || "N/A"}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Ionicons name="stats-chart" size={20} color="#2563EB" />
                <Text style={styles.modalDetailText}>
                  Confidence: {vehicleDetails?.confidence || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Owner Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactOwnerModalVisible}
        onRequestClose={() => setContactOwnerModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Owner</Text>
              <TouchableOpacity onPress={() => setContactOwnerModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.modalDetailRow}>
                <Ionicons name="person" size={20} color="#2563EB" />
                <Text style={styles.modalDetailText}>
                  Name: {contactOwnerDetails?.name || "N/A"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalDetailRow}
                onPress={() => contactOwnerDetails?.email && openEmail(contactOwnerDetails.email)}
              >
                <Ionicons name="mail" size={20} color="#2563EB" />
                <Text style={[styles.modalDetailText, styles.linkText]}>
                  Email: {contactOwnerDetails?.email || "N/A"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDetailRow}
                onPress={() => contactOwnerDetails?.phoneNumber && openPhone(contactOwnerDetails.phoneNumber)}
              >
                <Ionicons name="call" size={20} color="#2563EB" />
                <Text style={[styles.modalDetailText, styles.linkText]}>
                  Phone: {contactOwnerDetails?.phoneNumber || "N/A"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  filterWrapper: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    height: 56,
  },
  filterScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%",
  },
  filterButton: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  filterButtonActive: {
    backgroundColor: "#2563EB",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  filterTextActive: {
    color: "white",
  },
  listContainer: {
    padding: 10,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  location: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  bookingDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewButton: {
    backgroundColor: "#2563EB",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  checkinButton: {
    backgroundColor: "#10B981",
  },
  mapsButton: {
    backgroundColor: "#2563EB",
  },
  contactButton: {
    backgroundColor: "#6B7280",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noBookingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalContent: {
    gap: 16,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalDetailText: {
    fontSize: 16,
    color: "#374151",
  },
  linkText: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
});

export default BookingScreen;
