import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ThemedView } from '../../app/_components/themed-view'
import { IconSymbol } from '../../app/_components/ui/icon-symbol'

type Props = {
  placeholder?: string
  value?: string
  onChangeText?: (t: string) => void
}

export default function SearchBar({ placeholder = 'Search destinations', value, onChangeText }: Props) {
  return (
    <ThemedView style={styles.container} lightColor="#fff">
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <IconSymbol name="magnifyingglass" size={20} color="#8E8E93" />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <IconSymbol name="square.grid.2x2" size={20} color="#3B3B3B" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { paddingTop: 20, paddingHorizontal: 16, backgroundColor: 'transparent' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { marginLeft: 8, fontSize: 16, color: '#111' },
  filterButton: {
    marginLeft: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
})
