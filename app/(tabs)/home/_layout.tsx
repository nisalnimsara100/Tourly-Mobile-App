import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}