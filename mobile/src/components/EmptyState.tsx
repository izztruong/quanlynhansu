import { StyleSheet, Text, View } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.flag}>🚩</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 32 },
  flag: { fontSize: 48, marginBottom: 12 },
  message: { color: '#9CA3AF', fontSize: 13 },
});
