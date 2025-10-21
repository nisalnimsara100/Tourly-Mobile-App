import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../_constants/firebaseConfig';
import Logo from '../../assets/images/LogoForOnScreen.svg';

// Types
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Attraction {
  id: string;
  name: string;
  location: {
    coordinates: Coordinates;
    address: string;
    city: string;
    province: string;
  };
  description: string;
  imageUrl?: string;
  images?: string[];
  distance?: number; 
  rating?: number;
  reviewCount?: number;
  type?: string;
  estimatedDuration?: string;
  entranceFee?: string;
  bestTimeToVisit?: string;
}

const { width } = Dimensions.get('window');

const Header = () => (
  <View style={{ backgroundColor: 'black', height: width * 0.38, paddingHorizontal: width * 0.05, justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: width * 0.1 }}>
      <TouchableOpacity>
        <FontAwesome5 name="map-marked-alt" size={width * 0.045} color="white" />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Logo width={width * 0.22} height={width * 0.1} />
      </View>
      <TouchableOpacity>
        <FontAwesome5 name="user-friends" size={width * 0.045} color="white" />
      </TouchableOpacity>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: width * 0.05 }}>
      <TouchableOpacity>
        <View style={{ backgroundColor: '#85cc16', borderRadius: 10, width: width * 0.21, minHeight: width * 0.08, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5 }}>
          <Text allowFontScaling={false} style={{ color: 'white', fontSize: width * 0.038, lineHeight: Math.round(width * 0.05) }}>Visit</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View style={{ backgroundColor: '#f3ffdf', borderRadius: 10, width: width * 0.21, minHeight: width * 0.08, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5 }}>
          <Text allowFontScaling={false} style={{ color: 'black', fontSize: width * 0.038, lineHeight: Math.round(width * 0.05) }}>Stay</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View style={{ backgroundColor: '#f3ffdf', borderRadius: 10, width: width * 0.21, minHeight: width * 0.08, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5 }}>
          <Text allowFontScaling={false} style={{ color: 'black', fontSize: width * 0.038, lineHeight: Math.round(width * 0.05) }}>Eat</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View style={{ backgroundColor: '#f3ffdf', borderRadius: 10, width: width * 0.21, minHeight: width * 0.08, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5 }}>
          <Text allowFontScaling={false} style={{ color: 'black', fontSize: width * 0.038, lineHeight: Math.round(width * 0.05) }}>Buy</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

export default function NearbyScreen() {
  const router = useRouter();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxDistance, setMaxDistance] = useState(50); // Default 50km radius
  const [userLocation, setUserLocation] = useState<Coordinates>({
    latitude: 6.927079, 
    longitude: 79.861244
  });

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  // Fetch attractions and calculate distances
  const fetchAttractions = useCallback(async () => {
    try {
      const attractionsRef = collection(db, 'attractions');
      const snapshot = await getDocs(attractionsRef);
      
      if (snapshot.empty) {
        setAttractions([]);
        return;
      }

      const attractionsWithDistance = snapshot.docs.map(doc => {
        const rawData = doc.data();
        console.log('Fetched attraction in list:', doc.id, rawData);
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          rawData.location.coordinates.latitude,
          rawData.location.coordinates.longitude
        );
        
        const processedData: Attraction = {
          id: doc.id,
          name: rawData.name,
          location: rawData.location,
          description: rawData.description,
          distance,
          images: rawData.imageUrl ? [rawData.imageUrl] : rawData.images || [],
          imageUrl: rawData.imageUrl,
          rating: rawData.rating,
          reviewCount: rawData.reviewCount,
          type: rawData.type,
          estimatedDuration: rawData.estimatedDuration,
          entranceFee: rawData.entranceFee,
          bestTimeToVisit: rawData.bestTimeToVisit
        };
        
        return processedData;
      });

      // Sort by distance and filter based on maxDistance
      const sortedAttractions = attractionsWithDistance
        .filter(attr => (attr.distance ?? Infinity) <= maxDistance)
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      setAttractions(sortedAttractions);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      Alert.alert('Error', 'Failed to load nearby attractions');
    } finally {
      setLoading(false);
    }
  }, [maxDistance, userLocation, calculateDistance]);

  // Get user location when component mounts
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Please enable location services to find nearby attractions.',
            [{ text: 'OK' }]
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your location. Using default location instead.',
          [{ text: 'OK' }]
        );
      }
    };

    getUserLocation();
  }, []);

  // Fetch attractions when distance or location changes
  useEffect(() => {
    fetchAttractions();
  }, [maxDistance, userLocation, fetchAttractions]);

  const navigateToDetails = (attraction: Attraction) => {
    // Navigate to details screen with the attraction ID
    router.push({
      pathname: '/home/details',
      params: {
        id: attraction.id
      }
    });
  };

  const renderNearbyAttractionItem = ({ item }: { item: Attraction }) => {
    const renderStars = (rating: number | undefined) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <FontAwesome5
            key={i}
            name="star"
            size={10}
            color={i <= (rating || 0) ? "gold" : "gray"}
            style={{ marginRight: 2 }}
          />
        );
      }
      return stars;
    };

    return (
      <TouchableOpacity
        style={styles.nearbyCard}
        onPress={() => navigateToDetails(item)}
      >
        <Image
          source={{ uri: (item.images && item.images[0]) || item.imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.nearbyCardImage}
        />
        <View style={styles.cardOverlay}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,10.6)"]}
            style={styles.gradientOverlay}
          />
          <Text
            style={[styles.cardTitle, { bottom: 48 }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <View style={[styles.detailsRow, { bottom: 30 }]}>
            <FontAwesome5 name="map-marker-alt" size={10} color="white" />
            <Text style={[styles.detailText, { marginRight: 10 }]}>{item.distance ? `${item.distance.toFixed(1)} km` : "Unknown"}</Text>
            <FontAwesome5 name="ticket-alt" size={10} color="white" />
            <Text style={[styles.detailText, { marginHorizontal: 10 }]}>{item.entranceFee?.toLowerCase() === "free" ? "Free" : "Yes"}</Text>
          </View>
          <View style={styles.ratingRow}>
            {renderStars(item.rating)}
            <Text style={styles.detailText}>{item.rating ? `(${item.rating.toFixed(1)})` : "(0)"}</Text>
            <Text style={styles.viewDetailsSimplified}>{">>"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Finding nearby attractions...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" />
      <Header />
      <View style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 26.5, borderTopRightRadius: 26.5, overflow: 'hidden' }}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Nearby Attractions</Text>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Maximum Distance: {maxDistance} km</Text>
              <View style={styles.buttonGroup}>
                {[10, 25, 50, 100].map((distance) => (
                  <Pressable
                    key={distance}
                    style={[
                      styles.filterButton,
                      maxDistance === distance && styles.filterButtonActive
                    ]}
                    onPress={() => setMaxDistance(distance)}
                  >
                    <Text 
                      style={[
                        styles.filterButtonText,
                        maxDistance === distance && styles.filterButtonTextActive
                      ]}
                    >
                      {distance} km
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {attractions.length === 0 ? (
            <View style={styles.centered}>
              <Text>No attractions found within {maxDistance}km</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={attractions}
              renderItem={renderNearbyAttractionItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  nearbyCard: {
    width: 150,
    height: 230,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  nearbyCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  cardTitle: {
    position: "absolute",
    bottom: 60,
    left: 10,
    right: 10,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "white",
  },
  detailsRow: {
    position: "absolute",
    bottom: 40,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 5,
  },
  ratingRow: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 5,
  },
  viewDetails: {
    position: "absolute",
    bottom: 5,
    left: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 9,
    color: "white",
  },
  viewDetailsCentered: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 9,
    color: "white",
  },
  viewDetailsSimplified: {
    marginLeft: 5,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "white",
  },
});
