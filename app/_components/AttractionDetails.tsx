import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import SVGs as components (svg files placed under app/assets/images/post_details)
import ExploreSvg from "../assets/images/post_details/Explore.svg";
import HeartSvg from "../assets/images/post_details/Heart.svg";
import LeftArrowSvg from "../assets/images/post_details/Left Arrow.svg";
import LocationSvg from "../assets/images/post_details/Location.svg";
import MirissaSvg from "../assets/images/post_details/Mirissa.svg";
import StarSvg from "../assets/images/post_details/Star.svg";
import VerificationSvg from "../assets/images/post_details/Verification.svg";

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
    icon?: string;
    type?: string;
  }[];
}

type AttractionHeaderProps = Partial<
  Pick<
    AttractionDetailsProps,
    "name" | "description" | "images" | "location" | "rating" | "reviewCount"
  >
> & {
  onExplorePress?: () => void;
  onBack?: () => void;
  onToggleFavorite?: () => void;
  favorited?: boolean;
};

const AttractionHeader: React.FC<AttractionHeaderProps> = ({
  onExplorePress,
  name,
  description,
  images,
  location,
  rating,
  reviewCount,
  onBack,
  onToggleFavorite,
  favorited,
}) => {
  // dynamic top inset to account for notch / dynamic island on iOS
  const DEFAULT_TOP_INSET = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
  const avatarSources = images && images.length > 0 ? images.slice(0, 5) : [];

  // Animated progress for images: activeIndex controls which image is shown
  const imageCount = (images && images.length) || 0;
  const [activeIndex, setActiveIndex] = useState(0);
  // single animated value drives the current active bar (simpler & reliable)
  const currentProgressRef = useRef(new Animated.Value(0));
  // bounce animation for scroll hint
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const currentAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const pausedRef = useRef(false);
  const pausedProgressRef = useRef<Record<number, number>>({});

  // reset state when images length changes (reset animation)
  useEffect(() => {
    // stop any existing animation
    if (currentAnimRef.current && (currentAnimRef.current as any).stop)
      (currentAnimRef.current as any).stop();
    currentProgressRef.current.setValue(0);
    setActiveIndex(0);
    // reset paused state/progress to avoid stale values causing immediate completion
    pausedRef.current = false;
    pausedProgressRef.current = {};
    // if only one image, fill it immediately
    if (imageCount === 1) {
      currentProgressRef.current.setValue(1);
    }
  }, [imageCount]);

  // Bounce animation for scroll hint
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, [bounceAnim]);

  // animate the active bar and advance index when complete
  useEffect(() => {
    if (imageCount <= 1) return;
    // ensure completed bars are full (rendering will reflect this)
    let running = true;
    const durationMs = 6000;

    const animateIndex = (index: number) => {
      if (!running || pausedRef.current) return;
      const resumeFrom = Math.min(0.994, pausedProgressRef.current[index] ?? 0);
      currentProgressRef.current.setValue(resumeFrom);
      const remainingRatio = Math.max(0, 1 - resumeFrom);
      const minDuration = 200;
      const dur = Math.max(
        minDuration,
        Math.round(remainingRatio * durationMs)
      );
      currentAnimRef.current = Animated.timing(currentProgressRef.current, {
        toValue: 1,
        duration: dur,
        useNativeDriver: false,
      });
      currentAnimRef.current.start(() => {
        if (!running) return;
        delete pausedProgressRef.current[index];
        if (index < imageCount - 1) {
          // reset progress immediately so the newly-active bar doesn't render as full
          currentProgressRef.current.setValue(0);
          setActiveIndex(index + 1);
        }
        // else stop at final slide
      });
    };

    // start animation for the current activeIndex after a short delay so layout/images can settle
    const startDelay = 120;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    const startNow = () => animateIndex(activeIndex);
    // try rAF first for smoother start, fallback to timeout
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        startTimer = setTimeout(startNow, startDelay);
      });
    } else {
      startTimer = setTimeout(startNow, startDelay);
    }

    return () => {
      running = false;
      if (currentAnimRef.current && (currentAnimRef.current as any).stop)
        (currentAnimRef.current as any).stop();
      if (startTimer) clearTimeout(startTimer);
    };
  }, [activeIndex, imageCount]);

  // Pause/resume helpers for long-press behavior
  const pauseAnimation = () => {
    pausedRef.current = true;
    const cur = currentProgressRef.current;
    if (cur) {
      cur.stopAnimation((val: number) => {
        pausedProgressRef.current[activeIndex] = val || 0;
      });
    }
    if (currentAnimRef.current && (currentAnimRef.current as any).stop)
      (currentAnimRef.current as any).stop();
  };

  const resumeAnimation = () => {
    pausedRef.current = false;
    const cur = currentProgressRef.current;
    const val = pausedProgressRef.current[activeIndex] ?? 0;
    if (!cur) return;
    cur.setValue(val);
    const remaining = Math.max(0, 1 - val);
    if (remaining <= 0) return;
    currentAnimRef.current = Animated.timing(cur, {
      toValue: 1,
      duration: Math.round(remaining * 6000),
      useNativeDriver: false,
    });
    currentAnimRef.current.start(() => {
      delete pausedProgressRef.current[activeIndex];
      if (activeIndex < imageCount - 1) {
        // when resumed animation completes, ensure the next slide's progress starts from 0
        currentProgressRef.current.setValue(0);
        setActiveIndex(activeIndex + 1);
      }
    });
  };

  // Tap handlers (left/right) and hold-to-pause for the cover
  const { width: screenWidth } = Dimensions.get("window");
  const handleCoverTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (locationX < screenWidth / 2) {
      // go to previous
      const prev = Math.max(0, activeIndex - 1);
      // stop current animation and reset progress
      if (currentAnimRef.current && (currentAnimRef.current as any).stop)
        (currentAnimRef.current as any).stop();
      currentProgressRef.current.setValue(0);
      setActiveIndex(prev);
    } else {
      // go to next (if not last)
      const next = Math.min(imageCount - 1, activeIndex + 1);
      if (currentAnimRef.current && (currentAnimRef.current as any).stop)
        (currentAnimRef.current as any).stop();
      currentProgressRef.current.setValue(0);
      setActiveIndex(next);
    }
  };

  const coverUri =
    images && images.length > 0 ? images[activeIndex] : undefined;

  return (
    <View style={styles.headerImage}>
      {/* Fallback background to avoid flicker while SVG mounts */}
      <View style={styles.coverFallback} pointerEvents="none" />
      {/* Cover SVG as background; mark ready on layout */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.coverWrapper}
        onPress={(e) => handleCoverTap(e)}
        onLongPress={() => pauseAnimation()}
        onPressOut={() => resumeAnimation()}
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverSvg}
            resizeMode="cover"
          />
        ) : (
          <MirissaSvg
            width={"100%"}
            height={"100%"}
            preserveAspectRatio="xMidYMid slice"
            style={styles.coverSvg}
          />
        )}
      </TouchableOpacity>

      {/* full-cover gradient to darken the image progressively */}
      <LinearGradient
        colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.70)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.coverGradient}
        pointerEvents="none"
      />

      <View style={[styles.topIcons, { top: DEFAULT_TOP_INSET + 12 }]} pointerEvents="box-none">
        <TouchableOpacity style={[styles.coverIconWrapper]} onPress={onBack}>
          <LeftArrowSvg width={20} height={20} fill={"#fff"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.coverIconWrapper,
            favorited ? { backgroundColor: "rgba(255,255,255,0.12)" } : undefined,
          ]}
          onPress={onToggleFavorite}
        >
          <HeartSvg width={20} height={20} fill={favorited ? "#ff3366" : "#fff"} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.65)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomOverlay}
      >
        <View style={styles.recommendedRow}>
          <Text style={styles.tourlyRecommended}>TOURLY RECOMMENDED</Text>
          <View style={styles.verifiedBadgeWrap}>
            <VerificationSvg width={17} height={17} />
          </View>
        </View>

        <Text style={styles.beachName}>{name ?? "Mirissa Beach"}</Text>

        <View style={styles.locationContainer}>
          <LocationSvg width={14} height={14} />
          <Text style={styles.locationText}>
            {location?.city ?? location?.address ?? "Mirissa"}
          </Text>
          {/* Inline rating next to city */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 22,
            }}
          >
            <StarSvg width={14} height={14} />
            <Text style={[styles.locationText, { marginLeft: 6 }]}>
              {" "}
              {rating ? rating.toFixed(1) : "4.8"}
            </Text>
          </View>
        </View>

        <View style={styles.peopleExploredContainerSmall}>
          <Text style={styles.peopleExploredText}>
            <Text style={styles.peopleCount}>
              {reviewCount && reviewCount >= 100
                ? `${Math.floor(reviewCount / 10) * 10}+`
                : (reviewCount ?? "100+")}
            </Text>{" "}
            people have explored
          </Text>
          <View style={styles.avatarContainerSmall}>
            {(avatarSources.length > 0
              ? avatarSources
              : [undefined, undefined, undefined, undefined, undefined]
            ).map((src, idx) => {
              const size = 30;
              return (
                <View
                  key={idx}
                  style={[
                    styles.avatarBase,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      marginLeft: idx === 0 ? 0 : -14,
                      zIndex: idx + 1,
                    },
                  ]}
                >
                  {src ? (
                    <Image
                      source={{ uri: src }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: size / 2,
                      }}
                    />
                  ) : (
                    <VerificationSvg width={16} height={16} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Animated progress indicators (auto-sliding) + count pill */}
        <View style={styles.progressAndCountRow}>
          <View style={styles.progressBarsContainer}>
            {Array.from({ length: Math.max(1, imageCount) }).map((_, idx) => (
              <View key={idx} style={styles.progressBarBackgroundSmall}>
                {/* completed */}
                {idx < activeIndex && (
                  <View
                    style={[styles.progressBarFilledSmall, { width: "100%" }]}
                  />
                )}
                {/* current active */}
                {idx === activeIndex && (
                  <Animated.View
                    style={[
                      styles.progressBarFilledSmall,
                      {
                        width: currentProgressRef.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      } as any,
                    ]}
                  />
                )}
                {/* pending: no filled view */}
              </View>
            ))}
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {(images && images.length) || 0}
            </Text>
          </View>
        </View>

        <Text style={styles.beachDescription} numberOfLines={6}>
          {description ??
            `Mirissa Beach is a picturesque crescent-shaped sandy beach, known for its calm clear waters, coconut palms, and stunning sunsets.`}
        </Text>

        {/* Explore button: visible and calls onExplorePress to scroll to details */}
        {onExplorePress && (
          <View style={styles.exploreRowCentered}>
            <TouchableOpacity
              style={styles.exploreButtonLarge}
              onPress={onExplorePress}
              activeOpacity={0.9}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ExploreSvg width={28} height={28} />
                <Text
                  style={[styles.exploreButtonTextLarge, { marginLeft: 10 }]}
                >
                  Get Directions
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionRowLarge}>
          <View style={styles.topRowActions}>
            {/* <TouchableOpacity
              style={styles.scrollHintButton}
              onPress={onExplorePress}
              activeOpacity={0.8}
            > */}
            <Animated.View
              style={[
                styles.scrollHintContent,
                { transform: [{ translateY: bounceAnim }] },
              ]}
            >
              <Text style={styles.scrollHintText}>Swipe up for details</Text>
              <Text style={styles.scrollHintArrow}>↑</Text>
            </Animated.View>
            {/* </TouchableOpacity> */}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export function AttractionDetails(props: AttractionDetailsProps) {
  const {
    name,
    description,
  images = [],
    location,
    rating = 4.5,
    reviewCount = 100,
    type = "Tourist Attraction",
    estimatedDuration = "2-3 hours",
    entranceFee = "Free",
    bestTimeToVisit = "Morning",
    amenities = {},
    guidelines = [],
  } = props;

  const scrollViewRef = useRef<ScrollView | null>(null);
  const detailsViewRef = useRef<View | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerScrollRef = useRef<ScrollView | null>(null);
  const router = useRouter();

  // Open directions in external map apps. If both Google Maps and Apple Maps are
  // available (iOS), prompt the user to choose. On Android try Google Maps intent
  // first and fall back to web directions.
  const openMapsDirections = async () => {
    if (!location?.coordinates) {
      Alert.alert("Location unavailable", "This attraction does not have coordinates.");
      return;
    }
    const { latitude, longitude } = location.coordinates;
    const label = encodeURIComponent(name || "Destination");
    // Helper to open URLs safely with a fallback alert
    const tryOpen = async (url: string) => {
      try {
        await Linking.openURL(url);
        return true;
      } catch {
        return false;
      }
    };

    // iOS: offer a chooser when both Google Maps and Apple Maps exist. Also persist a preference to avoid prompting repeatedly.
    if (Platform.OS === "ios") {
      const googleScheme = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
      const appleUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;

      // First ask the user which app they'd like to use (Google or Apple).
      // After they choose, ask whether to open this time or always use that app.
      // Persist choice when requested via dynamic AsyncStorage import.
      const primaryOptions = ['Google Maps', 'Apple Maps', 'Cancel'];
      const CANCEL_INDEX = 2;

      const handleChoiceAndOpen = async (chosen: 'google' | 'apple') => {
        // Secondary prompt: open this time or always use chosen app
        const secondaryOptions = ['Open this time', `Always use ${chosen === 'google' ? 'Google Maps' : 'Apple Maps'}`, 'Cancel'];
        const SECONDARY_CANCEL = 2;

        const openSelected = async () => {
          try {
            if (chosen === 'google') {
              if (!(await tryOpen(googleScheme))) {
                if (!(await tryOpen(appleUrl))) {
                  const web = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`;
                  if (!(await tryOpen(web))) Alert.alert('Unable to open maps', 'No map application is available.');
                }
              }
            } else {
              if (!(await tryOpen(appleUrl))) {
                if (!(await tryOpen(googleScheme))) {
                  const web = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`;
                  if (!(await tryOpen(web))) Alert.alert('Unable to open maps', 'No map application is available.');
                }
              }
            }
          } catch {
            Alert.alert('Unable to open maps', 'No map application is available.');
          }
        };

        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            { options: secondaryOptions, cancelButtonIndex: SECONDARY_CANCEL },
            async (idx: number) => {
              if (idx === SECONDARY_CANCEL) return;
              if (idx === 1) {
                // persist preference
                try {
                  const mod = await import('@react-native-async-storage/async-storage');
                  const AsyncStorageOptional = mod?.default ?? mod;
                  if (AsyncStorageOptional && AsyncStorageOptional.setItem) {
                    await AsyncStorageOptional.setItem('preferredMapsApp', chosen);
                  }
                } catch {}
              }
              // idx === 0 (Open this time) or idx === 1 (Always) both open now
              await openSelected();
            }
          );
        } else {
          // Android fallback: Alert with the same options
          Alert.alert('', `Open with ${chosen === 'google' ? 'Google Maps' : 'Apple Maps'}`, [
            {
              text: 'Always use',
              onPress: async () => {
                try {
                  const mod = await import('@react-native-async-storage/async-storage');
                  const AsyncStorageOptional = mod?.default ?? mod;
                  if (AsyncStorageOptional && AsyncStorageOptional.setItem) {
                    await AsyncStorageOptional.setItem('preferredMapsApp', chosen);
                  }
                } catch {}
                await openSelected();
              },
            },
            {
              text: 'Open this time',
              onPress: async () => {
                await openSelected();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }
      };

      ActionSheetIOS.showActionSheetWithOptions(
        { options: primaryOptions, cancelButtonIndex: CANCEL_INDEX },
        (buttonIndex: number) => {
          if (buttonIndex === CANCEL_INDEX) return;
          const chosen = buttonIndex === 0 ? 'google' : 'apple';
          handleChoiceAndOpen(chosen);
        }
      );
      return;
    }

    // Android: try google navigation intent, then fallback to web
    const googleNav = `google.navigation:q=${latitude},${longitude}&mode=d`;
    const web = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    try {
      await Linking.openURL(googleNav);
      return;
    } catch {
      // fallback to web link
      Linking.openURL(web).catch(() => {
        Alert.alert("Unable to open maps", "No map application is available.");
      });
    }
  };

  // local favorite state (UI-only toggle for now)
  const [favorited, setFavorited] = useState(false);

  // top bar overlay opacity and visibility handling
  const topBarOpacity = useRef(new Animated.Value(0)).current;
  const topBarVisibleRef = useRef(false);
  const [topBarVisible, setTopBarVisible] = useState(false);
  // compute threshold so the overlay appears when the cover/header is scrolled up
  const TOP_INSET = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
  const HEADER_HEIGHT = 844; // matches styles.headerImage height
  const SCROLL_THRESHOLD = Math.max(80, HEADER_HEIGHT - (TOP_INSET + 72));

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const shouldShow = y > SCROLL_THRESHOLD;
    if (shouldShow !== topBarVisibleRef.current) {
      topBarVisibleRef.current = shouldShow;
      // update state so pointerEvents updates and re-renders
      setTopBarVisible(shouldShow);
      Animated.timing(topBarOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  };

  // (previously used to scroll to details; replaced by openMapsDirections for Get Directions)

  // When modal opens, ensure the viewer scrolls to the requested index
  useEffect(() => {
    if (!modalVisible) return;
    const width = Dimensions.get("window").width;
    // small delay to wait for modal layout
    const t = setTimeout(() => {
      if (viewerScrollRef.current) {
        viewerScrollRef.current.scrollTo({ x: viewerIndex * width, animated: false });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [modalVisible, viewerIndex]);

  // Handle thumbnail press with optional persistence ('Always open viewer' vs 'Open this time')
  const handleThumbPress = async (idx: number) => {
    // Try to read stored preference first
    try {
      const mod = await import('@react-native-async-storage/async-storage');
      const AsyncStorageOptional = mod?.default ?? mod;
      if (AsyncStorageOptional && AsyncStorageOptional.getItem) {
        const pref = await AsyncStorageOptional.getItem('galleryOpenPreference');
        if (pref === 'always') {
          setViewerIndex(idx);
          setModalVisible(true);
          return;
        }
      }
    } catch {
      // ignore if AsyncStorage not available
    }

    // No stored preference — prompt the user
    if (Platform.OS === 'ios') {
      const options = ['Always open viewer', 'Open this time', 'Cancel'];
      const CANCEL_INDEX = 2;
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: CANCEL_INDEX },
        async (buttonIndex: number) => {
          if (buttonIndex === CANCEL_INDEX) return;
          if (buttonIndex === 0) {
            // Always open viewer: try to persist
            try {
              const mod = await import('@react-native-async-storage/async-storage');
              const AsyncStorageOptional = mod?.default ?? mod;
              if (AsyncStorageOptional && AsyncStorageOptional.setItem) {
                await AsyncStorageOptional.setItem('galleryOpenPreference', 'always');
              }
            } catch {
              // ignore
            }
            setViewerIndex(idx);
            setModalVisible(true);
          } else if (buttonIndex === 1) {
            // Open this time
            setViewerIndex(idx);
            setModalVisible(true);
          }
        }
      );
    } else {
      // Android / fallback: simple Alert with two choices
      Alert.alert('', 'Open photos', [
        {
          text: 'Always open viewer',
          onPress: async () => {
            try {
              const mod = await import('@react-native-async-storage/async-storage');
              const AsyncStorageOptional = mod?.default ?? mod;
              if (AsyncStorageOptional && AsyncStorageOptional.setItem) {
                await AsyncStorageOptional.setItem('galleryOpenPreference', 'always');
              }
            } catch {}
            setViewerIndex(idx);
            setModalVisible(true);
          },
        },
        {
          text: 'Open this time',
          onPress: () => {
            setViewerIndex(idx);
            setModalVisible(true);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        ref={scrollViewRef}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <AttractionHeader
          onExplorePress={openMapsDirections}
          name={name}
          description={description}
          images={images}
          location={location}
          rating={rating}
          reviewCount={reviewCount}
          onBack={() => router.back()}
          favorited={favorited}
          onToggleFavorite={() => setFavorited((v) => !v)}
        />

        <View ref={detailsViewRef}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Information</Text>
            <Text style={styles.infoText}>🕒 Duration: {estimatedDuration}</Text>
            <Text style={styles.infoText}>💰 Entrance Fee: {entranceFee}</Text>
            <Text style={styles.infoText}>⏰ Best Time: {bestTimeToVisit}</Text>
          </View>

          {images && images.length > 0 && (
            <View style={styles.gallerySection}>
              <Text style={styles.galleryTitle}>Photos</Text>
              <View style={styles.galleryRow}>
                {images.slice(0, 3).map((uri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.9}
                    style={styles.thumbWrap}
                    onPress={() => handleThumbPress(idx)}
                  >
                    <Image source={{ uri }} style={styles.thumbImage} />
                    {idx === 2 && images.length > 3 && (
                      <View style={styles.moreOverlay} pointerEvents="none">
                        <Text style={styles.moreText}>+{images.length - 3}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.infoText}>📍 {location.address}</Text>
            <Text style={styles.infoText}>
              🏙️ {location.city}, {location.province}
            </Text>
          </View>

          {amenities && Object.keys(amenities).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {amenities.guidedTours && (
                  <Text style={styles.tag}>🎯 Guided Tours</Text>
                )}
                {amenities.parkingAvailable && (
                  <Text style={styles.tag}>🅿️ Parking</Text>
                )}
                {amenities.restaurants && (
                  <Text style={styles.tag}>🍽️ Restaurants</Text>
                )}
                {amenities.restrooms && (
                  <Text style={styles.tag}>🚻 Restrooms</Text>
                )}
                {amenities.shops && <Text style={styles.tag}>🛍️ Shops</Text>}
              </View>
            </View>
          )}

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

          {type && (
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Type</Text>
              <Text style={styles.infoText}>{type}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fullscreen modal image viewer */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={[styles.modalClose, { right: 20 }]}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.coverIconWrapper}>
              <LeftArrowSvg width={20} height={20} fill={"#fff"} />
            </View>
          </TouchableOpacity>
          <ScrollView
            ref={viewerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {images.map((uri, i) => (
              <View
                key={i}
                style={{
                  width: Dimensions.get("window").width,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri }}
                  style={[
                    styles.fullImage,
                    {
                      width: Dimensions.get("window").width * 0.92,
                      height: Dimensions.get("window").height * 0.8,
                      resizeMode: "contain",
                    },
                  ]}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Overlay top bar that appears after scrolling */}
      <Animated.View
        pointerEvents={topBarVisible ? "auto" : "none"}
        style={[
          styles.topBarOverlay,
          { opacity: topBarOpacity, height: TOP_INSET + 56, justifyContent: "flex-end" },
        ]}
      >
        {/* inner bar sits at the bottom of the overlay area so nothing above it shows as empty */}
        <View style={[styles.topBar, { paddingVertical: 8 }]}> 
          <TouchableOpacity style={[styles.coverIconWrapper]} onPress={() => router.back()}>
            <LeftArrowSvg width={20} height={20} fill={"#fff"} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
          <TouchableOpacity
            style={[styles.coverIconWrapper]}
            onPress={() => setFavorited((v) => !v)}
          >
            <HeartSvg width={20} height={20} fill={favorited ? "#ff3366" : "#fff"} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b4660" },
  scrollContent: { backgroundColor: "#fff" },
  headerImage: { width: "100%", height: 844, justifyContent: "flex-end" },
  coverSvg: { position: "absolute", top: 0, left: 0, right: 0, height: 844 },
  coverFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 844,
    backgroundColor: "#0b4660",
  },
  coverWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 844,
  },
  topIcons: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 8,
    borderRadius: 20,
  },
  overlayIcon: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)'
  },
  topIcon: { width: 24, height: 24, tintColor: "white" },
  coverIconWrapper: { backgroundColor: 'rgba(0,0,0,0.28)', padding: 8, borderRadius: 20 },
  bottomOverlay: {
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 110,
    marginTop: 180,
    zIndex: 10,
  },

  coverGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 844,
    zIndex: 2,
  },
  progressAndCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  progressBarsContainer: { flex: 1, flexDirection: "row", gap: 8 },
  progressBarBackgroundSmall: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 6,
  },
  progressBarFilledSmall: {
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
    width: "0%",
  },
  countPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  countPillText: { color: "white", fontWeight: "700" },
  tourlyRecommended: {
    color: "white",
    fontSize: 11,
    letterSpacing: 1,
    marginRight: 8,
    fontFamily: "Poppins-SemiBold",
  },
  beachName: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 48,
    fontFamily: "Poppins-SemiBold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationIcon: { width: 16, height: 16, tintColor: "white" },
  locationText: {
    color: "white",
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
  },
  peopleExploredContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  peopleExploredContainerSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
  },
  peopleExploredText: {
    color: "white",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  peopleCount: { color: "white", fontSize: 13, fontFamily: "Poppins-SemiBold" },
  avatarContainerSmall: {
    flexDirection: "row",
    marginLeft: 12,
    alignItems: "center",
  },
  avatarBase: {
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  verifiedBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -2 }],
  },
  verifiedBadgeWrap: {
    marginLeft: -3,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerRowThin: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  dividerThin: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginHorizontal: 8,
  },
  beachDescription: {
    color: "white",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.95,
  },
  actionRowLarge: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  topRowActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exploreRowCentered: { marginTop: 25, alignItems: "center" },
  leftActionRow: { flexDirection: "row", alignItems: "center" },
  scrollHintButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginTop: 10,
  },
  scrollHintContent: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: 15,
    marginBottom: -3,
  },
  scrollHintText: {
    color: "white",
    fontSize: 9,
    fontFamily: "Poppins-Regular",
    marginRight: 6,
  },
  scrollHintArrow: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  starRowLarge: { flexDirection: "row", alignItems: "center" },
  starTextLarge: { color: "white", marginLeft: 8, fontWeight: "700" },
  exploreButtonLarge: {
    flexDirection: "row",
    backgroundColor: "#85cc16",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 200,
    alignItems: "center",
    minWidth: 320,
    justifyContent: "center",
    marginTop: -14,
  },
  exploreButtonTextLarge: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
    fontSize: 16,
  },

  headerSection: { padding: 16, backgroundColor: "#f8f8f8" },
  headerSectionSticky: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, zIndex: 20 },
  headerSectionStickyWrap: { paddingTop: 10, backgroundColor: 'transparent' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, justifyContent: 'flex-start' },
  metaPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f7f9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, marginRight: 8 },
  metaPillText: { marginLeft: 8, color: '#444', fontFamily: 'Poppins-Regular', fontSize: 13 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'transparent' },
  topBarTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#111', textAlign: 'center', flex: 1, marginHorizontal: 12 },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: 8,
  },
  rating: { fontSize: 16, color: "#666", marginBottom: 4 },
  imageContainer: { height: 200, marginVertical: 16 },
  image: { width: 300, height: 200, marginHorizontal: 8, borderRadius: 8 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  lastSection: { borderBottomWidth: 0 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  description: { fontSize: 16, lineHeight: 24, color: "#444" },
  infoText: { fontSize: 16, marginBottom: 8, color: "#555" },
  amenitiesContainer: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    color: "#666",
  },
  directionsButton: {
    backgroundColor: "#2196F3",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  directionsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  /* Gallery / viewer styles */
  gallerySection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  galleryTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
  },
  galleryRow: { flexDirection: "row", alignItems: "center" },
  thumbWrap: {
    width: 111,
    height: 111,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#eee",
  },
  thumbImage: { width: "100%", height: "100%" },
  moreOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: { color: "white", fontSize: 18, fontWeight: "700" },
  modalContainer: { flex: 1, backgroundColor: "#000" },
  modalClose: { position: "absolute", top: 40, right: 20, zIndex: 20 },
  fullImage: { width: "90%", height: "90%" },
  topBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    backgroundColor: '#fff',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    // Android elevation
    elevation: 6,
  },
});

