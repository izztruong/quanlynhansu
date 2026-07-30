import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/auth-context';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#7C3AED']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.logoArea}>
          <Text style={styles.logo}>HRM</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ban@hrm.local"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Text style={styles.toggleText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.loginButton} onPress={handleLogin} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </Pressable>

          <Text style={styles.forgotText}>Quên mật khẩu</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
          </Pressable>

          <Text style={styles.registerText}>
            Bạn chưa có tài khoản? <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoArea: { alignItems: 'center', paddingTop: 72, paddingBottom: 32 },
  logo: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: 2 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  toggleText: { color: '#4338CA', fontSize: 13, fontWeight: '600' },
  error: { color: '#DC2626', fontSize: 13, marginBottom: 12 },
  loginButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  forgotText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    marginTop: 16,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { color: '#9CA3AF', fontSize: 12 },
  googleButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  googleButtonText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  registerText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    marginTop: 24,
  },
  registerLink: { color: '#4338CA', fontWeight: '700' },
});
