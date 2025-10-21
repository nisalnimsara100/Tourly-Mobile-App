import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

// 🔑 Import the Firestore database instance (Adjust path as necessary)
import { db } from '../../_constants/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Interfaces for the attraction data structure
interface Guideline {
  description: string;
  icon: string;
  type: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  city: string;
  coordinates: Coordinates;
  province: string;
}

interface NearbyAttraction {
  distance: number;
  id: string;
  name: string;
}

interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface Attraction {
  id: string;
  name: string;
  amenities: {
    guidedTours: boolean;
    parkingAvailable: boolean;
    restaurants: boolean;
    restrooms: boolean;
    shops: boolean;
  };
  bestTimeToVisit: string;
  description: string;
  entranceFee: string;
  estimatedDuration: string;
  guidelines: Guideline[];
  history: string;
  images: string[];
  location: Location;
  nearbyAttractions: NearbyAttraction[];
  openingHours: OpeningHours;
  rating: number;
  reviewCount: number;
  type: string;
}
// --- End Interface Definition ---


export default function HomeScreen() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data from Firestore
  const fetchAttractions = async () => {
    try {
      // Get all attractions from the attractions collection
      const attractionsRef = collection(db, "attractions");
      const attractionsSnapshot = await getDocs(attractionsRef);
      
      if (attractionsSnapshot.empty) {
        console.log("No attractions found in the database");
        setAttractions([]);
        setLoading(false);
        return;
      }

      const fetchedAttractions: Attraction[] = [];
      attractionsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Map the Firestore document to our Attraction type
        fetchedAttractions.push({
          id: doc.id,
          name: data.name || doc.id,
          bestTimeToVisit: data.bestTimeToVisit || 'N/A',
          description: data.description || 'No description provided.',
          entranceFee: data.entranceFee || 'N/A',
          estimatedDuration: data.estimatedDuration || 'N/A',
          amenities: {
            guidedTours: data.amenities?.guidedTours ?? false,
            parkingAvailable: data.amenities?.parkingAvailable ?? false,
            restaurants: data.amenities?.restaurants ?? false,
            restrooms: data.amenities?.restrooms ?? false,
            shops: data.amenities?.shops ?? false,
          },
          guidelines: data.guidelines || [],
          history: data.history || '',
          images: data.images || [],
          location: data.location || {
            address: 'N/A',
            city: 'N/A',
            coordinates: { latitude: 0, longitude: 0 },
            province: 'N/A'
          },
          nearbyAttractions: data.nearbyAttractions || [],
          openingHours: data.openingHours || {
            monday: 'N/A',
            tuesday: 'N/A',
            wednesday: 'N/A',
            thursday: 'N/A',
            friday: 'N/A',
            saturday: 'N/A',
            sunday: 'N/A'
          },
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          type: data.type || 'unknown'
        });
      });
      
      setAttractions(fetchedAttractions);
    } catch (error) {
      console.error("Error fetching attraction data: ", error);
      Alert.alert(
        "Error",
        "Unable to load attractions. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Run the fetch function once when the screen loads
  useEffect(() => {
    fetchAttractions();
  }, []); 

  // --- Rendering Functions ---
  const navigateToDetails = (attractionId: string) => {
    router.push({
      pathname: "/explore/post_details",
      params: { id: attractionId }
    });
  };
  
  // Component to render a single attraction card
  const renderItem = ({ item }: { item: Attraction }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigateToDetails(item.id)}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      
      <Text style={styles.cardContent}>
        {item.description.substring(0, 100)}... 
      </Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.cardInfo}>⏱ Duration: {item.estimatedDuration}</Text>
        <Text style={styles.cardInfo}>📍 {item.location.city}, {item.location.province}</Text>
        <Text style={styles.cardInfo}>⭐ {item.rating.toFixed(1)} ({item.reviewCount} reviews)</Text>
      </View>
      
      <View style={styles.amenitiesContainer}>
        {item.amenities.parkingAvailable && <Text style={styles.tag}>🅿️ Parking</Text>}
        {item.amenities.restaurants && <Text style={styles.tag}>🍽️ Restaurant</Text>}
        {item.amenities.restrooms && <Text style={styles.tag}>🚻 Restrooms</Text>}
      </View>
      
      <Button 
        title="View Details" 
        onPress={() => navigateToDetails(item.id)}
      />
    </TouchableOpacity>
  );

  // --- Main Component Return ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Attractions...</Text>
      </View>
    );
  }
  
  if (attractions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No attractions found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={attractions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  );
}


// --- Styles (Same as before, ensuring clear card visibility) ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#004d40',
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  infoContainer: {
    marginVertical: 8,
  },
  cardInfo: {
    fontSize: 12,
    color: '#444',
    marginBottom: 3,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  tag: {
    fontSize: 12,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  }
});