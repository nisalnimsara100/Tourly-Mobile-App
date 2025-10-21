import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
import MiddleIcon from '../assets/images/tabbar/middleIcon.svg';
import Vector from '../assets/images/tabbar/vector.svg';
import Vector1 from '../assets/images/tabbar/vector1.svg';
import Vector2 from '../assets/images/tabbar/vector2.svg';
import Vector3 from '../assets/images/tabbar/vector3.svg';

// Colors for the tab icons
const ACTIVE_COLOR = '#85CC16';
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

const RadarActiveCircle = ({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => {
  if (!isActive) return <>{children}</>; // Render only the children when not active

  return (
    <View style={styles.homeIconContainer}>
      <View style={[styles.homeIconActive, { backgroundColor: 'rgba(133,204,22,0.15)' }]}> 
        {children}
      </View>
    </View>
  );
};

// Helper function to get the icon component
const getIconComponent = (routeName: string, isFocused: boolean) => {
  const iconSize = 28;
  const iconColor = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
  
  // Extract the base route name (remove /index if present)
  const baseRouteName = routeName.includes('/') ? routeName.split('/')[0] : routeName;

  switch (baseRouteName) {
    case 'home':
      return (
        <RadarActiveCircle isActive={isFocused}>
          <MiddleIcon width={51} height={51} style={styles.homeIcon} />
        </RadarActiveCircle>
      );
    case 'search':
      return (
        <View style={styles.iconContainer}>
          <Vector width={iconSize} height={iconSize} fill={iconColor} />
        </View>
      );
    case 'favorite':
      return (
        <View style={styles.iconContainer}>
          <Vector1 width={iconSize} height={iconSize} fill={iconColor} />
        </View>
      );
    case 'utilities':
      return (
        <View style={styles.iconContainer}>
          <Vector2 width={iconSize} height={iconSize} fill={iconColor} />
        </View>
      );
    case 'profile':
      return (
        <View style={styles.iconContainer}>
          <Vector3 width={iconSize} height={iconSize} fill={iconColor} />
        </View>
      );
    default:
      return (
        <Text style={{ fontSize: 8, color: 'red' }}>Unknown: {routeName}</Text>
      );
  }
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
      initialRouteName="home"
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="search" />
      <Tabs.Screen name="favorite" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="utilities" />
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    width: width * 0.14, 
    height: width * 0.14, 
    transform: [{ translateY: 0 }],
  },
  homeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.01, 
  },
  homeIconActive: {
    backgroundColor: 'rgba(133, 204, 22, 0.15)', 
    borderRadius: (width * 0.14 + width * 0.04) / 1, 
    padding: width * 0.015, 
  },
});