import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { useTodayAttendance } from '../lib/use-today-attendance';
import { getCurrentLocation, mapsUrl, type Coordinates } from '../lib/location';
import { getCurrentWifiInfo, type WifiInfo } from '../lib/wifi';
import { verifyWifi } from '../lib/wifi-verify';
import { SelectField } from '../components/SelectField';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Schedule } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Attendance'>;

const AD_HOC_VALUE = '__AD_HOC__';

function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function InfoBlock({
  wifi,
  location,
  verification,
}: {
  wifi: WifiInfo;
  location: Coordinates | null;
  verification: { matched: boolean; message: string } | null;
}) {
  return (
    <>
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📶</Text>
          <Text style={styles.detailLabel}>Tên WiFi</Text>
          <Text style={styles.detailValue}>{wifi.ssid ?? 'Chưa khả dụng'}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>{'</>'}</Text>
          <Text style={styles.detailLabel}>Mã BSSID</Text>
          <Text style={styles.detailValue}>{wifi.bssid ?? 'Chưa khả dụng'}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailLabel}>Vị trí</Text>
          {location ? (
            <Pressable onPress={() => Linking.openURL(mapsUrl(location))}>
              <Text style={styles.detailLink}>Xem trên bản đồ</Text>
            </Pressable>
          ) : (
            <Text style={styles.detailValue}>Đang lấy vị trí...</Text>
          )}
        </View>
      </View>

      {verification && (
        <View style={styles.verifyRow}>
          <Text style={styles.verifyIcon}>{verification.matched ? '✅' : '⛔'}</Text>
          <Text style={[styles.verifyText, verification.matched && styles.verifyTextOk]}>
            {verification.message}
          </Text>
        </View>
      )}
    </>
  );
}

export function AttendanceModal({ navigation }: Props) {
  const { user } = useAuth();
  const { openSession, loading: loadingAttendance, refresh } = useTodayAttendance();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(AD_HOC_VALUE);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [wifi, setWifi] = useState<WifiInfo>({ ssid: null, bssid: null });
  const [wifiChecked, setWifiChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const verification = user && wifiChecked ? verifyWifi(user.branch, wifi) : null;
  const blockedByWifi = verification !== null && !verification.matched;

  const mode: 'checkin' | 'checkout' = openSession ? 'checkout' : 'checkin';

  useEffect(() => {
    if (!user || mode !== 'checkin') return;
    const today = todayIso();
    api
      .get<Schedule[]>(`/schedules?from=${today}&to=${today}&employeeId=${user.id}`)
      .then((data) => {
        setSchedules(data);
        if (data.length > 0) setSelectedShiftId(data[0].shift.id);
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoadingSchedules(false));
  }, [user, mode]);

  useEffect(() => {
    getCurrentLocation().then(setLocation);
    getCurrentWifiInfo()
      .then(setWifi)
      .finally(() => setWifiChecked(true));
  }, []);

  const handleCheckIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await api.post('/attendance/check-in', {
        shiftId: selectedShiftId === AD_HOC_VALUE ? undefined : selectedShiftId,
        lat: location?.lat,
        lng: location?.lng,
        wifiSsid: wifi.ssid ?? undefined,
        wifiBssid: wifi.bssid ?? undefined,
      });
      await refresh();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chấm công thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setSubmitting(true);
    try {
      await api.post('/attendance/check-out');
      await refresh();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chấm công ra thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAttendance) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#4338CA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'checkin' ? 'Check-in ca làm việc' : 'Check-out ca làm việc'}
          </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>

        {mode === 'checkin' && (
          <>
            <Text style={styles.label}>Chọn ca làm việc</Text>
            {loadingSchedules ? (
              <ActivityIndicator style={styles.pickerLoading} />
            ) : (
              <SelectField
                value={selectedShiftId}
                onChange={setSelectedShiftId}
                options={[
                  ...schedules.map((s) => ({ label: s.shift.name, value: s.shift.id })),
                  { label: 'Ca phát sinh', value: AD_HOC_VALUE },
                ]}
              />
            )}
            {selectedShiftId === AD_HOC_VALUE && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>ⓘ</Text>
                <Text style={styles.infoText}>
                  Ca phát sinh là ca chưa được quản lý xếp lịch trước đó
                </Text>
              </View>
            )}
          </>
        )}

        {mode === 'checkout' && openSession?.checkIn && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Ca đang làm</Text>
            <Text style={styles.summaryValue}>{openSession.shift?.name ?? 'Ca phát sinh'}</Text>
            <Text style={styles.summaryLabel}>Check-in lúc</Text>
            <Text style={styles.summaryValue}>{formatTime(openSession.checkIn)}</Text>
          </View>
        )}

        <InfoBlock wifi={wifi} location={location} verification={verification} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.confirmButton, blockedByWifi && styles.confirmButtonDisabled]}
          onPress={mode === 'checkin' ? handleCheckIn : handleCheckOut}
          disabled={submitting || !wifiChecked || blockedByWifi}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {!wifiChecked ? 'Đang kiểm tra WiFi...' : 'Đồng ý'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  closeIcon: { fontSize: 20, color: '#6B7280' },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  pickerLoading: { paddingVertical: 16 },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'flex-start' },
  infoIcon: { color: '#6B7280' },
  infoText: { color: '#6B7280', fontSize: 12, flex: 1 },
  summaryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  summaryLabel: { fontSize: 12, color: '#6366F1', marginTop: 8 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  detailIcon: { width: 20, textAlign: 'center', color: '#6B7280' },
  detailLabel: { flex: 1, fontSize: 14, color: '#374151' },
  detailValue: { fontSize: 14, color: '#6B7280' },
  detailLink: { fontSize: 14, color: '#4338CA', fontWeight: '600' },
  detailDivider: { height: 1, backgroundColor: '#E5E7EB' },
  verifyRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-start' },
  verifyIcon: { fontSize: 14 },
  verifyText: { color: '#DC2626', fontSize: 13, flex: 1, fontWeight: '600' },
  verifyTextOk: { color: '#059669' },
  error: { color: '#DC2626', fontSize: 13, marginTop: 16, textAlign: 'center' },
  footer: { padding: 20 },
  confirmButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonDisabled: { backgroundColor: '#9CA3AF' },
  confirmButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
