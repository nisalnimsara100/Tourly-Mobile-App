/* eslint-disable import/no-unresolved */
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

// The special home icon with the green background
const homeIconSvg = require('@/assets/images/tabbar/middleIcon.svg');

// Colors for the tab icons
const ACTIVE_COLOR = '#000000';
const INACTIVE_COLOR = '#8E8E93';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const MyTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconComponent = getIconComponent(route.name, isFocused);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}>
            {iconComponent}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Helper function to get the icon component
const getIconComponent = (routeName: string, isFocused: boolean) => {
  const iconStyle = { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR };

  switch (routeName) {
    case 'Home':
      return <Image source={homeIconSvg} style={styles.homeIcon} />; // Changed to SVG
    case 'Search':
      return <IconSymbol name="magnifyingglass" size={28} {...iconStyle} />;
    case 'Favorite':
      return <IconSymbol name="heart" size={28} {...iconStyle} />;
    case 'Utilities':
      return <IconSymbol name="square.grid.2x2" size={28} {...iconStyle} />;
    case 'Profile':
      return <IconSymbol name="person" size={28} {...iconStyle} />;
    default:
      return null;
  }
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Search" />
      <Tabs.Screen name="Favorite" />
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="Utilities" />
      <Tabs.Screen name="Profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: width * 0,
    right: width * 0,
    height: width * 0.23,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: width * 0.5, 
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02, 
  },
  homeIcon: {
    width: width * 0.14, 
    height: width * 0.14, 
    transform: [{ translateY: 0 }],
  },
});