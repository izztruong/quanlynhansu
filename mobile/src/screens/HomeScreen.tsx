import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api-client';
import { useTodayAttendance } from '../lib/use-today-attendance';
import { GreetingHeader } from '../components/GreetingHeader';
import { FeatureCard } from '../components/FeatureCard';
import { EmptyState } from '../components/EmptyState';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { News } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function currentPayPeriodLabel() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${fmt(start)}-${fmt(end)}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getCheckInCardContent({
  openSession,
  lastCompleted,
}: Pick<ReturnType<typeof useTodayAttendance>, 'openSession' | 'lastCompleted'>) {
  if (openSession?.checkIn) {
    return {
      icon: '🕐',
      title: 'Check-out',
      subtitle: `Đã check-in lúc ${formatTime(openSession.checkIn)} — bấm để kết thúc ca`,
    };
  }
  if (lastCompleted?.checkIn && lastCompleted.checkOut) {
    return {
      icon: '👆',
      title: 'Chấm công',
      subtitle: `Lần gần nhất: ${formatTime(lastCompleted.checkIn)} - ${formatTime(lastCompleted.checkOut)}`,
    };
  }
  return { icon: '👆', title: 'Chấm công', subtitle: 'để bắt đầu công việc thôi nào!' };
}

const BOTTOM_TABS = [
  { key: 'home', label: 'Trang chủ', icon: '🏠', active: true },
  { key: 'tasks', label: 'Tác vụ', icon: '📋', active: false },
  { key: 'messages', label: 'Tin nhắn', icon: '💬', active: false },
  { key: 'account', label: 'Tài khoản', icon: '👤', active: false },
];

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [newsCount, setNewsCount] = useState<number | null>(null);
  const { openSession, lastCompleted, refresh: refreshAttendance } = useTodayAttendance();

  useFocusEffect(
    useCallback(() => {
      refreshAttendance();
    }, [refreshAttendance])
  );

  const checkInCard = getCheckInCardContent({ openSession, lastCompleted });

  useEffect(() => {
    if (!user) return;
    api
      .get<News[]>('/news')
      .then((items) => {
        const relevant = items.filter(
          (n) =>
            n.status === 'ACTIVE' &&
            (!n.branch || n.branch.id === user.branch.id) &&
            (!n.department || n.department.id === user.department.id)
        );
        setNewsCount(relevant.length);
      })
      .catch(() => setNewsCount(0));
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GreetingHeader user={user} />

        <View style={styles.content}>
          <Pressable style={styles.checkInCard} onPress={() => navigation.navigate('Attendance')}>
            <View style={styles.checkInIconWrap}>
              <Text style={styles.checkInIcon}>{checkInCard.icon}</Text>
            </View>
            <View style={styles.checkInTextWrap}>
              <Text style={styles.checkInTitle}>{checkInCard.title}</Text>
              <Text style={styles.checkInSubtitle}>{checkInCard.subtitle}</Text>
            </View>
          </Pressable>

          <View style={styles.grid}>
            <FeatureCard icon="💼" title="Lịch làm việc" subtitle="Đổi ca/ Nhờ làm thay" />
            <FeatureCard icon="🏖️" title="Đăng ký nghỉ" subtitle="Nghỉ ngày/ Nghỉ ca" />
            <FeatureCard
              icon="💰"
              title={`Kỳ lương (${currentPayPeriodLabel()})`}
              subtitle="0 đ"
            />
            <FeatureCard
              icon="📰"
              title="Bảng tin"
              subtitle={newsCount === null ? 'Đang tải...' : `Đang có ${newsCount} tin tức`}
            />
          </View>

          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Công việc cần làm</Text>
            <Text style={styles.tasksHistoryLink}>Xem lịch sử</Text>
          </View>
          <EmptyState message="Chưa có công việc cần làm" />
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {BOTTOM_TABS.map((tab) => (
          <View key={tab.key} style={styles.tabItem}>
            <Text style={[styles.tabIcon, tab.active && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 20, marginTop: -16 },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#4338CA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  checkInTextWrap: { flex: 1 },
  checkInIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInIcon: { fontSize: 24 },
  checkInTitle: { color: '#fff', fontSize: 19, fontWeight: '700' },
  checkInSubtitle: { color: '#E0E7FF', fontSize: 13, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  tasksTitle: { fontSize: 19, fontWeight: '700', color: '#111827' },
  tasksHistoryLink: { color: '#4338CA', fontSize: 13, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { color: '#4338CA', fontWeight: '700' },
});
