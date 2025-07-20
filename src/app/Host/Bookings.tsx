import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Linking,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from '../commons/Colors';

import HttpService from "@/src/api/HttpService";
import { ENDPOINTS } from "@/src/api/endpoints";

const { width } = Dimensions.get('window');

const STATUS_FILTERS = ["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"];
const DATE_FILTERS = ["ALL", "TODAY", "YESTERDAY", "LAST_7_DAYS"];

interface Booking {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleNumber: string;
  slotNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  parkingName: string;
  parkingAddress: string;
  createdDate: string;
}

interface VehicleLog {
  plateNumber: string;
  detectedAt: string;
  matchedBookingStatus: 'MATCHED' | 'UNMATCHED' | 'PENDING_REVIEW';
}

export default function HostBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [parkingId, setParkingId] = useState<number | null>(null);

  const route = useRoute();

  useEffect(() => {
    // Get parkingId from route params if it exists
    const params = route.params as { parkingId?: number };
    if (params?.parkingId) {
      setParkingId(params.parkingId);
    }
  }, [route.params]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        let response;
        
        if (parkingId) {
          // If parkingId exists, fetch bookings for specific parking
          response = await HttpService.get(ENDPOINTS.BOOKINGS.GET_BY_PARKING(parkingId));
        } else {
          // Otherwise fetch all bookings for the user
          response = await HttpService.get(ENDPOINTS.BOOKINGS.GET_BY_OWNER(userId));
        }
        
        const data = Array.isArray(response?.data) ? response.data : [];
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [parkingId]); // Re-fetch when parkingId changes

  const filterByStatus = (list: Booking[]) => {
    if (statusFilter === "ALL") return list;
    return list.filter((b: Booking) => b.status === statusFilter);
  };

  const filterByDate = (list: Booking[]) => {
    const now = new Date();
    switch (dateFilter) {
      case "TODAY":
        return list.filter(
          (b: Booking) => new Date(b.createdDate).toDateString() === now.toDateString()
        );
      case "YESTERDAY":
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return list.filter(
          (b: Booking) => new Date(b.createdDate).toDateString() === yesterday.toDateString()
        );
      case "LAST_7_DAYS":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return list.filter((b: Booking) => new Date(b.createdDate) >= weekAgo);
      default:
        return list;
    }
  };

  const filteredBookings = filterByStatus(filterByDate(bookings));
  const sortedBookings = filteredBookings
    .slice()
    .sort((a: Booking, b: Booking) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openLogsModal = async (bookingId: string) => {
    setLogsLoading(true);
    setLogsError(null);
    setVehicleLogs([]);
    setLogsModalVisible(true);
    try {
      const response = await HttpService.get(`/api/vehicle/logs/${bookingId}`);
      if (response.data && Array.isArray(response.data)) {
        setVehicleLogs(response.data);
      } else {
        setVehicleLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch vehicle logs:", error);
      setLogsError("Failed to load logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  const renderFilterButtons = () => (
    <View style={styles.filtersWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {DATE_FILTERS.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.filterButton,
              dateFilter === date && styles.filterButtonActive,
            ]}
            onPress={() => setDateFilter(date)}
          >
            <Text
              style={[
                styles.filterButtonText,
                dateFilter === date && styles.filterButtonTextActive,
              ]}
            >
              {date.replace("_", " ").toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <View style={styles.headerContent}>
            <Ionicons name="receipt" size={24} color="#fff" style={styles.headerIcon} />
            <Text style={styles.detailsTitle}>Booking Details</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedBooking(null)}
          >
            <Ionicons name="close-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color={colors.themeColor} />
              <Text style={styles.sectionTitle}>Customer Information</Text>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleCall(selectedBooking.customerPhone)}
              >
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: '#2196F3' }]}
                onPress={() => handleMessage(selectedBooking.customerPhone)}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: '#FF9800' }]}
                onPress={() => handleEmail(selectedBooking.customerEmail)}
              >
                <Ionicons name="mail" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Name: </Text>
                  {selectedBooking.customerName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Phone: </Text>
                  {selectedBooking.customerPhone}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Email: </Text>
                  {selectedBooking.customerEmail}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car" size={20} color={colors.themeColor} />
              <Text style={styles.sectionTitle}>Booking Information</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Parking: </Text>
                  {selectedBooking.parkingName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Address: </Text>
                  {selectedBooking.parkingAddress}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="pricetag-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Slot: </Text>
                  {selectedBooking.slotNumber}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Vehicle: </Text>
                  {selectedBooking.vehicleNumber || "-"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Date: </Text>
                  {new Date(selectedBooking.startTime).toDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Time: </Text>
                  {new Date(selectedBooking.startTime).toLocaleTimeString()} -{" "}
                  {new Date(selectedBooking.endTime).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Total Price: </Text>
                  <Text style={styles.priceText}>Rs {selectedBooking.price}</Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard} 
      onPress={() => setSelectedBooking(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerHeader}>
            <Ionicons name="person-circle" size={24} color={colors.themeColor} />
            <Text style={styles.bookingCustomer}>{item.customerName || "Unknown"}</Text>
          </View>
          <View style={styles.bookingDateTime}>
            <Ionicons name="calendar" size={14} color="#64748B" />
            <Text style={styles.dateTimeText}>
              {new Date(item.startTime).toDateString()} •{" "}
              {new Date(item.startTime).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.parkingInfo}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={styles.parkingText}>
              {item.parkingName} • {item.parkingAddress}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusTextSmall}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingInfoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="car" size={16} color="#64748B" />
          <Text style={styles.infoText}>{item.vehicleNumber || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="pricetag" size={16} color="#64748B" />
          <Text style={styles.infoText}>Slot {item.slotNumber}</Text>
        </View>
        <TouchableOpacity
          onPress={() => openLogsModal(item.bookingId)}
          style={styles.logButton}
        >
          <Ionicons name="document-text" size={16} color="#fff" style={styles.logButtonIcon} />
          <Text style={styles.logButtonText}>View Logs</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "#1976d2"; // Blue
      case "completed":
        return "#388e3c"; // Green
      case "cancelled":
        return "#d32f2f"; // Red
      default:
        return "#757575"; // Grey for others
    }
  }

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'MATCHED':
        return 'Verified Plate';
      case 'UNMATCHED':
        return 'Suspicious Plate';
      case 'PENDING_REVIEW':
        return 'Under Review';
      default:
        return status;
    }
  };

  const renderVehicleLogs = () => (
    <FlatList
      data={vehicleLogs}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => {
        const plates = item.plateNumber.split(',');
        const customModel = plates[0]?.replace('~', '') || 'N/A';
        const easyOCR = plates[1] || 'N/A';
        
        return (
          <View style={[
            styles.logEntry,
            item.matchedBookingStatus === 'UNMATCHED' && styles.unmatchedLogEntry
          ]}>
            <View style={styles.logHeader}>
              <View style={styles.plateInfo}>
                {item.matchedBookingStatus === 'UNMATCHED' ? (
                  <>
                    <Text style={styles.plateNumber}>Suspicious Vehicle Detection</Text>
                    <View style={styles.plateResults}>
                      <View style={styles.plateResult}>
                        <Text style={styles.plateResultLabel}>Custom Model:</Text>
                        <Text style={styles.plateResultValue}>{customModel}</Text>
                      </View>
                      <View style={styles.plateResult}>
                        <Text style={styles.plateResultLabel}>EasyOCR:</Text>
                        <Text style={styles.plateResultValue}>{easyOCR}</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.plateNumber}>Plate # {item.plateNumber}</Text>
                )}
                {item.matchedBookingStatus === 'UNMATCHED' && (
                  <Text style={styles.unmatchedWarning}>
                    Suspicious Vehicle Attempted Entry
                  </Text>
                )}
              </View>
              <View style={[
                styles.statusBadgeSmall,
                { backgroundColor: item.matchedBookingStatus === 'UNMATCHED' ? '#f44336' : 
                                 item.matchedBookingStatus === 'MATCHED' ? '#4caf50' : '#ff9800' }
              ]}>
                <Text style={styles.statusTextSmall}>
                  {getStatusDisplay(item.matchedBookingStatus)}
                </Text>
              </View>
            </View>
            <View style={styles.checkInInfo}>
              <MaterialIcons name="access-time" size={16} color="#666" />
              <Text style={styles.logTimestamp}>
                Attempted check-in at {new Date(item.detectedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        );
      }}
      contentContainerStyle={{ paddingBottom: 30 }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {parkingId ? 'Parking Bookings' : 'All Bookings'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.themeColor} />
          <Text style={styles.loadingText}>Loading Bookings...</Text>
        </View>
      ) : (
        <>
          {renderFilterButtons()}
          {sortedBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar" size={48} color="#CBD5E1" />
              <Text style={styles.noBookingsText}>No bookings found</Text>
            </View>
          ) : (
            <FlatList
              data={sortedBookings}
              keyExtractor={(item) => item.bookingId}
              renderItem={renderBookingItem}
              contentContainerStyle={styles.bookingsList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {selectedBooking && (
            <Modal
              visible={true}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setSelectedBooking(null)}
            >
              <View style={styles.modalOverlay}>
                {renderBookingDetails()}
              </View>
            </Modal>
          )}

          <Modal
            visible={logsModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setLogsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.logsContainer}>
                <View style={styles.detailsHeader}>
                  <View style={styles.headerContent}>
                    <Ionicons name="document-text" size={24} color="#fff" style={styles.headerIcon} />
                    <Text style={styles.detailsTitle}>Vehicle Logs</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setLogsModalVisible(false)}
                  >
                    <Ionicons name="close-circle" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
                {logsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.themeColor} />
                    <Text style={styles.loadingText}>Loading logs...</Text>
                  </View>
                ) : logsError ? (
                  <View style={styles.emptyContainer}>
                  <Ionicons name="document-text" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No vehicle logs available</Text>
                  <Text style={styles.emptySubText}>No vehicle detection logs found for this booking</Text>
                </View>
                ) : vehicleLogs.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No vehicle logs available</Text>
                    <Text style={styles.emptySubText}>No vehicle detection logs found for this booking</Text>
                  </View>
                ) : (
                  renderVehicleLogs()
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  filtersWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: colors.themeColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: colors.themeColor,
  },
  filterButtonText: {
    color: colors.themeColor,
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  noBookingsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  bookingsList: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingCustomer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  bookingDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  parkingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parkingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
  },
  statusBadgeSmall: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusTextSmall: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  bookingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 6,
    color: '#475569',
    fontSize: 14,
  },
  logButton: {
    backgroundColor: colors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logButtonIcon: {
    marginRight: 6,
  },
  logButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    maxHeight: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.themeColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  detailsContent: {
    padding: 20,
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  contactButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contactButton: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#475569',
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#1E293B',
  },
  priceText: {
    color: colors.themeColor,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  logsContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  logEntry: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unmatchedLogEntry: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plateInfo: {
    flex: 1,
    marginRight: 12,
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  unmatchedWarning: {
    color: '#EF4444',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  logTimestamp: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 8,
  },
  plateResults: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  plateResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plateResultLabel: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    width: 100,
  },
  plateResultValue: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
  },
});
