
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// Use Ionicons-based inline components to match the app UI and avoid SVG asset mismatch
const BackArrow: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 24, height = 24, color = 'white' }) => {
  const size = Math.max(width || 24, height || 24);
  return <Ionicons name="arrow-back" size={size} color={color} />;
};

const Heart: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 24, height = 24, color = 'white' }) => {
  const size = Math.max(width || 16, height || 16);
  return <Ionicons name="heart" size={size} color={color} />;
};

const imgRectangle857 = "https://images.pexels.com/photos/268941/pexels-photo-268941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function PostDetails() {

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: imgRectangle857 }} style={styles.headerImage} />
        <LinearGradient
          // fade from transparent (top) to dark (bottom)
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
        <View style={styles.headerButtons}>
            <Link href="/feed">
                <BackArrow width={39} height={39} />
            </Link>
          <Heart width={39} height={39} color="white" />
        </View>
        <View style={styles.headerTextContainer}>
            <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>Trending</Text>
            </View>
            <Text style={styles.headerTitle}>Perahera Festival Tonight at 7 PM. Book Your Spot Now!</Text>
            <View style={styles.headerInfoContainer}>
                <Text style={styles.headerInfoText}>Trending</Text>
                <View style={styles.dot} />
                <Text style={styles.headerInfoText}>5 hours ago</Text>
            </View>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>
          Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka.
          {
            '\n\n' // This is the only part that needed correction, changing from '\n\n' to '\n\n'
          }
          Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka.
          {
            '\n\n' // This is the only part that needed correction, changing from '\n\n' to '\n\n'
          }
          Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka. Find the best destinations, meals, and stays across Sri Lanka.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerImageContainer: {
        height: 451,
        width: '100%',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerButtons: {
        position: 'absolute',
        top: 67,
        left: 23,
        right: 23,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerTextContainer: {
        position: 'absolute',
        bottom: 20,
        left: 24,
        right: 24,
    },
    trendingBadge: {
        backgroundColor: '#85cc16',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 17.5,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    trendingText: {
        color: 'white',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
    },
    headerTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 23,
        color: 'white',
        marginBottom: 10,
    },
    headerInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerInfoText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: 'white',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'white',
        marginHorizontal: 8,
    },
    contentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 41,
        borderTopRightRadius: 41,
        marginTop: -41,
        padding: 23,
    },
    contentText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        lineHeight: 24,
    },
});
