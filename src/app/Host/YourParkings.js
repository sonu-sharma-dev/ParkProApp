import HttpService from '@/src/api/HttpService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ENDPOINTS } from '@/src/api/endpoints';
import colors from '../commons/Colors';

const { width } = Dimensions.get('window');
const DEFAULT_PARKING_IMAGE = require('../../Images/ParkingSpots/1.jpg');

export default function YourParkings() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(() => {
    navigation.setOptions({ 
      title: 'My Parkings',
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
      },
      headerTitleStyle: {
        color: '#1E293B',
        fontWeight: '700',
      },
    });
  });

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error('User ID not found');

        const response = await HttpService.get(ENDPOINTS.PARKING.GET_BY_USER, {
          params: { userId: parseInt(userId) },
        });

        setParkings(response.data);
      } catch (error) {
        console.error('Failed to fetch parkings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkings();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('UpdateParking', { parking: item })}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.imageUrl ? { uri: item.imageUrl } : DEFAULT_PARKING_IMAGE}
            style={styles.parkingImage}
            resizeMode="cover"
            defaultSource={DEFAULT_PARKING_IMAGE}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#64748B" />
            <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="cash" size={16} color="#64748B" />
              <Text style={styles.infoText}>Rs. {item.charges}/hr</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="car" size={16} color="#64748B" />
              <Text style={styles.infoText}>{item.availableSlots}/{item.totalSlots} slots</Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            {item.hasRoof && (
              <View style={styles.featureBadge}>
                <Ionicons name="umbrella" size={14} color="#fff" />
                <Text style={styles.featureText}>Roof</Text>
              </View>
            )}
            {item.cctvAvailable && (
              <View style={styles.featureBadge}>
                <Ionicons name="videocam" size={14} color="#fff" />
                <Text style={styles.featureText}>CCTV</Text>
              </View>
            )}
            {item.isIndoor && (
              <View style={styles.featureBadge}>
                <Ionicons name="home" size={14} color="#fff" />
                <Text style={styles.featureText}>Indoor</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => navigation.navigate('UpdateParking', { parking: item })}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Update Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('Bookings', { parkingId: item.id })}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.themeColor} />
          <Text style={[styles.buttonText, { color: colors.themeColor }]}>View Bookings</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.themeColor} />
        <Text style={styles.loadingText}>Loading your parkings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {parkings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Parkings Listed</Text>
            <Text style={styles.emptyText}>
              You haven't listed any parking spaces yet. Create your first parking listing to get started.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateParking')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create New Parking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={parkings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#F1F5F9',
  },
  parkingImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.themeColor,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
