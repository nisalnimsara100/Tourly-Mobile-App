import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// navigation not wired yet

const { width } = Dimensions.get('window');

export default function SocialPage() {

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <TouchableOpacity
          style={styles.socialButton}
          activeOpacity={0.8}
          onPress={() => {
            // placeholder - wire navigation here when route is known
            console.log('Social button pressed');
          }}
        >
          <FontAwesome5 name="users" size={width * 0.06} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Social</Text>
          <Text style={styles.subtitle}>Connect with friends nearby</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>This page is a placeholder for the social UI.</Text>
        <Text style={styles.hint}>Top button shows the users icon (tap to open social area).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topArea: { paddingTop: 44, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#000', flexDirection: 'row', alignItems: 'center' },
  socialButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#85cc16', alignItems: 'center', justifyContent: 'center' },
  titleWrap: { marginLeft: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#ddd', fontSize: 12, marginTop: 2 },
  content: { padding: 20 },
  placeholder: { fontSize: 16, color: '#333', marginBottom: 8 },
  hint: { fontSize: 13, color: '#666' },
});
