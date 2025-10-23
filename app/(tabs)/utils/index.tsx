import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface UtilityItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const utilities: UtilityItem[] = [
  {
    id: 'currency',
    title: 'Currency Converter',
    description: 'Convert between LKR and other major currencies (USD, EUR, etc.)',
    icon: 'cash-outline',
    route: '/(tabs)/utils/currency'
  },
  {
    id: 'emergency',
    title: 'Emergency Contacts',
    description: 'Quick access to important phone numbers and emergency services',
    icon: 'call-outline',
    route: '/(tabs)/utils/emergency'
  },
  {
    id: 'phrases',
    title: 'Essential Phrases',
    description: 'Common Sinhala and Tamil phrases with pronunciation',
    icon: 'language-outline',
    route: '/(tabs)/utils/phrases'
  },
  {
    id: 'transport',
    title: 'Transport Guide',
    description: 'Public transport info, taxi services, and tuk-tuk fare calculator',
    icon: 'bus-outline',
    route: '/(tabs)/utils/transport'
  },
  {
    id: 'weather',
    title: 'Weather Updates',
    description: 'Local weather forecasts and monsoon season information',
    icon: 'partly-sunny-outline',
    route: '/(tabs)/utils/weather'
  },
  {
    id: 'customs',
    title: 'Cultural Tips',
    description: "Essential dos and don'ts, cultural norms, and temple etiquette",
    icon: 'information-circle-outline',
    route: '/(tabs)/utils/customs'
  }
];

export default function UtilsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Travel Utilities</Text>
        <Text style={styles.headerSubtitle}>Essential tools for visitors to Sri Lanka</Text>
      </View>

      <View style={styles.content}>
        {utilities.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={item.icon} size={24} color="#85CC16" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3FFDF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});