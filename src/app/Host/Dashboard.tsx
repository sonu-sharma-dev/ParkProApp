import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HttpService from '@/src/api/HttpService';
import { ENDPOINTS } from '@/src/api/endpoints';
import { Ionicons } from '@expo/vector-icons';
import colors from '../commons/Colors';

type RootStackParamList = {
  YourParkings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface VehicleLog {
  vehicleLogId: number;
  plateNumber: string;
  detectedAt: string;
  parkingName: string;
  parkingAddress: string;
  bookingId: number;
  expectedVehicleNumber: string;
  customerName: string;
  customerPhone: string;
  bookingStartTime: string;
  bookingEndTime: string;
}

interface DashboardData {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  totalSlots: number;
}

export default function HostDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unmatchedVehicles, setUnmatchedVehicles] = useState<VehicleLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const finalEndpoint = ENDPOINTS.PARKING.SUMMARY_DASHBOARD + `?ownerId=${userId}`;
        const response = await HttpService.get(finalEndpoint);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUnmatchedVehicles = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await HttpService.get(ENDPOINTS.BOOKINGS.UNMATCHED_CHECKINS(userId));
        setUnmatchedVehicles(response.data);
        if (response.data.length > 0) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error fetching unmatched vehicles:', error);
      }
    };

    fetchDashboardData();
    fetchUnmatchedVehicles();
  }, []);

  const handleMarkVisited = async () => {
    try {
      await HttpService.put(ENDPOINTS.BOOKINGS.MARK_VISITED, selectedVehicles);
      setUnmatchedVehicles(prev => 
        prev.filter(vehicle => !selectedVehicles.includes(vehicle.vehicleLogId))
      );
      setSelectedVehicles([]);
      if (unmatchedVehicles.length === selectedVehicles.length) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error marking vehicles as visited:', error);
    }
  };

  const toggleVehicleSelection = (vehicleId: number) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const formatPlateNumber = (plateNumber: string): { customModel: string; easyOCR: string } => {
    if (!plateNumber) return { customModel: 'N/A', easyOCR: 'N/A' };
    const [customModel, easyOCR] = plateNumber.split(',');
    return {
      customModel: customModel?.replace('~', '') || 'N/A',
      easyOCR: easyOCR || 'N/A'
    };
  };

  if (loading || !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.themeColor} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity
          style={styles.viewParkingsButton}
          onPress={() => navigation.navigate('YourParkings')}
        >
          <Ionicons name="car" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>View Parkings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="today" size={24} color="#1976D2" />
            </View>
            <Text style={styles.statValue}>Rs. {dashboardData.revenue.daily}</Text>
            <Text style={styles.statLabel}>Daily Revenue</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.statValue}>Rs. {dashboardData.revenue.weekly}</Text>
            <Text style={styles.statLabel}>Weekly Revenue</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="stats-chart" size={24} color="#E65100" />
            </View>
            <Text style={styles.statValue}>Rs. {dashboardData.revenue.monthly}</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="car" size={24} color="#7B1FA2" />
            </View>
            <Text style={styles.statValue}>{dashboardData.totalSlots}</Text>
            <Text style={styles.statLabel}>Total Slots</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="alert-circle" size={24} color={colors.themeColor} style={styles.modalTitleIcon} />
                <Text style={styles.modalTitle}>Suspicious Vehicle Entries</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={unmatchedVehicles}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.vehicleList}
              renderItem={({ item }) => {
                const plates = formatPlateNumber(item.plateNumber);
                return (
                  <TouchableOpacity
                    style={[
                      styles.vehicleCard,
                      selectedVehicles.includes(item.vehicleLogId) && styles.selectedVehicle
                    ]}
                    onPress={() => toggleVehicleSelection(item.vehicleLogId)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.plateInfo}>
                        <Text style={styles.detectedLabel}>Detected Number</Text>
                        <View style={styles.plateContainer}>
                          <View style={styles.plateSection}>
                            <Text style={styles.plateLabel}>Custom Model</Text>
                            <Text style={styles.plateNumber}>{plates.customModel}</Text>
                          </View>
                          <View style={styles.plateDivider} />
                          <View style={styles.plateSection}>
                            <Text style={styles.plateLabel}>EasyOCR</Text>
                            <Text style={[styles.plateNumber, styles.easyOCRPlate]}>{plates.easyOCR}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={[
                        styles.selectionIndicator,
                        selectedVehicles.includes(item.vehicleLogId) && styles.selectedIndicator
                      ]}>
                        <Ionicons 
                          name={selectedVehicles.includes(item.vehicleLogId) ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={selectedVehicles.includes(item.vehicleLogId) ? colors.themeColor : "#CBD5E1"} 
                        />
                      </View>
                    </View>

                    <View style={styles.bookingInfo}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Ionicons name="person" size={16} color="#fff" />
                        </View>
                        <Text style={styles.infoLabel}>Customer Name:</Text>
                        <Text style={styles.infoText}>{item.customerName}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Ionicons name="call" size={16} color="#fff" />
                        </View>
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoText}>{item.customerPhone}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Ionicons name="time" size={16} color="#fff" />
                        </View>
                        <Text style={styles.infoLabel}>Booking Time:</Text>
                        <Text style={styles.infoText}>
                          {new Date(item.bookingStartTime).toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Ionicons name="scan" size={16} color="#fff" />
                        </View>
                        <Text style={styles.infoLabel}>Detected At:</Text>
                        <Text style={styles.infoText}>
                          {new Date(item.detectedAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.parkingInfo}>
                      <View style={styles.parkingHeader}>
                        <Ionicons name="location" size={16} color={colors.themeColor} />
                        <Text style={styles.parkingName}>{item.parkingName}</Text>
                      </View>
                      <Text style={styles.parkingAddress}>{item.parkingAddress}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.markVisitedButton,
                  selectedVehicles.length === 0 && styles.disabledButton
                ]}
                onPress={handleMarkVisited}
                disabled={selectedVehicles.length === 0}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.footerButtonText}>
                  Mark as Seen ({selectedVehicles.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  viewParkingsButton: {
    backgroundColor: colors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: colors.themeColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxHeight: '85%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleIcon: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  vehicleList: {
    paddingBottom: 16,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedVehicle: {
    backgroundColor: '#F0F7FF',
    borderColor: colors.themeColor,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  plateInfo: {
    flex: 1,
    marginRight: 12,
  },
  detectedLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  plateContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  plateSection: {
    flex: 1,
  },
  plateDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  plateLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  easyOCRPlate: {
    color: colors.themeColor,
  },
  selectionIndicator: {
    padding: 4,
  },
  selectedIndicator: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  bookingInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    width: 100,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  parkingInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  parkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  parkingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  parkingAddress: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 24,
  },
  modalFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  markVisitedButton: {
    backgroundColor: colors.themeColor,
    shadowColor: colors.themeColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
