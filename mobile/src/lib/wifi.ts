import { Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

export interface WifiInfo {
  ssid: string | null;
  bssid: string | null;
}

/**
 * Reads the currently connected WiFi network's SSID (both platforms) and
 * BSSID (Android only for now — iOS's NEHotspotNetwork API does expose a
 * bssid field to third-party apps with the "Access WiFi Information"
 * entitlement + location permission, but the underlying native module here
 * (react-native-wifi-reborn) hasn't implemented reading it on iOS yet).
 *
 * Requires location permission to already be granted (both OSes tie WiFi
 * info to location privacy) — call `getCurrentLocation()` from `./location`
 * first so that permission prompt has already been resolved.
 *
 * Not available in Expo Go: this is a native module, only works in a custom
 * EAS development build.
 */
export async function getCurrentWifiInfo(): Promise<WifiInfo> {
  let ssid: string | null = null;
  let bssid: string | null = null;

  try {
    const rawSsid = await WifiManager.getCurrentWifiSSID();
    ssid = rawSsid && rawSsid !== '<unknown ssid>' ? rawSsid : null;
  } catch {
    ssid = null;
  }

  if (Platform.OS === 'android') {
    try {
      bssid = await WifiManager.getBSSID();
    } catch {
      bssid = null;
    }
  }

  return { ssid, bssid };
}
