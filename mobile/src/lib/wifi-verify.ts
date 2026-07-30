import type { Branch } from '../types';
import type { WifiInfo } from './wifi';

export interface WifiVerification {
  /** Whether check-in/out is allowed to proceed. */
  matched: boolean;
  message: string;
}

/**
 * Compares the device's live-read WiFi against the branch's registered
 * office WiFi. SSID must match when the branch has one configured; BSSID is
 * cross-checked as an extra anti-spoofing layer only when both sides have a
 * value (currently Android only, since `wifi.ts` doesn't read BSSID on iOS
 * yet — see its doc comment) — that check is simply skipped when either side
 * has no BSSID, rather than failing it.
 *
 * A branch with no WiFi configured at all always passes (nothing to verify
 * against yet), so this only starts blocking once an admin sets it up.
 */
export function verifyWifi(branch: Branch, wifi: WifiInfo): WifiVerification {
  if (!branch.wifiSsid) {
    return { matched: true, message: 'Chi nhánh chưa cấu hình WiFi chấm công' };
  }

  if (!wifi.ssid) {
    return { matched: false, message: 'Không đọc được WiFi trên thiết bị — hãy kiểm tra kết nối' };
  }

  if (wifi.ssid !== branch.wifiSsid) {
    return {
      matched: false,
      message: `Đang ở WiFi "${wifi.ssid}", cần kết nối "${branch.wifiSsid}"`,
    };
  }

  if (branch.wifiBssid && wifi.bssid && wifi.bssid.toLowerCase() !== branch.wifiBssid.toLowerCase()) {
    return { matched: false, message: 'BSSID không khớp với WiFi chi nhánh đã đăng ký' };
  }

  return { matched: true, message: `Đúng WiFi chi nhánh (${branch.wifiSsid})` };
}
