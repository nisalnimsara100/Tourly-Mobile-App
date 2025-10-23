import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../../app/_components/themed-text'

type Props = {
  name: string
  image?: string
  onPress?: () => void
}

export default function CityCard({ name, image, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.labelWrap}>
        <ThemedText style={styles.label}>{name}</ThemedText>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: '#e6e6e6' },
  labelWrap: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
})
