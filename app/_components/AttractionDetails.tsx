import React from 'react';
import { View, StyleSheet, Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { openMapsWithDirections } from '../../utils/maps';

interface AttractionDetailsProps {
  name: string;
  description: string;
  images?: string[];
  distance?: number;
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: string;
    city: string;
    province: string;
  };
  rating?: number;
  reviewCount?: number;
  type?: string;
  estimatedDuration?: string;
  entranceFee?: string;
  bestTimeToVisit?: string;
  amenities?: {
    guidedTours?: boolean;
    parkingAvailable?: boolean;
    restaurants?: boolean;
    restrooms?: boolean;
    shops?: boolean;
  };
  guidelines?: {
    description: string;
    icon: string;
    type: string;
  }[];
}

export function AttractionDetails(props: AttractionDetailsProps) {
  const {
    name,
    description,
    images = [],
    distance,
    location,
    rating = 4.5,
    reviewCount = 100,
    type = "Tourist Attraction",
    estimatedDuration = "2-3 hours",
    entranceFee = "Free",
    bestTimeToVisit = "Morning",
    amenities = {},
    guidelines = []
  } = props;

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.rating}>⭐ {rating} ({reviewCount} reviews)</Text>
        {distance && (
          <Text style={styles.rating}>
            📍 {typeof distance === 'number' ? `${distance.toFixed(1)} km away` : ''}
          </Text>
        )}
      </View>

      {/* Images Section */}
      {images && images.length > 0 && (
        <ScrollView horizontal style={styles.imageContainer}>
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Directions Button */}
      {location?.coordinates && (
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={() => openMapsWithDirections(location.coordinates)}
        >
          <Text style={styles.directionsButtonText}>🗺️ Show Directions</Text>
        </TouchableOpacity>
      )}

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Key Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Information</Text>
        <Text style={styles.infoText}>🕒 Duration: {estimatedDuration}</Text>
        <Text style={styles.infoText}>💰 Entrance Fee: {entranceFee}</Text>
        <Text style={styles.infoText}>⏰ Best Time: {bestTimeToVisit}</Text>
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.infoText}>📍 {location.address}</Text>
        <Text style={styles.infoText}>🏙️ {location.city}, {location.province}</Text>
      </View>

      {/* Amenities Section */}
      {amenities && Object.keys(amenities).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {amenities.guidedTours && <Text style={styles.tag}>🎯 Guided Tours</Text>}
            {amenities.parkingAvailable && <Text style={styles.tag}>🅿️ Parking</Text>}
            {amenities.restaurants && <Text style={styles.tag}>🍽️ Restaurants</Text>}
            {amenities.restrooms && <Text style={styles.tag}>🚻 Restrooms</Text>}
            {amenities.shops && <Text style={styles.tag}>🛍️ Shops</Text>}
          </View>
        </View>
      )}

      {/* Guidelines Section */}
      {guidelines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guidelines</Text>
          {guidelines.map((guideline, index) => (
            <Text key={index} style={styles.infoText}>
              • {guideline.description}
            </Text>
          ))}
        </View>
      )}

      {/* Type Section */}
      {type && (
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Type</Text>
          <Text style={styles.infoText}>{type}</Text>
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
    marginBottom: 4,
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
  }
});