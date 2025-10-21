import { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Update {
  id: string;
  type: 'alert' | 'event' | 'info' | 'weather';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

// Sample data - In production, this would come from Firebase
const sampleUpdates: Update[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Festival Season Travel Advisory',
    message: 'Expect increased traffic and accommodation prices during Vesak celebrations next week. Book your stays in advance.',
    timestamp: new Date(),
    priority: 'high'
  },
  {
    id: '2',
    type: 'weather',
    title: 'Weather Alert: Heavy Rain',
    message: 'Heavy rainfall expected in the Central and Southern provinces over the next 48 hours. Plan indoor activities.',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    priority: 'high'
  },
  {
    id: '3',
    type: 'event',
    title: 'Perahera Festival Tonight',
    message: "Don't miss the spectacular Kandy Esala Perahera tonight at 7 PM. Best viewing spots along D.S. Senanayake Street.",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    priority: 'medium'
  },
  {
    id: '4',
    type: 'info',
    title: 'New Train Schedule',
    message: 'Updated train schedules for Colombo-Kandy route now available. Check the Transport section for details.',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    priority: 'low'
  }
];

const getIconName = (type: Update['type']) => {
  switch (type) {
    case 'alert':
      return 'warning';
    case 'event':
      return 'calendar';
    case 'info':
      return 'information-circle';
    case 'weather':
      return 'partly-sunny';
    default:
      return 'information-circle';
  }
};

const getTypeColor = (type: Update['type']) => {
  switch (type) {
    case 'alert':
      return '#ff6b6b';
    case 'event':
      return '#4dabf7';
    case 'info':
      return '#51cf66';
    case 'weather':
      return '#ffd43b';
    default:
      return '#868e96';
  }
};

const getPriorityIndicator = (priority: Update['priority']) => {
  switch (priority) {
    case 'high':
      return styles.highPriority;
    case 'medium':
      return styles.mediumPriority;
    case 'low':
      return styles.lowPriority;
    default:
      return styles.lowPriority;
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'Just now';
};

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [updates, setUpdates] = useState<Update[]>(sampleUpdates);

  const onRefresh = async () => {
    setRefreshing(true);
    // In production, fetch new updates here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderUpdate = ({ item }: { item: Update }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]}>
          <Ionicons name={getIconName(item.type)} size={20} color="white" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <View style={[styles.priorityDot, getPriorityIndicator(item.priority)]} />
      </View>
      <Text style={styles.message}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Updates</Text>
        <Text style={styles.headerSubtitle}>Stay informed about local news and events</Text>
      </View>

      <FlatList
        data={updates}
        renderItem={renderUpdate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  highPriority: {
    backgroundColor: '#ff6b6b',
  },
  mediumPriority: {
    backgroundColor: '#ffd43b',
  },
  lowPriority: {
    backgroundColor: '#51cf66',
  },
});