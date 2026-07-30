import { Pressable, StyleSheet, Text, View } from 'react-native';

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function FeatureCard({ icon, title, subtitle, onPress }: FeatureCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#E5E7EB' }}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: { fontSize: 28, marginBottom: 10 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#9CA3AF' },
});
