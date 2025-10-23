import React from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import SearchBar from '../../components/ui/SearchBar'

export default function Explore() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <SearchBar />
      </View>
      <View style={styles.body} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: 'transparent' },
  body: { flex: 1, padding: 16 },
})
