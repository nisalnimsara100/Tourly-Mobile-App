import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import '../../global.css'
const Home = () => {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Button title="Go to Onboard" onPress={() => router.push('/screens/Onboard')} />
    </View>
  )
}

export default Home
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
})