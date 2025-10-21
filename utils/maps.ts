import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export const openMapsWithDirections = async (destination: { latitude: number; longitude: number }) => {
  try {
    // Get current location for iOS starting point
    let startCoords = '';
    if (Platform.OS === 'ios') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        startCoords = `${location.coords.latitude},${location.coords.longitude}`;
      }
    }

    const url = Platform.select({
      // For iOS, use saddr (source address) if we have permission, otherwise let Maps ask for it
      ios: startCoords 
        ? `maps://app?saddr=${startCoords}&daddr=${destination.latitude},${destination.longitude}&dirflg=d`
        : `maps://app?daddr=${destination.latitude},${destination.longitude}&dirflg=d`,
      // For Android, use Google Maps navigation
      android: `google.navigation:q=${destination.latitude},${destination.longitude}`
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web URL
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}${startCoords ? `&origin=${startCoords}` : ''}`;
        await Linking.openURL(webUrl);
      }
    }
  } catch (err) {
    console.error('Error opening maps:', err);
    // Fallback to basic Google Maps URL without directions
    const basicUrl = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    await Linking.openURL(basicUrl);
  }
};