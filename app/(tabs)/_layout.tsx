import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Explore from '../assets/images/tabbar/Explore.svg';
import Feed from '../assets/images/tabbar/Feed.svg';
import MiddleIcon from '../assets/images/tabbar/middleIcon.svg';
import Profile from '../assets/images/tabbar/Profile.svg';
import Utils from '../assets/images/tabbar/Utils.svg';


// Icons use opacity changes for active / inactive states now

const { width } = Dimensions.get('window');

// Replace MyTabBar with a slot-based implementation to ensure equal spacing
const SLOT_WIDTH = 64; // adjusted slot width for better spacing

const MyTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const routes = state.routes;
  const homeRoute = routes.find((r) => /home/i.test(r.name));
  // Ensure nonHomeRoutes are ordered: feed, explore, utils, profile
  const nonHomeRoutes = [
    routes.find((r) => /feed/i.test(r.name)),
    routes.find((r) => /explore/i.test(r.name)),
    routes.find((r) => /utils/i.test(r.name)),
    routes.find((r) => /profile/i.test(r.name)),
  ].filter(Boolean);

  // pick slots deterministically: left1=feed, left2=explore, center=home, right1=utils, right2=profile
  const left1 = nonHomeRoutes[0];
  const left2 = nonHomeRoutes[1];
  const right1 = nonHomeRoutes[2];
  const right2 = nonHomeRoutes[3];

  const renderSlot = (route: any) => {
    if (!route) return <View style={{ width: SLOT_WIDTH }} />;

    const index = routes.indexOf(route);
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.slot}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
      >
        {getIconComponent(route.name, isFocused)}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.leftRow}>
        {renderSlot(left1)}
        {renderSlot(left2)}
      </View>

      {/* center slot reserved for home */}
      <View style={styles.centerSlot}>
        {homeRoute ? (
          <TouchableOpacity
            onPress={() => navigation.navigate(homeRoute.name, homeRoute.params)}
            style={styles.homeButton}
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.95}
          >
            {getIconComponent(homeRoute.name, routes.indexOf(homeRoute) === state.index)}
          </TouchableOpacity>
        ) : (
          <View style={{ width: SLOT_WIDTH }} />
        )}
      </View>

      <View style={styles.rightRow}>
        {renderSlot(right1)}
        {renderSlot(right2)}
      </View>
    </View>
  );
};

const RadarActiveCircle = ({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => {
  // Render a circular container for the home icon. When active, show the green background; when inactive, show white with subtle border.
  return (
    <View style={[styles.homeCircle, isActive ? styles.homeCircleActive : styles.homeCircleInactive]}>
      <View style={isActive ? styles.homeInnerActive : styles.homeInnerInactive}>{children}</View>
    </View>
  );
};

// More robust normalization using regex to find known tab keys anywhere in the route name
const getIconComponent = (routeName: string, isFocused: boolean) => {
  const iconSize = 28;
  const iconOpacity = isFocused ? 1 : 0.6;

  const normalized = String(routeName).toLowerCase();
  const match = normalized.match(/(feed|explore|home|utils|profile)/);
  const base = match ? match[1] : normalized.split('/').pop() || normalized;

  const svgProps = { width: iconSize, height: iconSize } as any;

  switch (base) {
    case 'home':
      return (
        <RadarActiveCircle isActive={isFocused}>
          {/* Restore past size (51x51) and active translucent green background */}
          <MiddleIcon width={51} height={51} style={styles.homeIcon} fill={isFocused ? '#ffffff' : '#85CC16'} />
        </RadarActiveCircle>
      );
    case 'feed':
      return (
        <View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          {typeof Feed === 'function' ? <Feed {...svgProps} /> : <Ionicons name="list" size={iconSize} />}
        </View>
      );
    case 'explore':
      return (
        <View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          {typeof Explore === 'function' ? <Explore {...svgProps} /> : <Ionicons name="search" size={iconSize} />}
        </View>
      );
    case 'utils':
      return (
        <View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          {typeof Utils === 'function' ? <Utils {...svgProps} /> : <Ionicons name="settings" size={iconSize} />}
        </View>
      );
    case 'profile':
      return (
        <View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          {typeof Profile === 'function' ? <Profile {...svgProps} /> : <Ionicons name="person" size={iconSize} />}
        </View>
      );
    default:
      return (
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 8, color: 'red' }}>!</Text>
        </View>
      );
  }
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
      initialRouteName="home"
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="utils" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: width * 0.22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 32,
    shadowOpacity: 0.18,
    elevation: 24,
    paddingHorizontal: 14,
    overflow: 'visible',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '36%',
    paddingLeft: 0,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '36%',
    paddingRight: 6,
  },
  slot: {
    width: SLOT_WIDTH,
    height: SLOT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    width: SLOT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    // ensure center slot aligns vertically with other slots
    marginBottom: 0,
  },
  homeButton: {
    width: SLOT_WIDTH,
    height: SLOT_WIDTH,
    borderRadius: SLOT_WIDTH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    // remove translate so it's vertically centered with other icons
    transform: [],
    zIndex: 50,
  },
  homeCircle: {
    width: width * 0.14 + width * 0.04,
    height: width * 0.14 + width * 0.04,
    borderRadius: (width * 0.14 + width * 0.04) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.01,
  },
  homeInnerActive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeInnerInactive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeCircleActive: {
    backgroundColor: 'rgba(133,204,22,0.15)',
    padding: width * 0.01,
    borderRadius: (width * 0.14 + width * 0.04) / 2,
  },
  homeCircleInactive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideContainer: {
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sideContainerRight: {
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  homeIcon: {
    width: width * 0.14,
    height: width * 0.14,
  },
});