import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoadingScreen from '../../_components/LoadingScreen';
import { db } from '../../_constants/firebaseConfig';

// simple BackArrow and Heart components using Ionicons to avoid missing component errors
const BackArrow: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 24, height = 24, color = 'black' }) => {
  // Ionicons accepts a single size prop; pick the larger of width/height
  const size = Math.max(width || 24, height || 24);
  return <Ionicons name="arrow-back" size={size} color={color} />;
};

const Heart: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 16, height = 16, color = 'black' }) => {
  const size = Math.max(width || 16, height || 16);
  return <Ionicons name="heart" size={size} color={color} />;
};

export default function Feed() {
  const [loaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'), 
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
  });
  // keep hooks (state/memo) here so they are always called in the same order
  const [selectedTab, setSelectedTab] = useState<string>('');
    const [categories, setCategories] = useState<{ key: string; color: string }[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // helper to format Firestore Timestamp/ISO/Date to concise labels
  // returns: 'right now', '1m', '5m', '1h', '2h', '1d', '2d', '1w', '3w', or 'Oct 20' for older
  const timeAgo = (val: any) => {
    if (!val) return '';
    let date: Date;
    try {
      if (val && typeof val.toDate === 'function') date = val.toDate(); // Firestore Timestamp
      else if (typeof val === 'string') date = new Date(val);
      else if (val instanceof Date) date = val;
      else date = new Date(val);
    } catch {
      return '';
    }

    const now = Date.now();
    const diff = Math.floor((now - date.getTime()) / 1000); // seconds
    if (diff < 10) return 'Right now';
    if (diff < 60) return `${diff}s`;
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;

    // older: show short date
    try {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return date.toDateString();
    }
  };

  // derived filtered posts based on selected tab
  const filteredPosts = useMemo(() => {
    if (!selectedTab) return posts;
    return posts.filter((p) => p.category === selectedTab);
  }, [posts, selectedTab]);

  // fetch categories and posts from Firestore on mount
  useEffect(() => {
    let mounted = true;

    const fetchFeed = async () => {
      try {
        // load categories mapping from meta/feed_categories
        const metaRef = doc(db, 'meta', 'feed_categories');
        const metaSnap = await getDoc(metaRef);
        if (metaSnap.exists()) {
          const data = metaSnap.data();
          const catsObj = data.categories || data;
          let cats = Object.keys(catsObj).map((k) => ({ key: k, color: catsObj[k] }));
          // order categories exactly as requested; unknowns go last
          const desiredOrder = ['Trending','Alerts','Weather','Transport','Events','Sites','Deals','Tips'];
          cats = cats.sort((a, b) => {
            const ia = desiredOrder.indexOf(a.key);
            const ib = desiredOrder.indexOf(b.key);
            if (ia === -1 && ib === -1) return 0;
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
          });
          if (mounted) {
            setCategories(cats);
            // set default selected tab to Trending if present, otherwise first category
            setSelectedTab((prev) => (prev || (cats.find(c => c.key === 'Trending')?.key) || cats[0]?.key || ''));
          }
        }

        // load posts ordered by uploadedAt desc
        const q = query(collection(db, 'feed_posts'), orderBy('uploadedAt', 'desc'));
        const snap = await getDocs(q);
        const loaded = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        if (mounted) setPosts(loaded);
      } catch {
        // keep console error for dev diagnostics
        console.error('Failed to load feed from Firestore');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFeed();
    return () => { mounted = false; };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <BackArrow width={31} height={31} />
        <Text style={styles.headerTitle}>Feed</Text>
      </View>

      {loading ? <LoadingScreen message="Loading feed..." /> : null}

      <Text style={styles.featuredNews}>Featured News</Text>

      {/* Featured horizontal carousel: use Firestore "featured" posts */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={{ paddingHorizontal: 15 }}>
        {posts.filter((p) => p.featured).map((p) => {
          const badgeColor = categories.find((c) => c.key === p.category)?.color || '#85cc16';
          return (
            <Link key={p.id} href={{ pathname: '/feed/post_details', params: { postId: p.id } }} asChild>
              <TouchableOpacity style={styles.peraheraCard}>
                <Image source={{ uri: p.image }} style={styles.peraheraImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.gradient}
                />
                <View style={[styles.trendingBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.trendingText}>{p.category}</Text>
                </View>

                {/* top-right overlay for time and likes */}
                <View style={styles.topRightOverlay}>
                  <View style={styles.topRightItem}>
                    <Ionicons name="time-outline" size={14} color="white" />
                    <Text style={styles.topRightText}>{timeAgo(p.uploadedAt)}</Text>
                  </View>
                  <View style={styles.topRightItem}>
                    <Heart width={14} height={14} color="white" />
                    <Text style={styles.topRightText}>{p.likes ?? ''}</Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.peraheraText}>{p.title}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll} contentContainerStyle={{ paddingHorizontal: 15 }}>
        {categories.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setSelectedTab(tab.key)}
            style={[
              styles.tag,
              { backgroundColor: tab.color },
              selectedTab === tab.key && styles.tagSelected,
            ]}
          >
            <Text style={[styles.tagText, selectedTab === tab.key ? styles.tagTextActive : null]}>{tab.key}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {filteredPosts.map((post) => (
        <Link key={post.id} href={{ pathname: '/feed/post_details', params: { postId: post.id } }} asChild>
          <TouchableOpacity style={styles.festivalCard}>
            <Image source={{ uri: post.image }} style={styles.festivalImage} />
            <Text style={styles.festivalTitle}>{post.title}</Text>
            <Text style={styles.festivalDescription}>{post.description ?? 'Don’t miss the latest updates. Tap to read more.'}</Text>
            <View style={styles.festivalInfo}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name="time-outline" size={12} color="black" />
                  <Text style={styles.festivalInfoText}>{timeAgo(post.uploadedAt)}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Heart width={12} height={12} color="black" />
                  <Text style={styles.festivalInfoText}>{post.likes ?? ''}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 23,
    textAlign: 'center',
    flex: 1,
    marginRight: 31, // to balance the back button
  },
  featuredNews: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    marginBottom: 15,
  },
  horizontalScroll: {
    marginBottom: 20,
    // counteract parent container padding so carousel can reach screen edges
    marginHorizontal: -15,
  },
  peraheraCard: {
    width: 320,
    height: 173,
    borderRadius: 12,
    marginRight: 15,
  },
  peraheraImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#85cc16',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 17.5,
  },
  trendingText: {
    color: 'black',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  cardInfoTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
    gap: 8
  },
  cardInfoText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 8,
    marginLeft: 4,
  },
  peraheraText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
    lineHeight: 20,
  },
  tagsScroll: {
    flexDirection: 'row',
    marginBottom: 20,
    // align tags to screen edges (counteract parent padding)
    marginHorizontal: -15,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 17.5,
    marginRight: 10,
    // keep a constant border so selection doesn't shift layout
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  tagSelected: {
    borderColor: '#888',
  },
  tagTextActive: {
    color: '#111',
  },
  festivalCard: {
    marginBottom: 20,
  },
  festivalImage: {
    width: '100%',
    height: 156,
    borderRadius: 10,
    marginBottom: 10,
  },
  festivalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    marginBottom: 5,
  },
  festivalDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#6b7066',
    marginBottom: 10,
  },
  topRightOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
  },
  topRightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  topRightText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 6,
  },
  festivalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  festivalInfoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#d9d9d9',
    marginVertical: 10,
  }
});