import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CityCard from '../../../components/ui/CityCard';
import SearchBar from '../../../components/ui/SearchBar';
import LoadingScreen from '../../_components/LoadingScreen';
import { db, storage } from '../../_constants/firebaseConfig';

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
  coverImage?: string;
}
// --- End Interface Definition ---


export default function HomeScreen() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [cities, setCities] = useState<{ id: string; name: string; image?: string }[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('beach');

  // Function to fetch data from Firestore
  const fetchAttractions = async () => {
    try {
      
  // Get all attractions from the attractions collection
  const attractionsRef = collection(db, 'attractions');
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
      
      // Prefer coverImage (if present) otherwise fallback to first image
      const resolved = await Promise.all(
        fetchedAttractions.map(async (a) => {
          const cover = (a as any).coverImage || a.images?.[0];
          if (!cover) return a;
          if (typeof cover === 'string' && cover.startsWith('http')) return { ...a, coverImage: cover };
          try {
            const url = await getDownloadURL(storageRef(storage, cover));
            return { ...a, coverImage: url };
          } catch (err) {
            console.warn('Failed to resolve attraction image for', a.id, err);
            return a;
          }
        })
      );

      setAttractions(resolved);
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

  // Fetch major cities/destinations
  const fetchDestinations = async () => {
    try {
      const ref = collection(db, 'destinations');
      const snap = await getDocs(ref);
      const list: { id: string; name: string; image?: string }[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        // prefer coverImage field, fall back to image if older docs use that
        list.push({ id: doc.id, name: data.name || doc.id, image: data.coverImage || data.image });
      });
      // Resolve storage paths to download URLs when needed
      const resolved = await Promise.all(
        list.map(async (c) => {
          if (!c.image) return c;
          const val = c.image as string;
          if (val.startsWith('http')) return c;
          try {
            const url = await getDownloadURL(storageRef(storage, val));
            return { ...c, image: url };
          } catch (err) {
            // Not a storage path or failed to resolve; log for debugging
            console.warn('Failed to resolve storage url for', c.id, err);
            return c;
          }
        })
      );

      setCities(resolved);
    } catch (err) {
      console.warn('Failed to load destinations', err);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Category tabs for the second section
  const TABS: { key: string; title: string }[] = [
    { key: 'beach', title: 'Beach' },
    { key: 'camping', title: 'Camping' },
    { key: 'safari', title: 'Safari' },
    { key: 'hiking', title: 'Hiking' },
    { key: 'rafting', title: 'Rafting' },
    { key: 'diving', title: 'Diving' },
  ];

  // --- Rendering Functions ---
  const navigateToDetails = (attractionId: string) => {
    router.push({
      pathname: "/explore/post_details",
      params: { id: attractionId }
    });
  };
  
  // Component to render a single attraction card
  const renderItem = ({ item }: { item: Attraction }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigateToDetails(item.id)}
      android_ripple={{ color: '#eee' }}
    >
      {/* Image wrapper so overlay can be anchored to the image bottom */}
      <View style={styles.imageWrap}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.cardImageFull} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImageFull, styles.cardImagePlaceholder]} />
        )}

        {/* Overlay title and small info on top of image (anchored to image bottom) */}
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitleOverlay}>{item.name}</Text>
          <Text style={styles.cardSubtitleOverlay}>{item.location.city}</Text>
        </View>
      </View>

      {/* Bottom info section: rating, reviews, duration, entrance fee and short description */}
      <View style={styles.cardBody}>
        {/* Static horizontal row so all items fit inside the card */}
        <View style={styles.infoRowStatic}>
          <View style={[styles.infoItem, styles.infoItemRating]}>
            <MaterialCommunityIcons name="star" size={16} color="#FFA000" />
            <Text style={styles.ratingText}>{(item.rating ?? 0).toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({item.reviewCount ?? 0})</Text>
          </View>

          <View style={styles.infoItemSmall}>
            <MaterialCommunityIcons name="clock" size={14} color="#666" />
            <Text style={[styles.infoText, styles.infoTextShrink]} numberOfLines={1}>{item.estimatedDuration ?? '—'}</Text>
          </View>

          <View style={styles.infoItemSmall}>
            <MaterialCommunityIcons name="ticket" size={14} color="#666" />
            <Text style={[styles.infoText, styles.infoTextShrink]} numberOfLines={1}>{item.entranceFee ?? 'Free'}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </Pressable>
  );

  // --- Main Component Return ---
  // Filter attractions by search text (name or city)
  const filteredAttractions = attractions.filter((a) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.location.city.toLowerCase().includes(q) ||
      a.location.address.toLowerCase().includes(q)
    );
  });

  // Attractions filtered by selected category tab
  const attractionsForTab = filteredAttractions.filter((a) => a.type?.toLowerCase() === selectedTab.toLowerCase());

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
        <LoadingScreen message="Loading Attractions..." />
      </View>
    );
  }

  // Header component that contains SearchBar and Major Cities section (will scroll away)
  const HeaderComponent = () => (
    <View>
      <SearchBar value={searchText} onChangeText={setSearchText} />

      {cities.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Major Cities</Text>
          <FlatList
            data={cities}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: 16 }}
            renderItem={({ item }) => (
              <CityCard
                name={item.name}
                image={item.image}
                onPress={() => router.push({ pathname: '/explore/post_details', params: { city: item.id } })}
              />
            )}
          />
        </View>
      )}
    </View>
  );

  // Tabs header (this will be the sticky section header)
  const TabsHeader = () => (
    <View style={{ backgroundColor: '#fff' }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 6, marginTop: 18 }}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Relax & Unwind</Text>
      </View>
      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(t) => t.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        renderItem={({ item }) => {
          const active = item.key === selectedTab;
          const iconName = (() => {
            switch (item.key) {
              case 'beach':
                return 'beach';
              case 'camping':
                return 'tent';
              case 'safari':
                return 'paw';
              case 'hiking':
                return 'hiking';
              case 'rafting':
                return 'kayaking';
              case 'diving':
                return 'scuba-diving';
              default:
                return 'star';
            }
          })();

          return (
            <TouchableOpacity
              onPress={() => setSelectedTab(item.key)}
              style={[
                styles.tabButton,
                active && styles.tabButtonActive,
                active && styles.tabButtonSelectedBottom,
              ]}
            >
              <MaterialCommunityIcons name={iconName as any} size={20} color={active ? '#000' : '#9B9B9B'} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.title}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={[{ title: 'attractions', data: attractionsForTab }]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={HeaderComponent}
        renderSectionHeader={() => <TabsHeader />}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.loadingContainer}>
            <Text>No attractions found.</Text>
          </View>
        )}
      />
    </View>
  );
}


// --- Styles (cleaned) ---
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
    padding: 0,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImageFull: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardImagePlaceholder: { backgroundColor: '#e6e6e6' },
  cardOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    maxWidth: '72%',
    // ensure overlay sits above the image
    zIndex: 10,
  },
  cardTitleOverlay: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardSubtitleOverlay: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#000' },
  tabButtonSelectedBottom: {
    borderBottomColor: '#000',
    borderBottomWidth: 3,
    paddingBottom: 6,
  },
  /* Bottom info section styles */
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowContent: {
    alignItems: 'center',
    paddingRight: 12,
  },
  infoRowStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  infoItemRating: {
    minWidth: 110,
  },
  infoItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoText: {
    color: '#666',
    marginLeft: 6,
    fontSize: 12,
  },
  infoTextShrink: {
    maxWidth: 80,
  },
  ratingText: { marginLeft: 6, fontWeight: '700', color: '#222' },
  reviewsText: { marginLeft: 6, color: '#888', fontSize: 12 },
  cardDescription: { color: '#6b6b6b', fontSize: 13, lineHeight: 18 },
});