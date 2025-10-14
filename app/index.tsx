import { useRouter } from 'expo-router';
import { Button, StyleSheet, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button title="Go to Onboard" onPress={() => router.push('/screens/Onboard')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});