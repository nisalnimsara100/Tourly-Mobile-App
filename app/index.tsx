import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const IndexPage = () => {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Welcome' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Welcome to Tourly!</Text>
        <Button title="Go to Tabs" onPress={() => router.push('/(tabs)/home')} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
});

export default IndexPage;