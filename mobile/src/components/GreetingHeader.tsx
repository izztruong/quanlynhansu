import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { Employee } from '../types';

function getGreeting(hour: number) {
  if (hour < 11) return { text: 'Chào buổi sáng', colors: ['#60A5FA', '#FDE68A'] as const };
  if (hour < 18) return { text: 'Chào buổi chiều', colors: ['#7C3AED', '#F97316'] as const };
  return { text: 'Chào buổi tối', colors: ['#1E1B4B', '#4338CA'] as const };
}

export function GreetingHeader({ user }: { user: Employee }) {
  const { text, colors } = getGreeting(new Date().getHours());

  return (
    <LinearGradient colors={colors} style={styles.container}>
      <Text style={styles.greeting}>{text}</Text>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Bộ phận {user.department.name}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.subtitle}>Chúc bạn một ngày làm việc hiệu quả</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  subtitle: { color: '#fff', fontSize: 14, marginTop: 20, opacity: 0.9 },
});
