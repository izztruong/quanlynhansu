import * as Location from 'expo-location';

export interface Coordinates {
  lat: number;
  lng: number;
}

export async function getCurrentLocation(): Promise<Coordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}

export function mapsUrl({ lat, lng }: Coordinates) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
