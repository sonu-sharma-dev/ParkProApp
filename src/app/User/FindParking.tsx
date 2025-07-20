import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { setParkingData } from "../../../Redux/parkingSlice";
import HttpService from "@/src/api/HttpService";
import { ENDPOINTS } from "@/src/api/endpoints";
import colors from "../commons/Colors";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface ParkingSpot {
  id: number;
  description: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  charges: number;
  imageUrl?: string;
  availableSpots?: number;
  rating?: number;
  totalSpots?: number;
  hasRoof?: boolean;
  cctvAvailable?: boolean;
  isIndoor?: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function ParkingApp() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [parkingData, setParkingDataList] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [distance, setDistance] = useState(5);
  const [selectedParking, setSelectedParking] = useState<ParkingSpot | null>(null);
  const [mapView, setMapView] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const fetchParkingData = async () => {
    try {
      const response = await HttpService.get(ENDPOINTS.PARKING.GET_ALL);
      setParkingDataList(response.data);
    } catch (error) {
      console.error("Error fetching parking data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserName(userData.name || "User");
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserData();
    fetchParkingData();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Calculate distance between two coordinates (km)
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    else if (hour >= 12 && hour < 17) return "Good Afternoon";
    else if (hour >= 17 && hour < 21) return "Good Evening";
    else return "Good Night";
  }

  // Filter by distance and search query
  const filteredData = parkingData.filter((item) => {
    // Filter by search text in location or description
    const matchesSearch =
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // If user location unknown, just filter by search text
    if (!userLocation) return matchesSearch;

    // Filter by distance (within radius)
    const dist = getDistanceFromLatLonInKm(
      userLocation.latitude,
      userLocation.longitude,
      item.latitude,
      item.longitude
    );

    return matchesSearch && dist <= distance;
  });

  const handleParkingSelection = (item: ParkingSpot) => {
    setSelectedParking(item);
    dispatch(setParkingData(item));
    navigation.navigate("BookParking", { parkingId: item.id });
  };

  const handleMapPress = () => {
    setSelectedParking(null);
  };

  const handleMarkerPress = (item: ParkingSpot) => {
    setSelectedParking(item);
    mapRef.current?.animateToRegion({
      latitude: item.latitude,
      longitude: item.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }, 500);
  };

  const handleLocateUser = async () => {
    try {
      setIsLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(newLocation);
      mapRef.current?.animateToRegion({
        ...newLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapTypeToggle = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const renderRadiusButtons = () => {
    const radiusOptions = [1, 3, 5, 10, 20];
    return (
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Search Radius</Text>
        <View style={styles.radiusButtons}>
          {radiusOptions.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusButton,
                distance === radius && styles.radiusButtonActive
              ]}
              onPress={() => setDistance(radius)}
            >
              <Text style={[
                styles.radiusButtonText,
                distance === radius && styles.radiusButtonTextActive
              ]}>
                {radius}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderParkingItem = ({ item }: { item: ParkingSpot }) => (
    <TouchableOpacity
      style={[
        styles.parkingItem,
        selectedParking?.id === item.id && styles.selectedParkingItem
      ]}
      onPress={() => handleParkingSelection(item)}
    >
      <Image
        source={
          item.imageUrl && item.imageUrl.startsWith('file://')
            ? { uri: item.imageUrl }
            : require("../../Images/ParkingSpots/1.jpg")
        }
        style={styles.parkingImage}
        resizeMode="cover"
        onError={() => {
          // If image fails to load, use default image
          item.imageUrl = undefined;
        }}
      />
      <View style={styles.parkingDetails}>
        <View style={styles.parkingHeader}>
          <Text style={styles.parkingName} numberOfLines={1}>{item.description}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.parkingLocation} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {item.hasRoof && (
            <View style={styles.featureBadge}>
              <Ionicons name="umbrella-outline" size={12} color="#fff" />
              <Text style={styles.featureText}>Roof</Text>
            </View>
          )}
          {item.cctvAvailable && (
            <View style={styles.featureBadge}>
              <Ionicons name="videocam-outline" size={12} color="#fff" />
              <Text style={styles.featureText}>CCTV</Text>
            </View>
          )}
          {item.isIndoor && (
            <View style={styles.featureBadge}>
              <Ionicons name="home-outline" size={12} color="#fff" />
              <Text style={styles.featureText}>Indoor</Text>
            </View>
          )}
        </View>

        <View style={styles.parkingFooter}>
          <View style={styles.priceContainer}>
            <Ionicons name="cash-outline" size={16} color={colors.themeColor} />
            <Text style={styles.parkingPrice}>Rs {item.charges} / hr</Text>
          </View>
          {item.availableSpots !== undefined && (
            <View style={styles.spotsContainer}>
              <Ionicons name="car-outline" size={14} color="#666" />
              <Text style={styles.spotsText}>{item.availableSpots} spots left</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.themeColor} />
        <Text style={styles.loadingText}>Finding parking spots...</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: filteredData.length > 0
      ? filteredData[0].latitude
      : userLocation?.latitude || 24.8607,
    longitude: filteredData.length > 0
      ? filteredData[0].longitude
      : userLocation?.longitude || 67.0011,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../Images/avtar.png")}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

      </View>

      <Text style={styles.title}>Find the best place to park</Text>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search by location or parking name"
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setMapView(!mapView)}
        >
          <Ionicons 
            name={mapView ? "list" : "map"} 
            size={24} 
            color={colors.themeColor} 
          />
        </TouchableOpacity>
      </View>

      {renderRadiusButtons()}

      {mapView && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            mapType={mapType}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={true}
          >
            {filteredData.map((item) => (
              <Marker
                key={item.id.toString()}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                onPress={() => handleMarkerPress(item)}
              >
                <View style={[
                  styles.markerPin,
                  selectedParking?.id === item.id && styles.selectedMarkerPin
                ]}>
                  <Ionicons 
                    name="location" 
                    size={24} 
                    color={selectedParking?.id === item.id ? colors.themeColor : "#666"} 
                  />
                </View>
              </Marker>
            ))}

            {userLocation && (
              <Circle
                center={userLocation}
                radius={distance * 1000}
                strokeColor="rgba(30,177,252,0.5)"
                fillColor="rgba(30,177,252,0.2)"
              />
            )}
          </MapView>

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={handleLocateUser}
              disabled={isLocating}
            >
              <Ionicons
                name="locate"
                size={24}
                color={isLocating ? "#999" : colors.themeColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={handleMapTypeToggle}
            >
              <Ionicons
                name={mapType === 'standard' ? "earth" : "map"}
                size={24}
                color={colors.themeColor}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Parking Nearby</Text>
        <Text style={styles.resultCount}>{filteredData.length} spots found</Text>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderParkingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
    color: "#1F2937",
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  distanceFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  distanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  distanceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  mapContainer: {
    height: 250,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  map: {
    flex: 1,
  },
  markerPin: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedMarkerPin: {
    backgroundColor: "#fff",
    transform: [{ scale: 1.2 }],
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  parkingItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedParkingItem: {
    borderWidth: 2,
    borderColor: colors.themeColor,
  },
  parkingImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  parkingDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  parkingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  parkingName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  parkingLocation: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  parkingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  parkingPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.themeColor,
    marginLeft: 4,
  },
  spotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spotsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  radiusContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  radiusButtonActive: {
    backgroundColor: colors.themeColor,
    borderColor: colors.themeColor,
  },
  radiusButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  radiusButtonTextActive: {
    color: "#fff",
  },
  mapControls: {
    position: "absolute",
    right: 12,
    bottom: 12,
    gap: 8,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
