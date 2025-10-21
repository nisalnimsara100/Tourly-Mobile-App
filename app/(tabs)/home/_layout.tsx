// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

// This file explicitly tells Expo Router to use a Stack Navigator 
// for all screens inside the 'home' folder.
export default function HomeStackLayout() {
  return (
    <Stack>
      {/* The index.tsx screen is the base screen */}
      <Stack.Screen name="index" options={{ title: 'Home Feed' }} />
      
      {/* The post_details.tsx screen is pushed on top */}
      <Stack.Screen name="post_details" options={{ title: 'Post Details' }} />
    </Stack>
  );
}