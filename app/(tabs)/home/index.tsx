import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingScreen from '../../_components/LoadingScreen';
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

const events = [
  {
    id: '1',
    title: "It’s party time!!",
    subtitle: "Enjoy 15% off",
    location: "Classendra Hotel",
    imageUrl: "https://picsum.photos/seed/event1/400/200",
    interestedCount: "100+",
    avatars: [
      "https://picsum.photos/seed/avatar1/50/50",
      "https://picsum.photos/seed/avatar2/50/50",
      "https://picsum.photos/seed/avatar3/50/50",
      "https://picsum.photos/seed/avatar4/50/50",
    ],
  },
  {
    id: '2',
    title: "Live Music Night",
    subtitle: "Free Entry",
    location: "Downtown Club",
    imageUrl: "https://picsum.photos/seed/event2/400/200",
    interestedCount: "200+",
    avatars: [
      "https://picsum.photos/seed/avatar5/50/50",
      "https://picsum.photos/seed/avatar6/50/50",
      "https://picsum.photos/seed/avatar7/50/50",
      "https://picsum.photos/seed/avatar8/50/50",
    ],
  },
];

const EventCard = ({ event, isFirst }: { event: typeof events[0]; isFirst?: boolean }) => {
  return (
    <View style={[styles.eventCardContainer, { marginTop: isFirst ? 0 : 12 }]}> 
      <View style={styles.eventCard}>
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.eventCardBackground}
        />
        <View style={styles.eventCardOverlay}>
          <View style={{ padding: 16, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 name="map-pin" size={12} color="white" />
              <Text style={styles.eventCardLocation}>{event.location}</Text>
            </View>
            <Text style={styles.eventCardMainText}>{event.title}</Text>
            <Text style={styles.eventCardSubText}>{event.subtitle}</Text>
            <View style={styles.interestedContainer}>
              <Text style={styles.interestedText}>{event.interestedCount} interested</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                {event.avatars.map((avatar, index) => (
                  <Image
                    key={index}
                    source={{ uri: avatar }}
                    style={[styles.avatar, index === 0 ? { marginLeft: 0 } : {}]}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.findMoreButton}>
              <Text style={styles.findMoreButtonText}>Find More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function NearbyScreen() {
  const router = useRouter();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxDistance, setMaxDistance] = useState(100); // Default 100km radius
  const [userLocation, setUserLocation] = useState<Coordinates>({
    latitude: 6.927079, 
    longitude: 79.861244
  });
  const [selectedDistance, setSelectedDistance] = useState(maxDistance);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);

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
            <Text style={styles.viewDetailsSimplified}>{'>>'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleDistanceChange = (distance: number) => {
    setSelectedDistance(distance);
    setMaxDistance(distance);
  };

  if (loading) {
    return <LoadingScreen message="Finding nearby attractions..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" />
      <Header />
      <ScrollView style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 26.5, borderTopRightRadius: 26.5, overflow: 'hidden' }} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={styles.title}>Nearby Attractions</Text>
          <View style={styles.filterContainer}>
            <Pressable
              style={[styles.filterButton, styles.combinedFilterButton, { backgroundColor: '#f0f0f0' }]}
              onPress={() => setDistanceModalVisible(true)}
            >
              <Text style={[styles.filterButtonText, { color: '#000' }]}>{selectedDistance} km</Text>
              <FontAwesome5 name="sort" size={16} color="#000" style={{ marginLeft: 5 }} />
            </Pressable>
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

        {/* Distance selection modal (cross-platform) */}
        <Modal
          visible={distanceModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDistanceModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
              {[10, 25, 50, 100, 200, 300, 500].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={{ paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => { handleDistanceChange(d); setDistanceModalVisible(false); }}
                >
                  <Text style={{ fontSize: 16 }}>{d} km</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' }}
                onPress={() => setDistanceModalVisible(false)}
              >
                <Text style={{ fontSize: 16, color: '#666' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={styles.title}>What&apos;s Happening Around!</Text>
        </View>
        {events.map((event, idx) => (
          <EventCard key={event.id} event={event} isFirst={idx === 0} />
        ))}
      </ScrollView>
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
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 16,
  },
  filterButton: {
    marginRight: 8,
    padding: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  combinedFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  distanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 0, 
  },
  nearbyCard: {
    width: 150,
    height: 230,
    borderRadius: 15,
    marginRight: 10,
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
  eventCardContainer: {
    marginTop: 10,
  },
  eventCard: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  eventCardBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventCardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
  },
  eventCardLocation: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: 'white',
    marginLeft: 5,
  },
  eventCardMainText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
    marginTop: 15,
  },
  eventCardSubText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
  },
  findMoreButton: {
    backgroundColor: '#85cc16',
    borderRadius: 5,
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 16,
  },
  findMoreButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
  },
  interestedContainer: {
    position: 'absolute',
    bottom: 10,
    right: 16,
  },
  interestedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: 'white',
    textAlign: 'right',
    marginBottom: 7,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginLeft: -8,
    borderWidth: 1,
    borderColor: 'white',
    bottom: 3,
  },
  eventCardTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    marginBottom: 16,
  },
});