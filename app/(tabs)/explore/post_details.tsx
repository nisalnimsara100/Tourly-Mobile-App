import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { openMapsWithDirections } from '../../../utils/maps';
import { db } from '../../_constants/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Interface for the attraction data
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
  guidelines: {
    description: string;
    icon: string;
    type: string;
  }[];
  history: string;
  images: string[];
  location: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    province: string;
  };
  nearbyAttractions: {
    distance: number;
    id: string;
    name: string;
  }[];
  openingHours: Record<string, string>;
  rating: number;
  reviewCount: number;
  type: string;
}

export default function PostDetailsScreen() {
  const params = useLocalSearchParams();
  const attractionId = params.id as string;
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttractionDetails = async () => {
      try {
        const attractionRef = doc(db, 'attractions', attractionId);
        const attractionDoc = await getDoc(attractionRef);
        
        if (attractionDoc.exists()) {
          setAttraction({ id: attractionDoc.id, ...attractionDoc.data() } as Attraction);
        } else {
          console.error('No such attraction!');
        }
      } catch (error) {
        console.error('Error fetching attraction details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractionDetails();
  }, [attractionId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading attraction details...</Text>
      </View>
    );
  }

  if (!attraction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Attraction not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>{attraction.name}</Text>
        <Text style={styles.rating}>⭐ {attraction.rating.toFixed(1)} ({attraction.reviewCount} reviews)</Text>
      </View>

      {/* Images Section */}
      <ScrollView horizontal style={styles.imageContainer}>
        {attraction.images.map((imageUrl, index) => (
          <Image
            key={index}
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Directions Button */}
      <TouchableOpacity 
        style={styles.directionsButton}
        onPress={() => openMapsWithDirections(attraction.location.coordinates)}
      >
        <Text style={styles.directionsButtonText}>🗺️ Show Directions</Text>
      </TouchableOpacity>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{attraction.description}</Text>
      </View>

      {/* Key Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Information</Text>
        <Text style={styles.infoText}>🕒 Duration: {attraction.estimatedDuration}</Text>
        <Text style={styles.infoText}>💰 Entrance Fee: {attraction.entranceFee}</Text>
        <Text style={styles.infoText}>⏰ Best Time: {attraction.bestTimeToVisit}</Text>
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.infoText}>📍 {attraction.location.address}</Text>
        <Text style={styles.infoText}>🏙️ {attraction.location.city}, {attraction.location.province}</Text>
      </View>

      {/* Amenities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {attraction.amenities.guidedTours && <Text style={styles.tag}>🎯 Guided Tours</Text>}
          {attraction.amenities.parkingAvailable && <Text style={styles.tag}>🅿️ Parking</Text>}
          {attraction.amenities.restaurants && <Text style={styles.tag}>🍽️ Restaurants</Text>}
          {attraction.amenities.restrooms && <Text style={styles.tag}>🚻 Restrooms</Text>}
          {attraction.amenities.shops && <Text style={styles.tag}>🛍️ Shops</Text>}
        </View>
      </View>

      {/* Guidelines Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guidelines</Text>
        {attraction.guidelines.map((guideline, index) => (
          <View key={index} style={styles.guidelineItem}>
            <Text style={styles.guideline}>• {guideline.description}</Text>
          </View>
        ))}
      </View>

      {/* History Section */}
      {attraction.history && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          <Text style={styles.description}>{attraction.history}</Text>
        </View>
      )}

      {/* Opening Hours Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opening Hours</Text>
        {Object.entries(attraction.openingHours).map(([day, hours]) => (
          <Text key={day} style={styles.infoText}>
            {day.charAt(0).toUpperCase() + day.slice(1)}: {hours}
          </Text>
        ))}
      </View>

      {/* Nearby Attractions Section */}
      {attraction.nearbyAttractions.length > 0 && (
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Nearby Attractions</Text>
          {attraction.nearbyAttractions.map((nearby, index) => (
            <Text key={index} style={styles.infoText}>
              📍 {nearby.name} ({nearby.distance}km away)
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    height: 200,
    marginVertical: 16,
  },
  image: {
    width: 300,
    height: 200,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  guidelineItem: {
    marginBottom: 8,
  },
  guideline: {
    fontSize: 16,
    color: '#555',
  },
  directionsButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center'
  }
});