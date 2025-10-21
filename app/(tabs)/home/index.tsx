import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../_constants/firebaseConfig';
import * as Location from 'expo-location';

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
  distance?: number; // Added after calculation
  rating?: number;
  reviewCount?: number;
  type?: string;
  estimatedDuration?: string;
  entranceFee?: string;
  bestTimeToVisit?: string;
}

export default function NearbyScreen() {
  const router = useRouter();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxDistance, setMaxDistance] = useState(50); // Default 50km radius
  const [userLocation, setUserLocation] = useState<Coordinates>({
    latitude: 6.927079, // Default location (Colombo, Sri Lanka)
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

  const renderAttractionItem = ({ item }: { item: Attraction }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigateToDetails(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.distance}>{item.distance?.toFixed(1)} km away</Text>
      </View>
      
      <Text style={styles.location}>
        📍 {item.location.city}, {item.location.province}
      </Text>
      
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Finding nearby attractions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          data={attractions}
          renderItem={renderAttractionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});